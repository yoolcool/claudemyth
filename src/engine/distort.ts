/**
 * Distortion engine — transforms technical text into mythical/religious tone.
 */

import type { RNG } from "./rng";
import { techToMyth, omens, taboos } from "./lexicon";
import { religiousToneReplacements } from "./templates";

/**
 * Replace tech keywords with mythical equivalents.
 */
export function mythifyTerm(text: string): string {
  let result = text;
  for (const [tech, myth] of techToMyth) {
    result = result.replaceAll(tech, myth);
  }
  return result;
}

/**
 * Replace report/technical tone with religious/prophetic tone.
 */
export function elevateToReligiousTone(text: string): string {
  let result = text;
  for (const [from, to] of religiousToneReplacements) {
    result = result.replaceAll(from, to);
  }
  return result;
}

/**
 * With probability 0.3–0.5, append a taboo or omen line to the text.
 */
export function addTabooOrOmen(rng: RNG, text: string): string {
  if (rng.chance(0.4)) {
    const extra = rng.chance(0.5)
      ? rng.pick(omens)
      : rng.pick(taboos);
    return text + " " + extra;
  }
  return text;
}

/**
 * Full distortion pipeline for a single sentence.
 */
export function distortSentence(rng: RNG, text: string): string {
  let result = mythifyTerm(text);
  result = elevateToReligiousTone(result);
  result = addTabooOrOmen(rng, result);
  return result;
}
