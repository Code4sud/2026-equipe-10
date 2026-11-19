// ─────────────────────────────────────────────────────────────
//  THÈME : changez ici le nom de l'app, les couleurs et les polices.
//  Rien d'autre à modifier : tout le front lit ces valeurs.
// ─────────────────────────────────────────────────────────────
export const theme = {
  appName: "TRAIT D'UNION",
  appTagline: 'tes possibles',
  personaNote: 'Démo · persona fictif',

  colors: {
    accent: '#E8399A', // magenta : titres forts, étoiles, alertes positives
    primary: '#5E63F0', // pervenche : boutons, onglet actif
    primarySoft: '#A9A6FF', // contours, liens
    text: '#FFFFFF',
    textSoft: '#CFCBFF',
    textMuted: '#B8B4E8',
    success: '#2FBF8F',
    bgFrom: '#1C1B6B', // dégradé du fond, du haut vers le bas
    bgMid: '#2A1C78',
    bgMid2: '#4A1A78',
    bgTo: '#651C7E',
    card: 'rgba(255, 255, 255, 0.07)',
    cardBorder: 'rgba(255, 255, 255, 0.16)',
    nav: 'rgba(14, 10, 52, 0.82)',
  },

  fonts: {
    display: "'Montserrat', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
  },

  centre: {
    nom: 'Centre des Possibles',
    adresse: "Hub de l'innovation · 61-63 av. Simone Veil, Nice · tram Méridia",
    public: 'Ouvert aux 16-25 ans',
    rdvUrl: 'https://centredespossibles.org',
  },
};

/** Recopie le thème dans des variables CSS (--c-accent, --f-display…). */
export function applyTheme(): void {
  const root = document.documentElement.style;
  for (const [k, v] of Object.entries(theme.colors)) root.setProperty(`--c-${k}`, v);
  root.setProperty('--f-display', theme.fonts.display);
  root.setProperty('--f-body', theme.fonts.body);
}
