import { auth } from "@/auth";
import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/dashboard";

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-50 px-6 py-24 dark:bg-zinc-950">
      <main className="w-full max-w-md text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Вход через Google
        </h1>
        <p className="mt-3 text-balance text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Сессия в httpOnly cookie, секреты только на сервере. У каждого
          пользователя стабильный ID (идентификатор из Google).
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          {session?.user ? (
            <>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Вы вошли как{" "}
                <span className="font-medium">{session.user.email}</span>
              </p>
              <Link
                href="/dashboard"
                className="inline-flex rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Перейти в кабинет
              </Link>
            </>
          ) : (
            <GoogleSignInButton callbackUrl={callbackUrl} />
          )}
        </div>
      </main>
    </div>
  );
}
