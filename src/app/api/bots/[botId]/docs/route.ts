import { auth } from "@/auth";
import { prisma } from "@/server/prisma";
import { chunkText } from "@/server/rag";
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
    select: { id: true, name: true },
  });
  if (!bot) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as
    | { title?: string; text?: string }
    | null;

  const title = body?.title?.trim() || "Документация";
  const text = body?.text?.trim() || "";
  if (text.length < 20) {
    return NextResponse.json(
      { error: "Документация слишком короткая" },
      { status: 400 },
    );
  }

  const source = await prisma.source.create({
    data: {
      projectId: bot.id,
      kind: "docs",
      title,
      pages: {
        create: chunkText(text).map((content, idx) => ({
          slug: `chunk-${idx + 1}`,
          title: `${title} — chunk ${idx + 1}`,
          content,
        })),
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ sourceId: source.id }, { status: 201 });
}

