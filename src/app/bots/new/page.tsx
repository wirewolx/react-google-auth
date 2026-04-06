import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreateBotForm } from "./ui";

export default async function NewBotPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-14">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Создать бота
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Бот будет отвечать только по документации, которую ты добавишь.
        </p>
      </header>

      <div className="mt-8">
        <CreateBotForm />
      </div>
    </div>
  );
}

