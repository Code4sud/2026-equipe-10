// Questionnaire « Me découvrir », adapté du questionnaire de l'équipe.
// Modèle RIASEC (J. Holland) : outil de réflexion indicatif, pas un test psychométrique.
// Règle 2 : aucun score, aucun pourcentage, aucun classement affiché sur la personne.
// Les pistes de métiers viennent des centres d'intérêt de l'ONISEP (données publiques), sans classement.

export type Monde = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export const MONDES: Monde[] = ['R', 'I', 'A', 'S', 'E', 'C'];

export const INFO: Record<Monde, { nom: string; figure: string; texte: string }> = {
  R: { nom: 'Réaliste', figure: 'Le Bâtisseur', texte: 'Tu aimes le concret : manier des outils, bouger, voir le résultat de tes mains.' },
  I: { nom: 'Investigateur', figure: "L'Explorateur", texte: "Tu aimes comprendre : chercher, analyser, résoudre ce que personne n'a encore résolu." },
  A: { nom: 'Artistique', figure: 'Le Créatif', texte: 'Tu aimes inventer : exprimer des idées, innover, travailler sans cadre imposé.' },
  S: { nom: 'Social', figure: 'Le Soutien', texte: 'Tu aimes les gens : aider, enseigner, écouter, faire grandir les autres.' },
  E: { nom: 'Entreprenant', figure: 'Le Moteur', texte: 'Tu aimes entraîner : convaincre, décider, lancer des projets.' },
  C: { nom: 'Conventionnel', figure: "L'Organisateur", texte: "Tu aimes l'ordre : structurer, planifier, fiabiliser, soigner les détails." },
};

/** 20 questions (3 ou 4 par monde), dans l'ordre du questionnaire d'origine. */
const ITEMS: Record<Monde, string[]> = {
  R: ['Réparer un appareil ou une machine en panne', 'Travailler en plein air, au contact de la nature', 'Utiliser des outils ou conduire des engins'],
  I: ['Comprendre pourquoi un phénomène se produit', 'Mener une expérience ou une enquête', 'Résoudre un problème de logique ou de mathématiques'],
  A: ['Dessiner, peindre ou concevoir des visuels', 'Écrire des histoires, des textes ou des chansons', "Jouer d'un instrument ou monter un spectacle", "Imaginer l'aménagement ou la décoration d'un espace"],
  S: ['Aider une personne en difficulté', "Enseigner ou expliquer quelque chose à d'autres", "Écouter les problèmes de quelqu'un", 'Animer un groupe ou un atelier'],
  E: ['Convaincre ou négocier avec des interlocuteurs', 'Diriger une équipe vers un objectif', 'Lancer un projet ou créer une entreprise'],
  C: ['Classer et organiser des documents ou des fichiers', 'Tenir des comptes ou gérer un budget', 'Suivre des procédures précises'],
};

export const QUESTIONS: { monde: Monde; texte: string }[] = (() => {
  const out: { monde: Monde; texte: string }[] = [];
  for (let k = 0; k < 4; k++) for (const m of MONDES) { const t = ITEMS[m].at(k); if (t) out.push({ monde: m, texte: t }); }
  return out;
})();

export const ECHELLE = ['Pas du tout', 'Un peu', 'Moyennement', 'Plutôt', 'Beaucoup'];

/** Questions du miroir : pour réfléchir, rien n'est envoyé. */
export const MIROIR: Record<Monde, string> = {
  R: 'Quand as-tu fabriqué ou réparé quelque chose dont tu étais fier·ère ?',
  I: "Quel sujet pourrais-tu creuser des heures sans t'ennuyer ?",
  A: "Quand t'es-tu senti·e le plus libre de créer ?",
  S: "Qui as-tu aidé récemment, et qu'est-ce que ça t'a fait ressentir ?",
  E: "Quand as-tu pris l'initiative d'entraîner d'autres personnes avec toi ?",
  C: "Qu'est-ce que tu aimes mettre en ordre, même sans qu'on te le demande ?",
};
export const MIROIR_COMMUN = [
  "Qu'est-ce qui te surprend dans ce que tes réponses racontent ?",
  'Qu\'est-ce qui compterait le plus dans ton futur métier : liberté, sécurité, utilité, reconnaissance, argent… ?',
];

