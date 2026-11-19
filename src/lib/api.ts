import type { AssistantAnswer, Metier } from '../types';
import { answerDemo } from './assistantDemo';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';

export const isDemoMode = API_URL === '';

/** Réveille le backend gratuit (Render s'endort après 15 min d'inactivité ; le réveil prend jusqu'à ~50 s). */
export function warmUp(): void {
  if (!isDemoMode) fetch(`${API_URL}/api/health`).catch(() => {});
}

/**
 * Pose une question à l'assistant.
 * - Sans VITE_API_URL : mode démo, réponses construites localement.
 * - Avec VITE_API_URL : backend FastAPI (seuls la question et l'identifiant du métier sont envoyés,
 *   jamais le rapport ni des données personnelles).
 * En cas d'erreur réseau, on retombe sur le mode démo plutôt que d'afficher une erreur.
 */
export async function askAssistant(question: string, metier: Metier): Promise<AssistantAnswer> {
  if (isDemoMode) return answerDemo(question, metier);
  try {
    const res = await fetch(`${API_URL}/api/chat`, {
      signal: AbortSignal.timeout(70_000), // au-delà, on répond en mode démo
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, metier_id: metier.id, metier_nom: metier.nom, zone: metier.zoneRapport ?? null }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      text: String(data.text ?? ''),
      sources: Array.isArray(data.sources) ? data.sources : [],
      known: Boolean(data.known),
      suggestSave: Boolean(data.suggest_save),
    };
  } catch {
    return answerDemo(question, metier);
  }
}
