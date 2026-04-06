import { auth } from "@/auth";
import { prisma } from "@/server/prisma";
import { NextResponse } from "next/server";

type ButtonInput = {
  label?: string;
  responseText?: string;
  enabled?: boolean;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ botId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { botId } = await params;
  const bot = await prisma.project.findFirst({
    where: { id: botId, ownerId: session.user.id },
    select: { id: true },
  });
  if (!bot) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buttons = await prisma.botButton.findMany({
    where: { projectId: bot.id },
    orderBy: { order: "asc" },
    select: { order: true, label: true, responseText: true, enabled: true },
  });

  return NextResponse.json({ buttons });
}

export async function PUT(
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
    select: { id: true },
  });
  if (!bot) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as
    | { buttons?: ButtonInput[] }
    | null;

  const input = body?.buttons ?? [];
  if (!Array.isArray(input) || input.length > 4) {
    return NextResponse.json(
      { error: "Можно максимум 4 кнопки" },
      { status: 400 },
    );
  }

  const sanitized = input
    .map((b) => ({
      label: (b.label ?? "").trim(),
      responseText: (b.responseText ?? "").trim(),
      enabled: b.enabled ?? true,
    }))
    .filter((b) => b.label.length > 0 || b.responseText.length > 0)
    .slice(0, 4);

  for (const b of sanitized) {
    if (b.label.length < 1 || b.label.length > 30) {
      return NextResponse.json(
        { error: "Label должен быть 1–30 символов" },
        { status: 400 },
      );
    }
    if (b.responseText.length < 1 || b.responseText.length > 2000) {
      return NextResponse.json(
        { error: "Ответ должен быть 1–2000 символов" },
        { status: 400 },
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.botButton.deleteMany({ where: { projectId: bot.id } });
    if (sanitized.length) {
      await tx.botButton.createMany({
        data: sanitized.map((b, idx) => ({
          projectId: bot.id,
          order: idx + 1,
          label: b.label,
          responseText: b.responseText,
          enabled: b.enabled,
        })),
      });
    }
  });

  return NextResponse.json({ ok: true });
}

