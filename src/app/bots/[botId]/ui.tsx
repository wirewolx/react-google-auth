"use client";

import { useMemo, useState } from "react";

type Props =
  | { botId: string; mode: "docs" }
  | { botId: string; mode: "ask" };

export function BotPlayground(props: Props) {
  const [title, setTitle] = useState("Документация");
  const [text, setText] = useState("");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [citations, setCitations] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canAsk = useMemo(() => question.trim().length >= 2, [question]);
  const canSave = useMemo(() => text.trim().length >= 20, [text]);

  async function saveDocs() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bots/${props.botId}/docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, text }),
      });
      const data = (await res.json().catch(() => null)) as any;
      if (!res.ok) throw new Error(data?.error || "Ошибка сохранения");
      setAnswer(
        `Готово. Документация сохранена (sourceId: ${data.sourceId}). Теперь можно задавать вопросы.`,
      );
      setCitations([]);
    } catch (e: any) {
      setError(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function ask() {
    setLoading(true);
    setError(null);
    setAnswer(null);
    setCitations([]);
    try {
      const res = await fetch(`/api/bots/${props.botId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = (await res.json().catch(() => null)) as any;
      if (!res.ok) throw new Error(data?.error || "Ошибка запроса");
      setAnswer(data?.answer || "");
      setCitations(data?.citations || []);
    } catch (e: any) {
      setError(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  if (props.mode === "docs") {
    return (
      <div className="mt-5 space-y-4">
        <label className="block">
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Заголовок (опционально)
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-100/10"
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Текст документации
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-2 h-56 w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-100/10"
            placeholder="Вставь сюда текст документации…"
          />
        </label>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        {answer && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-100">
            {answer}
          </div>
        )}

        <button
          type="button"
          disabled={!canSave || loading}
          onClick={saveDocs}
          className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "Сохраняю..." : "Сохранить документацию"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-4">
      <label className="block">
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Вопрос
        </div>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-100/10"
          placeholder="Напр. Как настроить X?"
        />
      </label>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {answer && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-100">
          <div className="whitespace-pre-wrap">{answer}</div>
          {citations?.length > 0 && (
            <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Использованные источники
              </div>
              <ul className="mt-2 space-y-2">
                {citations.map((c, idx) => (
                  <li
                    key={idx}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                  >
                    <div className="font-medium">
                      {c.sourceTitle} — {c.pageTitle}
                    </div>
                    {c.excerpt && (
                      <div className="mt-1 whitespace-pre-wrap text-zinc-600 dark:text-zinc-300">
                        {c.excerpt}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={!canAsk || loading}
        onClick={ask}
        className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading ? "Думаю..." : "Спросить"}
      </button>
    </div>
  );
}

