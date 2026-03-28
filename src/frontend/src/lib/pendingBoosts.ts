export interface PendingBoost {
  videoUrl: string;
  views: number;
  likes: number;
  comments: number;
  followers: number;
  appliedAt?: number;
}

const STORAGE_KEY = "tiktok_pending_boosts";

export function savePendingBoost(boost: PendingBoost): void {
  const existing = getPendingBoosts();
  existing.push({ ...boost, appliedAt: undefined });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getPendingBoosts(): PendingBoost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingBoost[]) : [];
  } catch {
    return [];
  }
}

export function clearPendingBoosts(): void {
  localStorage.removeItem(STORAGE_KEY);
}
