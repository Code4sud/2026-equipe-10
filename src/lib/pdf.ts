// Lecture du Rapport des Possibles DANS LE NAVIGATEUR : le fichier ne quitte jamais l'appareil.
// On n'en garde que les noms de métiers reconnus ; le profil (scores, graphiques) est ignoré (règle 2).

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/·[a-z]+/g, '') // Esthéticien·ne -> estheticien
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

async function pdfToText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((it) => ('str' in it ? it.str : '')).join(' '));
  }
  return pages.join('\n');
}

/** Renvoie les identifiants des métiers connus dont le nom apparaît dans le PDF. */
export async function findMetiersInPdf(file: File, known: { id: string; nom: string }[]): Promise<string[]> {
  const text = ` ${normalize(await pdfToText(file))} `;
  return known.filter((m) => text.includes(` ${normalize(m.nom)} `)).map((m) => m.id);
}
