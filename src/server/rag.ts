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

export function scoreByOverlap(query: string, document: string) {
  const q = new Set(tokenize(query));
  if (!q.size) return 0;
  const d = tokenize(document);
  let hit = 0;
  for (const w of d) if (q.has(w)) hit++;
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

