// Petit stockage local (sur l'appareil uniquement). Échoue silencieusement si indisponible.
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`etp:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`etp:${key}`, JSON.stringify(value));
  } catch {
    /* stockage indisponible : on continue sans */
  }
}
