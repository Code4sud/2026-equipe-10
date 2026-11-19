// Assistant en MODE DÉMO : aucune IA, aucune donnée envoyée.
// Les réponses sont construites à partir des fiches (données sourcées) et
// respectent les 3 règles : pas de verdict, sources citées, « je ne sais pas ».
import type { AssistantAnswer, Metier } from '../types';
import { CARIF, REGION_SUD } from '../data/demo';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

type Intent = 'salut' | 'verdict' | 'salaire' | 'hesite' | 'cout' | 'pres' | 'bac' | 'quoi';

// L'ordre compte : on détecte d'abord les questions qui appellent une réponse prudente.
const INTENTS: [Intent, RegExp][] = [
  ['salut', /^(salut|bonjour|bonsoir|coucou|hello|hey|yo|merci|merci beaucoup|ok|d.?accord|cool|top)[\s!.?]*$/],
  ['verdict', /\b(nul|nulle|mort|pas capable|trop dur|j.?y arriverai|pas le niveau|bete|rate|echoue)\b/],
  ['salaire', /(salaire|gagn|paye combien|argent|€|euros)/],
  ['hesite', /(hesit|choisir|lequel|laquelle|le mieux|la mieux|departager|entre les deux)/],
  ['cout', /(cout|prix|cher|gratuit|payer la formation|frais)/],
  ['pres', /(pres de|nice|ou se former|ou etudier|loin|distance|ville|ecole|lycee|cfa)/],
  ['bac', /(bac|diplome|etudes|niveau requis|sans le|formation|ecole a faire|apprendre|cursus)/],
  ['quoi', /(c.?est quoi|concretement|fait quoi|journee|quotidien|en quoi consiste)/],
];

export function detectIntent(question: string): Intent | null {
  const q = norm(question);
  for (const [intent, re] of INTENTS) if (re.test(q)) return intent;
  return null;
}

export const GREETING =
  "Salut ! Pose-moi une question sur ce métier : ce qu'on y fait, les études pour y arriver, les formations près de chez toi… Tu peux aussi cliquer sur une suggestion.";

export function answerDemo(question: string, m: Metier): AssistantAnswer {
  const intent = detectIntent(question);
  switch (intent) {
    case 'salut':
      return { text: GREETING, sources: [], known: true, suggestSave: false };
    case 'quoi':
      return { text: m.pitch, sources: m.sources, known: true, suggestSave: false };
    case 'bac': {
      const chemins = m.chemins.slice(0, 3).map((c) => `${c.titre} : ${c.detail}.`).join(' ');
      const niv = m.niveauMin ? `D'après l'ONISEP, le niveau minimal est : ${m.niveauMin}.` : '';
      return { text: `${niv} ${chemins || m.accesFrance}`.trim(), sources: m.sources, known: true, suggestSave: false };
    }
    case 'pres':
      return {
        text: "Les formations près de chez toi s'afficheront dans la fiche du métier, avec la distance depuis ta commune. Tu peux aussi les chercher sur orientation-regionsud.fr, la même base que sur la borne du Centre.",
        sources: [CARIF, REGION_SUD], known: true, suggestSave: false,
      };
    case 'cout':
      return {
        text: "En apprentissage, la formation est gratuite et tu es payé·e. Au lycée public, l'enseignement est gratuit. Pour les écoles privées, les frais varient : vérifie sur la fiche de l'établissement.",
        sources: [{ label: 'ONISEP · apprentissage', url: 'https://www.onisep.fr' }], known: true, suggestSave: false,
      };
    case 'salaire':
      if (m.salaire)
        return {
          text: `D'après l'ONISEP, pour un·e débutant·e : ${m.salaire.charAt(0).toLowerCase() + m.salaire.slice(1)}. Ça varie selon la région, l'employeur et ton parcours : la fiche sur orientation-regionsud.fr donne les salaires dans la région.`,
          sources: [...m.sources, REGION_SUD], known: true, suggestSave: false,
        };
      return {
        text: "Je n'ai pas de chiffre vérifié et je ne veux pas t'en inventer un. La fiche du métier sur orientation-regionsud.fr donne les salaires dans la région : c'est la même base que sur la borne du Centre.",
        sources: [REGION_SUD], known: false, suggestSave: true,
      };
    case 'hesite':
      return {
        text: "Je ne peux pas choisir à ta place, et c'est normal : ça dépend de ce qui compte pour toi. Compare les métiers sur ce qui t'importe vraiment (durée de formation, horaires, contact avec les gens, lieu de travail). C'est aussi une très bonne question pour ton psychologue au Centre.",
        sources: [{ label: 'ROME 4.0 · conditions de travail', url: 'https://candidat.francetravail.fr/metierscope' }], known: true, suggestSave: true,
      };
    case 'verdict':
      return {
        text: `Aucune note ni aucun résultat ne ferme la porte de ce métier. ${m.chemins.length > 1 ? `Il y a plusieurs chemins pour y arriver : « ${m.chemins[0].titre} » ou « ${m.chemins[1].titre} », par exemple.` : ''} Si ça t'inquiète, parles-en avec ton psychologue : il connaît ton parcours et peut t'aider à voir les étapes.`,
        sources: m.sources, known: true, suggestSave: true,
      };
    default:
      return {
        text: "Je n'ai pas d'information vérifiée pour répondre à ça, et je préfère ne pas inventer. Tu peux garder cette question pour ton rendez-vous au Centre.",
        sources: [], known: false, suggestSave: true,
      };
  }
}

export const SUGGESTIONS = [
  "C'est quoi, concrètement ?",
  'Je peux le faire sans le bac ?',
  'Il y a une formation près de Nice ?',
  'Ça coûte cher ?',
  'Je gagnerai combien ?',
  "J'hésite entre deux métiers, lequel choisir ?",
];