/** Correspondance monde RIASEC -> centres d'intérêt ONISEP (publics), pour proposer des pistes. */
export const CENTRES: Record<Monde, string[]> = {
  R: ["j'aime le travail manuel", "j'ai envie de créer, construire, rénover", "j'aime la nature", "j'ai envie de piloter, conduire", "j'aime m'occuper d'animaux", "j'aime le sport, l'activité physique", "j'aime cuisiner"],
  I: ["j'aime faire des découvertes", "j'aime les nouvelles technologies", 'je souhaite protéger la planète', "j'aime manier les chiffres"],
  A: ['je suis un / une artiste', "j'aime dessiner", "j'aime jouer avec les mots", "j'ai envie de travailler dans les coulisses du spectacle"],
  S: ['je souhaite prendre soin des autres', "je souhaite m'occuper d'enfants", 'je souhaite enseigner, transmettre', "j'ai le sens du contact", 'je souhaite protéger et secourir'],
  E: ["j'aime diriger", "j'aime communiquer, convaincre", "j'ai le sens des affaires", "j'aime les sensations fortes"],
  C: ["j'aime organiser, planifier", "j'ai le souci du détail", 'je souhaite faire respecter la loi, les règles', "j'ai le sens du service public"],
};

/** Les trois mondes vers lesquels les réponses penchent le plus (aucun chiffre n'est affiché). */
export function mondesDominants(reponses: number[]): Monde[] {
  const somme: Record<Monde, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const nb: Record<Monde, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  QUESTIONS.forEach((q, i) => { const v = reponses.at(i) ?? 0; if (v >= 0) { somme[q.monde] += v; nb[q.monde] += 1; } });
  const moy = (m: Monde) => (nb[m] ? somme[m] / nb[m] : 0);
  return [...MONDES].sort((a, b) => moy(b) - moy(a)).slice(0, 3);
}

/** Réponse « je n'ai jamais essayé » : ne compte pas dans les tendances. */
export const JAMAIS = -1;

// ── Étape « Toi, en vrai » : le jeune parle de lui avec ses mots. Tout est facultatif, rien n'est noté. ──
export const VALEURS = [
  'Être utile aux autres', 'Gagner bien ma vie', 'La sécurité de l\'emploi', 'Être libre, autonome', 'Créer, inventer',
  'Bouger, ne pas rester assis·e', 'Apprendre tout le temps', 'Avoir du temps pour ma vie perso', 'Être reconnu·e',
  'Travailler en équipe', 'Protéger la planète', 'Voyager',
];
export const MAX_VALEURS = 3;

export const CONDITIONS: { id: string; question: string; choix: string[] }[] = [
  { id: 'lieu', question: 'Où tu te vois travailler ?', choix: ['Dehors', 'Dans un bureau', 'En atelier, sur le terrain', 'Un peu de tout'] },
  { id: 'equipe', question: 'Avec qui ?', choix: ['Plutôt seul·e', 'En équipe', 'Avec du public, des clients', 'Ça dépend'] },
  { id: 'etudes', question: 'Les études, pour toi ?', choix: ['Le plus court possible', '2 ou 3 ans, ça va', 'Longues si ça me plaît', 'Je ne sais pas'] },
  { id: 'alternance', question: 'Apprendre en étant payé·e (alternance) ?', choix: ['Oui, ça m\'intéresse', 'Non', 'Je ne connais pas bien'] },
  { id: 'mobilite', question: 'Partir de Nice pour te former ?', choix: ['Je préfère rester dans le 06', 'Oui, en région Sud', 'Oui, n\'importe où', 'Je ne sais pas'] },
];

export const EXPERIENCES = [
  'Stage', 'Job d\'été ou petit boulot', 'Bénévolat, association', 'Sport en club', 'Musique, danse, théâtre',
  'Dessin, photo, vidéo', 'Créer du contenu (réseaux, YouTube…)', 'Jeux vidéo', 'Bricolage, mécanique', 'Cuisine',
  'Garder des enfants', 'Aider ma famille au quotidien', 'Informatique, code', 'Animaux, nature',
];

export const LIBRES = [
  { id: 'fierte', question: 'Une chose que tu as faite et dont tu es fier·e', aide: 'Même petite : un projet, un service rendu, un truc réussi…' },
  { id: 'reve', question: 'Si tout était possible, ta journée de travail ressemblerait à…', aide: 'Décris en vrac : où, avec qui, ce que tu fais.' },
  { id: 'nonmerci', question: 'Ce que tu ne veux surtout pas dans un métier', aide: 'Horaires, ambiance, tâches… tout compte.' },
];

