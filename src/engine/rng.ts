/**
 * Deterministic RNG engine — seed-based, reproducible.
 * Uses mulberry32 PRNG with string/number seed hashing.
 */

function hashSeed(seed: number | string): number {
  if (typeof seed === "number") {
    return seed >>> 0;
  }
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

export interface RNG {
  /** Returns float in [0, 1) */
  next(): number;
  /** Integer in [min, max] inclusive */
  int(min: number, max: number): number;
  /** Pick one element from array */
  pick<T>(arr: readonly T[]): T;
  /** Shuffle array (returns new array) */
  shuffle<T>(arr: readonly T[]): T[];
  /** Returns true with given probability (0–1) */
  chance(p: number): boolean;
  /** Weighted pick: items with weights */
  weightedPick<T>(items: readonly T[], weights: readonly number[]): T;
  /** Pick N unique elements from array */
  pickN<T>(arr: readonly T[], n: number): T[];
  /** Pick one element not in usedSet, add it to usedSet. Falls back to pick if exhausted. */
  pickUnique<T>(arr: readonly T[], usedSet: Set<T>): T;
}

export function createRNG(seed: number | string): RNG {
  let state = hashSeed(seed);
  if (state === 0) state = 1;

  // mulberry32
  function next(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function int(min: number, max: number): number {
    return min + Math.floor(next() * (max - min + 1));
  }

  function pick<T>(arr: readonly T[]): T {
    return arr[int(0, arr.length - 1)];
  }

  function shuffle<T>(arr: readonly T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = int(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function chance(p: number): boolean {
    return next() < p;
  }

  function weightedPick<T>(items: readonly T[], weights: readonly number[]): T {
    const total = weights.reduce((s, w) => s + w, 0);
    let r = next() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  function pickN<T>(arr: readonly T[], n: number): T[] {
    const shuffled = shuffle(arr);
    return shuffled.slice(0, Math.min(n, arr.length));
  }

  function pickUnique<T>(arr: readonly T[], usedSet: Set<T>): T {
    const available = arr.filter((x) => !usedSet.has(x));
    if (available.length === 0) {
      // All exhausted — fall back to regular pick
      return pick(arr);
    }
    const item = pick(available);
    usedSet.add(item);
    return item;
  }

  return { next, int, pick, shuffle, chance, weightedPick, pickN, pickUnique };
}
