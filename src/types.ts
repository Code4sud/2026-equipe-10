// Contrats de données partagés entre le front, le backend et le pipeline de données.
// Toute évolution se fait ici d'abord.

export type TabId = 'rapport' | 'metiers' | 'chat' | 'centre' | 'decouvrir';

export interface Source {
  label: string; // ex. "ONISEP · fiche métier"
  url?: string;
}

export interface Chemin {
  titre: string; // ex. "Après la 3e"
  detail: string;
}

export interface Formation {
  intitule: string;
  etablissement: string;
  ville: string;
  distanceKm?: number;
  apprentissage: boolean;
  source: Source;
}

export interface Metier {
  id: string;
  nom: string;
  zoneRapport?: ZoneNum; // zone indiquée par le Rapport des Possibles (absente si choisi dans la liste)
  pitch: string; // "En 30 secondes"
  accesCourt: string; // étiquette sur la carte
  accesFrance: string; // réalité de l'accès en France (ONISEP)
  plusAccessible: boolean; // true si l'accès réel en France est plus court que la zone
  chemins: Chemin[];
  sources: Source[];
  formations: Formation[]; // vide en démo : affichage d'un emplacement
  romeCode?: string;
  onetCode?: string;
  niveauMin?: string; // niveau minimal d'accès selon l'ONISEP
  salaire?: string; // « salaire du débutant » selon l'ONISEP
  libelleRapport?: string; // intitulé du rapport, s'il diffère du nom ONISEP
  sansFiche?: boolean; // intitulé du rapport sans fiche ONISEP correspondante
}

export type ZoneNum = 1 | 2 | 3 | 4 | 5;

/** Un métier retenu : son identifiant ONISEP et, s'il vient du rapport, sa zone. */
export interface Selection {
  id?: string; // fiche ONISEP ; absente si l'intitulé du rapport n'a pas de fiche correspondante
  zone?: ZoneNum;
  label?: string; // intitulé tel qu'écrit dans le rapport
}

/** Entrée de l'index de recherche (public/data/metiers-index.json). */
export interface IndexEntry {
  id: string;
  nom: string;
  syn: string[];
  niv: string;
  a: string;
  ci: string[]; // centres d'intérêt ONISEP (« j'aime le travail manuel »…)
}

export interface Zone {
  numero: ZoneNum;
  duree: string;
}

export interface AssistantAnswer {
  text: string;
  sources: Source[];
  known: boolean; // false = "je ne sais pas" (aucune source fiable)
  suggestSave: boolean; // proposer de garder la question pour le psychologue
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  answer?: AssistantAnswer;
  question?: string; // pour un message assistant : la question à laquelle il répond
}

export interface SavedQuestion {
  question: string;
  metierNom: string;
}
