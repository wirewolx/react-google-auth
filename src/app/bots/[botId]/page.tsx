import { auth } from "@/auth";
import { prisma } from "@/server/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ButtonsEditor } from "./buttons-ui";
import { BotPlayground } from "./ui";

export default async function BotPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const { botId } = await params;
  const bot = await prisma.project.findFirst({
    where: { id: botId, ownerId: session.user.id },
    select: { id: true, name: true, description: true, createdAt: true },
  });

  if (!bot) redirect("/bots");

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {bot.name}
          </h1>
          <Link
            href="/bots"
            className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-200"
          >
            Все боты
          </Link>
        </div>
        {bot.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {bot.description}
          </p>
        )}
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            1) Добавь документацию
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Вставь текст. Мы разобьём его на куски и будем искать релевантные
            фрагменты при каждом вопросе.
          </p>
          <BotPlayground botId={bot.id} mode="docs" />
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            2) Тест вопросов
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Ответ будет строго из документации. Если не задан{" "}
            <span className="font-mono">OPENAI_API_KEY</span> — покажем цитаты.
          </p>
          <BotPlayground botId={bot.id} mode="ask" />
        </section>
      </div>

      <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          3) Кнопки (FAQ)
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Настрой 1–4 кнопки для самых частых вопросов. Позже мы сможем
          показывать их в WhatsApp как interactive buttons.
        </p>
        <ButtonsEditor botId={bot.id} />
      </section>
    </div>
  );
}

