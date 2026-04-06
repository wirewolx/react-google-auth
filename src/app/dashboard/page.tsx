import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { logout } from "./actions";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const { id, name, email, image } = session.user;

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col gap-8 px-6 py-16">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Личный кабинет
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Идентификатор выдан сервером из сессии (не из localStorage).
        </p>
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              User ID (Google sub)
            </dt>
            <dd className="mt-1 break-all font-mono text-zinc-900 dark:text-zinc-100">
              {id}
            </dd>
          </div>
          {name && (
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">Имя</dt>
              <dd className="mt-1 text-zinc-900 dark:text-zinc-100">{name}</dd>
            </div>
          )}
          {email && (
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Email
              </dt>
              <dd className="mt-1 text-zinc-900 dark:text-zinc-100">{email}</dd>
            </div>
          )}
        </dl>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="mt-6 h-16 w-16 rounded-full border border-zinc-200 dark:border-zinc-700"
          />
        )}
      </section>

      <form action={logout}>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Выйти
        </button>
      </form>
    </div>
  );
}
