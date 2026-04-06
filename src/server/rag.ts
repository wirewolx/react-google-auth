const STOP_WORDS = new Set([
  "и",
  "в",
  "во",
  "не",
  "что",
  "он",
  "на",
  "я",
  "с",
  "со",
  "как",
  "а",
  "то",
  "все",
  "она",
  "так",
  "его",
  "но",
  "да",
  "ты",
  "к",
  "у",
  "же",
  "вы",
  "за",
  "бы",
  "по",
  "только",
  "ее",
  "мне",
  "was",
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "is",
  "are",
  "be",
]);

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string) {
  const words = normalize(text).split(" ").filter(Boolean);
  return words.filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

/** Для коротких слов; опечатки вроде «возрат» vs «возврат». */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = new Array<number>(n + 1);
    cur[0] = i;
    const ai = a[i - 1]!;
    for (let j = 1; j <= n; j++) {
      const cost = ai === b[j - 1]! ? 0 : 1;
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + cost);
    }
    prev = cur;
  }
  return prev[n]!;
}

function wordMatchesQuery(word: string, queryWords: Set<string>): boolean {
  if (queryWords.has(word)) return true;
  if (word.length < 4) return false;
  for (const q of queryWords) {
    if (q.length < 4) continue;
    if (Math.abs(word.length - q.length) > 1) continue;
    if (levenshtein(q, word) <= 1) return true;
  }
  return false;
}

export function scoreByOverlap(query: string, document: string) {
  const q = new Set(tokenize(query));
  if (!q.size) return 0;
  const d = tokenize(document);
  let hit = 0;
  for (const w of d) if (wordMatchesQuery(w, q)) hit++;
  // soft normalize: prefer shorter docs a bit
  return hit / Math.sqrt(Math.max(d.length, 1));
}

export function chunkText(text: string, chunkSize = 1200, overlap = 200) {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];
  const chunks: string[] = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(clean.length, i + chunkSize);
    const slice = clean.slice(i, end);
    chunks.push(slice);
    if (end === clean.length) break;
    i = Math.max(0, end - overlap);
  }
  return chunks;
}

