import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function BotsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-14">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Боты
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Минимальный бот по документации: создаёшь бота → вставляешь текст →
          задаёшь вопросы.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href="/bots/new"
          className="inline-flex w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Создать бота
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-200"
        >
          Назад в кабинет
        </Link>
      </div>

      <div className="mt-10 rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
        <p className="font-medium">Что дальше</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            После создания бота откроется страница загрузки документации и теста
            вопросов.
          </li>
          <li>
            Если не настроен <span className="font-mono">OPENAI_API_KEY</span>,
            ответы будут в виде цитат, чтобы было понятно как работает
            поиск-источников.
          </li>
        </ul>
      </div>
    </div>
  );
}