export interface Moi {
  valeurs: string[];
  conditions: Record<string, string>;
  experiences: string[];
  libres: Record<string, string>;
}
export const MOI_VIDE: Moi = { valeurs: [], conditions: {}, experiences: [], libres: {} };

// ── Liens entre ce que le jeune dit de lui et les centres d'intérêt ONISEP (servent à expliquer chaque piste). ──
export const EXP_CI: Record<string, string[]> = {
  'Bénévolat, association': ['je souhaite prendre soin des autres', "j'ai le sens du service public"],
  'Sport en club': ["j'aime le sport, l'activité physique", "j'aime les sensations fortes"],
  'Musique, danse, théâtre': ['je suis un / une artiste', "j'ai envie de travailler dans les coulisses du spectacle"],
  'Dessin, photo, vidéo': ["j'aime dessiner", 'je suis un / une artiste'],
  'Créer du contenu (réseaux, YouTube…)': ["j'aime communiquer, convaincre", "j'aime jouer avec les mots"],
  'Jeux vidéo': ["j'aime les nouvelles technologies"],
  'Bricolage, mécanique': ["j'aime le travail manuel", "j'ai envie de créer, construire, rénover"],
  Cuisine: ["j'aime cuisiner"],
  'Garder des enfants': ["je souhaite m'occuper d'enfants"],
  'Aider ma famille au quotidien': ['je souhaite prendre soin des autres'],
  'Informatique, code': ["j'aime les nouvelles technologies", "j'aime manier les chiffres"],
  'Animaux, nature': ["j'aime m'occuper d'animaux", "j'aime la nature"],
  "Job d'été ou petit boulot": ["j'ai le sens du contact"],
};
export const VAL_CI: Record<string, string[]> = {
  'Être utile aux autres': ['je souhaite prendre soin des autres', 'je souhaite protéger et secourir'],
  'Créer, inventer': ["j'ai envie de créer, construire, rénover", 'je suis un / une artiste'],
  'Bouger, ne pas rester assis·e': ["j'aime le sport, l'activité physique", "j'aime me déplacer, voyager"],
  'Apprendre tout le temps': ["j'aime faire des découvertes"],
  'Travailler en équipe': ["j'ai le sens du contact"],
  'Protéger la planète': ['je souhaite protéger la planète', "j'aime la nature"],
  Voyager: ["j'aime me déplacer, voyager", "je m'intéresse à d'autres cultures"],
  'Être libre, autonome': ["j'ai le sens des affaires"],
};
export const COND_CI: Record<string, string[]> = {
  'lieu:Dehors': ["j'aime la nature"],
  'lieu:En atelier, sur le terrain': ["j'aime le travail manuel"],
  'equipe:Avec du public, des clients': ["j'ai le sens du contact"],
};

/** Niveaux d'entrée ONISEP compatibles avec l'envie d'études exprimée (sert d'étiquette, jamais de filtre). */
const COURT = ['sans diplôme', '3E', 'diplôme national du brevet', 'CAP ou équivalent', 'CAP ou équivalent + 1 an', 'bac ou équivalent'];
const MOYEN = [...COURT, 'bac + 1', 'bac + 2', 'bac + 3'];
export function colleEtudes(etudes: string | undefined, niv: string): boolean {
  if (etudes === 'Le plus court possible') return COURT.includes(niv);
  if (etudes === '2 ou 3 ans, ça va') return MOYEN.includes(niv);
  return false;
}

export interface Raison { texte: string; ci: string[] }
/** Ce que le jeune a dit, transformé en raisons lisibles (« Tu as dit : garder des enfants »). */
export function raisonsDe(moi: Moi, mondes: Monde[]): Raison[] {
  const r: Raison[] = [];
  moi.experiences.forEach((x) => { if (EXP_CI[x]) r.push({ texte: `tu as dit « ${x} »`, ci: EXP_CI[x] }); });
  moi.valeurs.forEach((x) => { if (VAL_CI[x]) r.push({ texte: `tu as dit « ${x} »`, ci: VAL_CI[x] }); });
  Object.entries(moi.conditions).forEach(([k, v]) => { const ci = COND_CI[`${k}:${v}`]; if (ci) r.push({ texte: `tu te vois « ${v} »`, ci }); });
  mondes.forEach((m) => r.push({ texte: `tes réponses penchent côté ${INFO[m].figure}`, ci: CENTRES[m] }));
  return r;
}
export const pourquoi = (raisons: Raison[], ci: string[]) => raisons.filter((r) => ci.some((c) => r.ci.includes(c))).map((r) => r.texte);
