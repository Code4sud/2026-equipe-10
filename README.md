# Équipe 10 — Hackathon Azuréen #3

Projet réalisé à Nice les 18, 19 et 20 novembre 2026, sur le thème **« L'orientation et l'employabilité grâce à l'IA »**, organisé par [Code4Sud](https://code4sud.fr).

## Le projet

Après le Centre des Possibles, un jeune repart avec une liste de métiers dont il ne sait souvent rien. **Explore tes possibles** lit son rapport sur son téléphone (rien n'est envoyé), explique chaque métier avec des sources publiques (ROME, ONISEP, Carif-Oref), montre tous les chemins pour y arriver près de Nice et prépare son rendez-vous avec le psychologue. Pas de note, pas de classement, et « je ne sais pas » plutôt qu'une réponse inventée.

**Changer le nom ou les couleurs :** tout est dans `src/theme.ts`.

## Lancer le projet

```bash
npm install          # installe aussi le hook qui bloque PDF, Excel et private/
cp .env.example .env # VITE_API_URL vide = mode démo, sans backend
npm run dev          # http://localhost:5173/2026-equipe-10/
```

## Publier sur le site du hackathon

1. Complétez `projet.json` (nom, pitch, description, écoles, technologies, liens).
2. Ajoutez vos captures dans `captures/` et listez-les dans `projet.json`.
3. Poussez sur `main` : votre fiche apparaît sur https://orientation.code4sud.fr/projets/equipe-10 en moins d'une minute.

Toute la doc : https://orientation.code4sud.fr/doc/

## Démo en ligne

Si votre projet est un site sans serveur, il est publié automatiquement sur GitHub Pages à chaque push :
`https://code4sud.github.io/2026-equipe-10/`. Reportez cette adresse dans le champ `demo` de `projet.json`.

## Licence

MIT — voir `LICENSE`.
