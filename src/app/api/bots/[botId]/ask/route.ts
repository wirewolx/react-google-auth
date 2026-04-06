import { auth } from "@/auth";
import { prisma } from "@/server/prisma";
import { getOpenAIClient } from "@/server/openai";
import { scoreByOverlap } from "@/server/rag";
import { APIError } from "openai";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ botId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { botId } = await params;
  const bot = await prisma.project.findFirst({
    where: { id: botId, ownerId: session.user.id },
    select: { id: true, name: true, description: true },
  });
  if (!bot) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as
    | { question?: string }
    | null;
  const question = body?.question?.trim() || "";
  if (question.length < 2) {
    return NextResponse.json({ error: "Invalid question" }, { status: 400 });
  }

  const pages = await prisma.sourcePage.findMany({
    where: {
      source: {
        projectId: bot.id,
        kind: "docs",
      },
    },
    select: {
      id: true,
      title: true,
      content: true,
      source: { select: { title: true } },
    },
    take: 2000,
  });

  const ranked = pages
    .map((p) => ({ p, s: scoreByOverlap(question, p.content) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 5);

  if (ranked.length === 0) {
    return NextResponse.json({
      answer:
        "В вашей документации не нашёлся релевантный фрагмент. Добавьте больше текста или задайте вопрос иначе.",
      citations: [],
      mode: "retrieval-only",
    });
  }

  const context = ranked
    .map(
      ({ p }, i) =>
        `### Источник ${i + 1}: ${p.source.title} / ${p.title}\n${p.content}`,
    )
    .join("\n\n");

  const openai = getOpenAIClient();
  if (!openai) {
    // Без LLM: показываем, какие куски использовали, и короткий "ответ" из цитат.
    return NextResponse.json({
      answer:
        "LLM не настроен (нет `OPENAI_API_KEY`). Ниже фрагменты документации, по которым можно ответить:",
      citations: ranked.map(({ p }) => ({
        sourceTitle: p.source.title,
        pageTitle: p.title,
        excerpt: p.content.slice(0, 400),
      })),
      mode: "citations-only",
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            `Ты бот "${bot.name}". Отвечай строго и только на основе предоставленной документации.\n` +
            `Если в документации нет ответа, скажи: "В документации этого нет." и предложи что добавить.\n` +
            `Не выдумывай.`,
        },
        { role: "system", content: `Документация:\n\n${context}` },
        { role: "user", content: question },
      ],
    });

    const answer =
      completion.choices[0]?.message?.content?.trim() ||
      "Не удалось получить ответ.";

    return NextResponse.json({
      answer,
      citations: ranked.map(({ p }) => ({
        sourceTitle: p.source.title,
        pageTitle: p.title,
      })),
      mode: "llm+r",
    });
  } catch (err: unknown) {
    console.error("[ask] OpenAI", err);
    let message = "Не удалось получить ответ от модели.";
    let detail = err instanceof Error ? err.message : String(err);
    let status = 502;

    if (err instanceof APIError) {
      detail = err.message;
      if (err.status === 401)
        message = "OpenAI: неверный или отозванный API-ключ.";
      else if (err.status === 403)
        message =
          "OpenAI: доступ к модели запрещён (проверьте разрешённые модели в Project limits).";
      else if (err.status === 429)
        message =
          "OpenAI: слишком много запросов (rate limit). Подождите и повторите.";
      else if (err.status === 400)
        message =
          "OpenAI: неверный запрос (модель недоступна или неверное имя модели).";
      else if (err.status === 402 || /insufficient_quota|billing/i.test(detail))
        message = "OpenAI: нет средств на счёте или биллинг не настроен.";
      if (typeof err.status === "number" && err.status >= 400 && err.status < 600)
        status = err.status;
    }

    return NextResponse.json({ error: message, detail }, { status });
  }
}

