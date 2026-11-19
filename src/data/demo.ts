// Données de DÉMONSTRATION : persona fictif, aucun vrai rapport.
// Les métiers sont de vraies fiches ONISEP (open data) ; seules la persona et ses zones sont inventées.
import type { Selection, Source, Zone } from '../types';

export const PERSONA = { prenom: 'Lina', age: 17, ville: 'Nice' };

export const PERSONA_METIERS: Selection[] = [
  { id: 'MET.782', zone: 2 }, // accompagnant·e éducatif·ve et social·e
  { id: 'MET.561', zone: 2 }, // aide-soignant·e
  { id: 'MET.9', zone: 2 }, // charpentier·ère bois
  { id: 'MET.448', zone: 3 }, // esthéticien·ne-cosméticien·ne
  { id: 'MET.288', zone: 3 }, // technicien·ne biologiste
  { id: 'MET.672', zone: 4 }, // diététicien·ne
];

export const ZONES: Zone[] = [
  { numero: 1, duree: '0 à 6 mois de préparation' },
  { numero: 2, duree: '3 mois à 2 ans' },
  { numero: 3, duree: '1 à 4 ans' },
  { numero: 4, duree: '2 à 6 ans' },
  { numero: 5, duree: '4 à 10 ans' },
];

export const REGION_SUD: Source = { label: 'orientation-regionsud.fr', url: 'https://www.orientation-regionsud.fr' };
export const CARIF: Source = { label: 'Carif-Oref Sud · offre de formation' };
export const ONISEP_AF: Source = { label: 'ONISEP · actions de formation (open data)', url: 'https://www.data.gouv.fr/datasets/ideo-actions-de-formation-initiale-univers-lycee' };
export const LBA: Source = { label: 'La bonne alternance', url: 'https://labonnealternance.apprentissage.beta.gouv.fr' };
