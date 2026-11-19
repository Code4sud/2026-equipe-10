// Génère « Mon profil » en PDF, directement dans le navigateur (rien n'est envoyé à un serveur).
// Règle 2 : aucun score, aucun pourcentage, aucun classement. Règle 3 : aucun nom demandé.
import { theme } from '../theme';
import { CONDITIONS, INFO, LIBRES, type Moi, type Monde } from '../data/riasec';
import { joli } from './metiers';
import type { IndexEntry } from '../types';

export interface ProfilData {
  intuition: Monde | null;
  mondes: Monde[];
  phraseMiroir: string;
  moi: Moi;
  miroir: { question: string; reponse: string }[];
  metiers: { e: IndexEntry; pourquoi: string[]; etudes: boolean }[];
  rapport: { nom: string; pourquoi: string[] }[];
}

const hex = (h: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
const VIOLET = hex(theme.colors.bgMid);
const MAGENTA = hex(theme.colors.accent);
const PERVENCHE = hex(theme.colors.primary);
const ENCRE: [number, number, number] = [40, 36, 70];
const GRIS: [number, number, number] = [110, 105, 140];

export async function telechargerProfil(d: ProfilData): Promise<void> {
  const { jsPDF } = await import('jspdf'); // chargé seulement au clic
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, M = 18, L = W - 2 * M, BAS = 280;
  let y = 0;

  const page = () => { doc.addPage(); y = 20; };
  const place = (h: number) => { if (y + h > BAS) page(); };
  const texte = (t: string, o: { size?: number; bold?: boolean; color?: [number, number, number]; indent?: number; gap?: number } = {}) => {
    const size = o.size ?? 10.5, ind = o.indent ?? 0;
    doc.setFont('helvetica', o.bold ? 'bold' : 'normal').setFontSize(size).setTextColor(...(o.color ?? ENCRE));
    const lignes: string[] = doc.splitTextToSize(t, L - ind);
    const lh = size * 0.42;
    lignes.forEach((l) => { place(lh); doc.text(l, M + ind, y); y += lh; });
    y += o.gap ?? 2;
  };
  const titre = (t: string) => {
    place(16); y += 4;
    doc.setFillColor(...MAGENTA).rect(M, y - 4, 1.4, 5.5, 'F');
    texte(t, { size: 13, bold: true, color: VIOLET, indent: 4, gap: 3 });
  };
  const lignesVides = (n: number) => {
    doc.setDrawColor(200, 196, 225).setLineWidth(0.2);
    for (let k = 0; k < n; k++) { place(7); y += 6; doc.line(M + 4, y, M + L, y); }
    y += 4;
  };

  // En-tête
  doc.setFillColor(...VIOLET).rect(0, 0, W, 42, 'F');
  doc.setFillColor(...MAGENTA).rect(0, 42, W, 1.5, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(255, 255, 255).text(theme.appName, M, 14);
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(207, 203, 255).text(theme.appTagline, M, 19);
  doc.setFont('helvetica', 'bold').setFontSize(22).setTextColor(255, 255, 255).text('Mon profil', M, 32);
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(207, 203, 255).text(`Questionnaire « Me découvrir » · ${date}`, M, 38);
  y = 54;

  // Avertissement
  doc.setFillColor(240, 238, 255).setDrawColor(...PERVENCHE).setLineWidth(0.3).roundedRect(M, y - 5, L, 17, 2, 2, 'FD');
  texte("Ce document n'est ni un test ni un verdict : pas de note, pas de score, pas de classement. Ce sont des tendances d'aujourd'hui, elles peuvent changer. Apporte-le à ton rendez-vous au Centre des Possibles pour en parler avec un·e psychologue.", { size: 9.5, indent: 3, gap: 8 });

  if (d.intuition) {
    titre('Mon intuition de départ');
    texte(`Avant de répondre, je pensais ressembler à : ${INFO[d.intuition].figure} (monde ${INFO[d.intuition].nom}).`);
  }

  titre("Les mondes qui m'attirent");
  d.mondes.forEach((m) => {
    texte(`${INFO[m].figure} · monde ${INFO[m].nom}`, { bold: true, indent: 4, gap: 1 });
    texte(INFO[m].texte, { indent: 4, gap: 3, color: GRIS });
  });

  const { moi } = d;
  const conds = CONDITIONS.filter((c) => moi.conditions[c.id]);
  const libres = LIBRES.filter((l) => moi.libres[l.id]?.trim());
  if (moi.valeurs.length || conds.length || moi.experiences.length || libres.length) {
    titre('Moi, en vrai');
    if (moi.valeurs.length) { texte('Ce qui compte pour moi', { bold: true, size: 10, indent: 4, gap: 1 }); texte(moi.valeurs.join(' · '), { indent: 4, gap: 3 }); }
    if (conds.length) {
      texte('Comment je me vois travailler', { bold: true, size: 10, indent: 4, gap: 1 });
      conds.forEach((c) => texte(`${c.question} ${moi.conditions[c.id]}`, { indent: 4, gap: 0.5 }));
      y += 2.5;
    }
    if (moi.experiences.length) { texte("Ce que j'ai déjà fait ou aime faire", { bold: true, size: 10, indent: 4, gap: 1 }); texte(moi.experiences.join(' · '), { indent: 4, gap: 3 }); }
    libres.forEach((l) => { texte(l.question, { bold: true, size: 10, indent: 4, gap: 1 }); texte(moi.libres[l.id].trim(), { indent: 4, gap: 3 }); });
  }

  titre('Le miroir');
  if (d.phraseMiroir) texte(d.phraseMiroir, { bold: true, indent: 4, gap: 3 });
  d.miroir.forEach(({ question, reponse }) => {
    texte(question, { bold: true, size: 10, indent: 4, gap: 1 });
    if (reponse.trim()) texte(reponse.trim(), { indent: 4, gap: 4 });
    else lignesVides(2); // à remplir à la main
  });

  titre('Des métiers que je veux explorer');
  if (d.metiers.length) {
    d.metiers.forEach(({ e, pourquoi, etudes }) => {
      const nom = joli(e.nom);
      texte(`•  ${nom}${e.niv ? `  (niveau minimal : ${e.niv})` : ''}`, { indent: 4, gap: 0.5 });
      if (pourquoi.length) texte(`Parce que ${pourquoi.join(', ')}.${etudes ? " Colle avec mes envies d'études." : ''}`, { size: 9, indent: 9, gap: 0.5, color: GRIS });
      place(5);
      doc.setFontSize(8.5).setTextColor(...PERVENCHE);
      doc.textWithLink(`Fiche ONISEP : onisep.fr › ${e.id}`, M + 9, y, { url: `https://www.onisep.fr/http/redirection/metier/slug/${e.id}` });
      y += 5.5;
    });
  } else {
    texte("Je n'en ai pas encore coché. Je peux en noter ici :", { indent: 4, color: GRIS, gap: 0 });
    lignesVides(3);
  }

  place(45); // titre + lignes + encadré du Centre restent ensemble si possible
  if (d.rapport.length) {
    titre('Le lien avec mon Rapport des Possibles');
    texte("Ce que j'ai dit rejoint ces métiers de mon rapport (les autres restent tout aussi ouverts) :", { indent: 4, color: GRIS });
    d.rapport.forEach((r) => {
      texte(`•  ${r.nom}`, { bold: true, indent: 4, gap: 0.5 });
      texte(`Parce que ${r.pourquoi.join(', ')}.`, { size: 9, indent: 9, gap: 2, color: GRIS });
    });
  }

  titre('Mes questions pour le ou la psychologue');
  lignesVides(3);

  // Centre
  place(30); y += 2;
  doc.setFillColor(...VIOLET).roundedRect(M, y, L, 24, 2, 2, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(255, 255, 255).text(theme.centre.nom, M + 5, y + 8);
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(207, 203, 255);
  doc.text(`${theme.centre.adresse} · ${theme.centre.public}`, M + 5, y + 14);
  doc.setTextColor(...MAGENTA).textWithLink(`Prendre rendez-vous : ${theme.centre.rdvUrl.replace('https://', '')}`, M + 5, y + 20, { url: theme.centre.rdvUrl });

  // Pied de page
  const n = doc.getNumberOfPages();
  for (let p = 1; p <= n; p++) {
    doc.setPage(p).setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...GRIS);
    doc.text('Outil de réflexion indicatif (modèle RIASEC de J. Holland), pas un test psychométrique. Métiers : ONISEP. Créé sur ton appareil, rien n\'a été envoyé.', M, 290, { maxWidth: L - 12 });
    doc.text(`${p}/${n}`, W - M, 290, { align: 'right' });
  }

  doc.save(`mon-profil-trait-d-union-${new Date().toISOString().slice(0, 10)}.pdf`);
}
