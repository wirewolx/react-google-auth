"use client";

import { useEffect, useState } from "react";

type ButtonRow = {
  label: string;
  responseText: string;
  enabled: boolean;
};

function emptyRow(): ButtonRow {
  return { label: "", responseText: "", enabled: true };
}

export function ButtonsEditor({ botId }: { botId: string }) {
  const [rows, setRows] = useState<ButtonRow[]>([
    emptyRow(),
    emptyRow(),
    emptyRow(),
    emptyRow(),
  ]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/bots/${botId}/buttons`, {
          method: "GET",
        });
        const data = (await res.json().catch(() => null)) as any;
        if (!res.ok) throw new Error(data?.error || "Ошибка загрузки");
        const incoming = (data?.buttons ?? []) as any[];
        const next = [emptyRow(), emptyRow(), emptyRow(), emptyRow()];
        for (let i = 0; i < Math.min(4, incoming.length); i++) {
          next[i] = {
            label: incoming[i]?.label ?? "",
            responseText: incoming[i]?.responseText ?? "",
            enabled: incoming[i]?.enabled ?? true,
          };
        }
        if (!cancelled) setRows(next);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Ошибка");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [botId]);

  function updateRow(idx: number, patch: Partial<ButtonRow>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  async function save() {
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`/api/bots/${botId}/buttons`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buttons: rows }),
      });
      const data = (await res.json().catch(() => null)) as any;
      if (!res.ok) throw new Error(data?.error || "Ошибка сохранения");
      setStatus("Сохранено. Эти кнопки можно будет показать в WhatsApp как interactive buttons.");
    } catch (e: any) {
      setError(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        Заполни 1–4 кнопки. Каждая кнопка — это подпись + готовый ответ (чтобы
        не гонять ИИ на частые вопросы).
      </div>

      <div className="space-y-4">
        {rows.map((r, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Кнопка {idx + 1}
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={r.enabled}
                  onChange={(e) => updateRow(idx, { enabled: e.target.checked })}
                />
                включена
              </label>
            </div>

            <label className="mt-3 block">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Текст кнопки (1–30)
              </div>
              <input
                value={r.label}
                onChange={(e) => updateRow(idx, { label: e.target.value })}
                className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-100/10"
                placeholder="Напр. Цены"
              />
            </label>

            <label className="mt-3 block">
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Готовый ответ (1–2000)
              </div>
              <textarea
                value={r.responseText}
                onChange={(e) =>
                  updateRow(idx, { responseText: e.target.value })
                }
                className="mt-2 h-28 w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-900/10 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-100/10"
                placeholder="Напр. Наши цены: ..."
              />
            </label>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {status && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-100">
          {status}
        </div>
      )}

      <button
        type="button"
        onClick={save}
        disabled={loading}
        className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading ? "Сохраняю..." : "Сохранить кнопки"}
      </button>
    </div>
  );
}

