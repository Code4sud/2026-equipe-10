// Accès aux données métiers ONISEP (générées par scripts/build_onisep.py, servies en fichiers statiques).
import type { IndexEntry, Metier, Selection } from '../types';

const BASE = `${import.meta.env.BASE_URL}data`;
let indexCache: Promise<IndexEntry[]> | null = null;
const ficheCache = new Map<string, Promise<OnisepFiche>>();

interface OnisepFiche {
  id: string;
  nom: string;
  url: string;
  accroche: string;
  description: string;
  niveauMin: string;
  niveauRang: number | null;
  accesIntro: string;
  chemins: { titre: string; items: string[] }[];
  salaireDebutant: string;
  romeV3?: string[];
  proches?: {
    dep06: number; region: number;
    liste: { f: string; n: string; e: string; v: string; s: string; c: string; duree: string; u: string; km: number }[];
  } | null;
}

const NICE = { lat: 43.6969, lon: 7.2706 };
/** Recherche La bonne alternance (service public) : offres et formations en apprentissage pour ces codes ROME, autour de Nice. */
export const alternanceUrl = (romes: string[] = []) =>
  `https://labonnealternance.apprentissage.beta.gouv.fr/recherche?romes=${encodeURIComponent(romes.join(','))}&lat=${NICE.lat}&lon=${NICE.lon}&radius=30&address=Nice`;

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\/[a-z]+/g, '') // esthéticien/ne -> esthéticien
    .replace(/·[a-z]+/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** « esthéticien/ne-cosméticien/ne » -> « Esthéticien·ne-cosméticien·ne » */
export const joli = (nom: string) => {
  const s = nom.replace(/\/(\p{L}+)/gu, '·$1');
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export function loadIndex(): Promise<IndexEntry[]> {
  indexCache ??= fetch(`${BASE}/metiers-index.json`).then((r) => r.json());
  return indexCache;
}

function loadFiche(id: string): Promise<OnisepFiche> {
  if (!ficheCache.has(id)) ficheCache.set(id, fetch(`${BASE}/fiches/${id}.json`).then((r) => r.json()));
  return ficheCache.get(id)!;
}

function sansFiche(sel: Selection, i: number): Metier {
  return {
    id: `rapport-${i}`, nom: sel.label ?? 'Métier', zoneRapport: sel.zone, sansFiche: true,
    pitch: "Ce métier de ton rapport n'a pas de fiche ONISEP correspondante. Ton psychologue pourra t'en parler au Centre.",
    accesCourt: 'Pas de fiche ONISEP', accesFrance: '', plusAccessible: false, chemins: [], sources: [], proches: { dep06: 0, region: 0, liste: [], alternanceUrl: alternanceUrl() },
  };
}

function toMetier(f: OnisepFiche, sel: Selection): Metier {
  const zone = sel.zone;
  const niv = f.niveauMin || '';
  const nom = joli(f.nom);
  return {
    id: f.id,
    nom,
    libelleRapport: sel.label && normalize(sel.label) !== normalize(f.nom) ? sel.label : undefined,
    zoneRapport: zone,
    pitch: f.accroche || f.description,
    accesCourt: niv ? `Niveau minimal : ${niv}` : 'Accès : voir la fiche ONISEP',
    accesFrance: f.accesIntro || (niv ? `D'après l'ONISEP, le niveau d'accès minimal est : ${niv}.` : ''),
    plusAccessible: !!zone && !!f.niveauRang && f.niveauRang < zone,
    chemins: f.chemins.map((c) => ({ titre: c.titre, detail: c.items.join(' · ') })),
    sources: [{ label: 'ONISEP · fiche métier', url: f.url }],
    proches: {
      dep06: f.proches?.dep06 ?? 0,
      region: f.proches?.region ?? 0,
      liste: (f.proches?.liste ?? []).map((x) => ({
        intitule: x.f, niveau: x.n, etablissement: x.e, ville: x.v, distanceKm: x.km, statut: x.s, cout: x.c, duree: x.duree, url: x.u,
      })),
      alternanceUrl: alternanceUrl(f.romeV3),
    },
    niveauMin: niv,
    salaire: f.salaireDebutant || undefined,
  };
}

/** Charge les fiches des métiers retenus, dans l'ordre donné (celui du rapport : jamais de tri). */
export async function loadMetiers(sel: Selection[]): Promise<Metier[]> {
  const fiches = await Promise.all(sel.map((s) => (s.id ? loadFiche(s.id).catch(() => null) : Promise.resolve(null))));
  return sel.map((s, i) => {
    const f = fiches.at(i);
    return f ? toMetier(f, s) : sansFiche(s, i);
  });
}

/** Recherche par nom ou synonyme, pour le choix « dans une liste ». */
export function search(index: IndexEntry[], q: string, max = 12): IndexEntry[] {
  const n = normalize(q);
  if (n.length < 2) return [];
  const words = n.split(' ');
  const hits = index.filter((e) => {
    const hay = normalize([e.nom, ...e.syn].join(' '));
    return words.every((w) => hay.includes(w));
  });
  return hits.sort((a, b) => Number(!normalize(a.nom).startsWith(n)) - Number(!normalize(b.nom).startsWith(n))).slice(0, max);
}
