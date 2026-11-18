// Données de DÉMONSTRATION : persona fictif, aucun vrai rapport.
// Les textes s'appuient sur les fiches publiques ONISEP / ROME ; en production
// ils seront générés depuis mapping.json (pipeline de données, étape 3).
import type { Metier, Source, Zone } from '../types';

export const PERSONA = { prenom: 'Lina', age: 17, ville: 'Nice' };

export const ZONES: Zone[] = [
  { numero: 1, duree: '0 à 6 mois de préparation' },
  { numero: 2, duree: '3 mois à 2 ans' },
  { numero: 3, duree: '1 à 4 ans' },
  { numero: 4, duree: '2 à 6 ans' },
  { numero: 5, duree: '4 à 10 ans' },
];

const ONISEP_METIER: Source = { label: 'ONISEP · fiche métier', url: 'https://www.onisep.fr' };
const ONISEP_FORMATIONS: Source = { label: 'ONISEP · formations', url: 'https://www.onisep.fr' };
const ROME: Source = { label: 'ROME 4.0 · France Travail', url: 'https://candidat.francetravail.fr/metierscope' };
export const REGION_SUD: Source = { label: 'orientation-regionsud.fr', url: 'https://www.orientation-regionsud.fr' };
export const CARIF: Source = { label: 'Carif-Oref Sud · offre de formation' };

export const METIERS: Metier[] = [
  {
    id: 'aide-domicile', nom: 'Aide à domicile', zoneRapport: 1,
    pitch: 'Accompagne des personnes âgées ou fragiles chez elles : repas, courses, aide au quotidien, compagnie.',
    accesCourt: 'Sans diplôme exigé · titre pro possible',
    accesFrance: 'Accessible sans diplôme. Des formations courtes existent, comme le titre professionnel Assistant de vie aux familles.',
    plusAccessible: false,
    chemins: [
      { titre: 'Sans diplôme', detail: 'Embauche possible, avec une formation sur le terrain.' },
      { titre: 'Formation courte', detail: 'Titre pro Assistant de vie aux familles, ouvert aux adultes.' },
    ],
    sources: [ONISEP_METIER, ROME], formations: [],
  },
  {
    id: 'aide-soignant', nom: 'Aide-soignant·e', zoneRapport: 2,
    pitch: "Accompagne les patients dans les gestes du quotidien, à l'hôpital, en Ehpad ou à domicile.",
    accesCourt: "Diplôme d'État · sans bac exigé",
    accesFrance: "Diplôme d'État d'aide-soignant, accessible sans le bac, aussi en apprentissage.",
    plusAccessible: false,
    chemins: [
      { titre: 'Sans le bac', detail: "Formation au diplôme d'État en institut, sur sélection." },
      { titre: 'En apprentissage', detail: 'La même formation, payée et en alternance.' },
    ],
    sources: [ONISEP_METIER, ROME], formations: [],
  },
  {
    id: 'charpentier', nom: 'Charpentier·ère', zoneRapport: 2,
    pitch: 'Fabrique et pose des charpentes en bois ou en métal, en atelier puis sur les chantiers.',
    accesCourt: 'CAP · souvent en apprentissage',
    accesFrance: 'CAP charpentier bois après la 3e, souvent en apprentissage, puis BP ou bac pro.',
    plusAccessible: false,
    chemins: [
      { titre: 'Après la 3e', detail: 'CAP charpentier bois, au lycée pro ou en apprentissage.' },
      { titre: 'Pour aller plus loin', detail: 'Brevet professionnel ou bac pro.' },
    ],
    sources: [ONISEP_METIER, ROME], formations: [],
  },
  {
    id: 'estheticien', nom: 'Esthéticien·ne', zoneRapport: 3,
    pitch: 'Réalise des soins du visage et du corps, des épilations et conseille sur les produits, en institut ou en spa.',
    accesCourt: 'En France : dès le CAP',
    accesFrance: 'En France, on peut commencer dès le CAP Esthétique, 2 ans après la 3e. Le BP ou le BTS viennent ensuite si tu veux aller plus loin.',
    plusAccessible: true,
    chemins: [
      { titre: 'Après la 3e', detail: 'CAP Esthétique cosmétique parfumerie, au lycée pro ou en apprentissage.' },
      { titre: 'Après le CAP', detail: 'BP Esthétique, souvent en alternance.' },
      { titre: 'Avec un bac', detail: "BTS Métiers de l'esthétique, en 2 ans." },
    ],
    sources: [ONISEP_METIER, ONISEP_FORMATIONS, ROME], formations: [],
  },
  {
    id: 'technicien-labo', nom: 'Technicien·ne de laboratoire', zoneRapport: 3,
    pitch: 'Prépare des échantillons et réalise des analyses en santé, en agroalimentaire ou en recherche.',
    accesCourt: 'BTS ou BUT après le bac',
    accesFrance: 'BTS ou BUT en biologie ou chimie, 2 à 3 ans après le bac.',
    plusAccessible: false,
    chemins: [
      { titre: 'Avec un bac', detail: 'BTS Bioanalyses et contrôles, ou BUT Génie biologique.' },
      { titre: 'Depuis un bac pro', detail: 'Accès possible au BTS, à discuter avec ton psychologue.' },
    ],
    sources: [ONISEP_METIER, ROME], formations: [],
  },
  {
    id: 'dieteticien', nom: 'Diététicien·ne', zoneRapport: 4,
    pitch: "Conseille sur l'alimentation pour la santé, à l'hôpital, en cabinet ou en restauration collective.",
    accesCourt: 'En France : 2 ans après le bac',
    accesFrance: 'En France, le BTS Diététique se fait en 2 ans après le bac, moins long que ce que la zone laisse penser.',
    plusAccessible: true,
    chemins: [
      { titre: 'Avec un bac', detail: 'BTS Diététique, ou BUT Génie biologique parcours diététique.' },
      { titre: 'Plus tard', detail: 'Spécialisations possibles en formation continue.' },
    ],
    sources: [ONISEP_METIER, ONISEP_FORMATIONS, ROME], formations: [],
  },
];

export const metierById = (id: string) => METIERS.find((m) => m.id === id);
