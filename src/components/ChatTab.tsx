import { useEffect, useRef, useState } from 'react';
import { askAssistant, isDemoMode } from '../lib/api';
import { SUGGESTIONS } from '../lib/assistantDemo';
import type { ChatMessage, Metier, SavedQuestion } from '../types';
import { Card, Sources } from './Layout';
import { IconMic, IconReset, IconSend } from './Icons';

interface Props {
  metiers: Metier[];
  metierId: string;
  onMetierChange: (id: string) => void;
  messages: ChatMessage[];
  setMessages: (fn: (prev: ChatMessage[]) => ChatMessage[]) => void;
  saved: SavedQuestion[];
  onSave: (q: SavedQuestion) => void;
  goCentre: () => void;
  goRapport: () => void;
}

let seq = 0;
const uid = () => `m${Date.now()}-${seq++}`;

export function ChatTab({ metiers, metierId, onMetierChange, messages, setMessages, saved, onSave, goCentre, goRapport }: Props) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const metier = metiers.find((m) => m.id === metierId) ?? metiers[0];

   useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages.length, busy]);

  if (!metier) {
    return (
      <Card className="empty">
        <strong className="title-md">Choisis d'abord tes métiers</strong>
        <p className="body">L'assistant répond sur les métiers de ton rapport.</p>
        <button type="button" className="btn" onClick={goRapport}>Aller à mon rapport</button>
      </Card>
    );
  }

  const asked = new Set(messages.filter((m) => m.role === 'user').map((m) => m.text));
  const chips = SUGGESTIONS.filter((s) => !asked.has(s));
  const isSaved = (q: string) => saved.some((s) => s.question === q && s.metierNom === metier.nom);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput('');
    setMessages((prev) => [...prev, { id: uid(), role: 'user', text: q }]);
    setBusy(true);
    const answer = await askAssistant(q, metier);
    setMessages((prev) => [...prev, { id: uid(), role: 'assistant', text: answer.text, answer, question: q }]);
    setBusy(false);
  }

  return (
    <div className="chat-layout">
      <section className="chat-main">
        <div className="row between wrap">
          <div className="stack-xs">
            <h1 className="disp title-lg">Assistant</h1>
            <label className="metier-select">
              <span className="muted">Sur :</span>
              <select value={metier.id} onChange={(e) => onMetierChange(e.target.value)}>
                {metiers.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
            </label>
          </div>
          <div className="row">
            <button type="button" className="pill-accent" onClick={goCentre}>Questions pour le psy · {saved.length}</button>
            <button type="button" className="icon-btn" aria-label="Recommencer la conversation" onClick={() => setMessages(() => [])}><IconReset /></button>
          </div>
        </div>

        <div className="chat-box" aria-live="polite">
          <div className="bubble bot">
            Salut ! Pose-moi tes questions sur ce métier. Je réponds avec les sources publiques, et je te dis quand je ne sais pas.
          </div>
          {messages.map((m) =>
            m.role === 'user' ? (
              <div key={m.id} className="bubble user">{m.text}</div>
            ) : (
              <div key={m.id} className="bubble bot">
                <span>{m.text}</span>
                {m.answer && m.answer.sources.length > 0 && <Sources sources={m.answer.sources} />}
                {m.answer && !m.answer.known && <span className="warn">Pas de source vérifiée : je préfère ne pas inventer.</span>}
                {m.answer?.suggestSave && m.question && (isSaved(m.question) ? (
                  <span className="ok">Gardée pour ton rendez-vous au Centre</span>
                ) : (
                  <button type="button" className="save-btn" onClick={() => onSave({ question: m.question!, metierNom: metier.nom })}>
                    Garder cette question pour mon psychologue
                  </button>
                ))}
              </div>
            ),
          )}
          {busy && <div className="bubble bot typing" aria-label="L'assistant écrit">•••</div>}
          <div ref={endRef} />
        </div>

        <div className="chips">
          {chips.map((c) => <button key={c} type="button" className="chip" onClick={() => send(c)}>{c}</button>)}
        </div>

        <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <label htmlFor="question" className="sr-only">Ta question</label>
          <input id="question" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Écris ta question…" autoComplete="off" />
          {input.trim() ? (
            <button type="submit" className="round-btn" aria-label="Envoyer"><IconSend /></button>
          ) : (
            <button type="button" className="round-btn" aria-label="Parler au lieu d'écrire (bientôt)" title="Bientôt disponible"><IconMic /></button>
          )}
        </form>
        {isDemoMode && <span className="muted tiny">Mode démo : réponses construites à partir des fiches, aucune donnée envoyée.</span>}
      </section>

      <aside className="chat-aside only-desktop">
        <Card>
          <h2 className="h2">Comment je réponds</h2>
          <p className="body">Avec ROME, l'ONISEP et l'offre de formation de la Région Sud. Si je ne trouve pas de source fiable, je te le dis.</p>
        </Card>
        <Card>
          <h2 className="h2">Je ne choisis pas pour toi</h2>
          <p className="body">Pas de note, pas de classement. Pour décider, parles-en avec un·e psychologue du Centre.</p>
          <button type="button" className="btn btn-ghost" onClick={goCentre}>Voir le Centre</button>
        </Card>
      </aside>
    </div>
  );
}
