// Lecture du Rapport des Possibles DANS LE NAVIGATEUR : le fichier ne quitte jamais l'appareil.
// On ne garde que la liste des métiers par zone ; le profil (scores, graphiques) est ignoré (règle 2).
import type { IndexEntry, Selection, ZoneNum } from '../types';
import { normalize } from './metiers';

const STOP = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'en', 'et', 'au', 'aux', 'sur', 'pour', 'par']);
const words = (s: string) => s.split(' ').filter((w) => w.length >= 3 && !STOP.has(w));

/** Lignes de texte du PDF, dans l'ordre de lecture. */
async function pdfLines(file: File): Promise<string[]> {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const lines: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const content = await (await doc.getPage(i)).getTextContent();
    let cur = '';
    for (const it of content.items) {
      if (!('str' in it)) continue;
      cur += it.str;
      if (it.hasEOL) { lines.push(cur.trim()); cur = ''; }
    }
    if (cur.trim()) lines.push(cur.trim());
  }
  return lines.filter(Boolean);
}

/** Une ligne qui ressemble à un intitulé de métier (court, sans ponctuation de phrase). */
export const isTitle = (raw: string) =>
  raw.length <= 60 && /^\p{Lu}/u.test(raw) && !/[.«»:@]|www|\d/.test(raw) && raw.split(/\s+/).length <= 7;

/** Fiche ONISEP la plus proche d'un intitulé, ou null si rien de convaincant. */
export function bestMatch(title: string, names: { n: string; w: Set<string>; id: string }[]): string | null {
  const tw = new Set(words(title));
  if (!tw.size) return null;
  let best: { score: number; id: string } | null = null;
  for (const { n, w, id } of names) {
    let inter = 0;
    tw.forEach((x) => { if (w.has(x)) inter++; });
    if (!inter) continue;
    let score = (inter / tw.size) * 0.7 + (inter / w.size) * 0.3;
    if (` ${title} `.includes(` ${n} `)) score += 0.2;
    if (!best || score > best.score) best = { score, id };
  }
  return best && best.score >= 0.6 ? best.id : null;
}

/**
 * Métiers du rapport, dans l'ordre, avec leur zone.
 * Un intitulé sans fiche ONISEP correspondante est gardé tel quel (label) : aucun métier du rapport n'est caché.
 */
export async function findMetiersInPdf(file: File, index: IndexEntry[]): Promise<Selection[]> {
  const names = index.flatMap((e) =>
    [e.nom, ...e.syn].map((s) => normalize(s)).filter((n) => n.length >= 4).map((n) => ({ n, w: new Set(words(n)), id: e.id })),
  );
  const out: Selection[] = [];
  let zone: ZoneNum | undefined;
  for (const raw of await pdfLines(file)) {
    const t = normalize(raw);
    const z = t.match(/^([1-5])(?:ere|eme|e)? zone de metiers/);
    if (z) { zone = Number(z[1]) as ZoneNum; continue; }
    if (!zone || !isTitle(raw) || t.startsWith('metiers accessibles')) continue;
    const id = bestMatch(t, names);
    if (id && out.some((s) => s.id === id)) continue;
    out.push(id ? { id, zone, label: raw } : { zone, label: raw });
  }
  return out;
}
