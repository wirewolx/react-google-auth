import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Пример защищённого API: данные пользователя только из серверной сессии.
 * Клиент не хранит токены — только cookie, которую читает сервер.
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
  });
}
