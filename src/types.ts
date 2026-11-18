// Contrats de données partagés entre le front, le backend et le pipeline de données.
// Toute évolution se fait ici d'abord.

export type TabId = 'rapport' | 'metiers' | 'chat' | 'centre';

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
  zoneRapport: 1 | 2 | 3 | 4 | 5; // zone indiquée par le Rapport des Possibles (O*NET)
  pitch: string; // "En 30 secondes"
  accesCourt: string; // étiquette sur la carte
  accesFrance: string; // réalité de l'accès en France (ONISEP)
  plusAccessible: boolean; // true si l'accès réel en France est plus court que la zone
  chemins: Chemin[];
  sources: Source[];
  formations: Formation[]; // vide en démo : affichage d'un emplacement
  romeCode?: string;
  onetCode?: string;
}

export interface Zone {
  numero: 1 | 2 | 3 | 4 | 5;
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
