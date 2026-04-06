import { auth } from "@/auth";
import { prisma } from "@/server/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bots = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, description: true, createdAt: true },
  });

  return NextResponse.json({ bots });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { name?: string; description?: string }
    | null;

  const name = body?.name?.trim();
  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  const bot = await prisma.project.create({
    data: {
      ownerId: session.user.id,
      name,
      description: body?.description?.trim() || null,
    },
    select: { id: true, name: true, description: true, createdAt: true },
  });

  return NextResponse.json({ bot }, { status: 201 });
}

