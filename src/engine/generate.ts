/**
 * Core myth world generator — deterministic, seed-based.
 */

import { createRNG, type RNG } from "./rng";
import type {
  DestroyerGod,
  Ruin,
  RuinId,
  Faction,
  TimelineEvent,
  MythWorld,
} from "./types";
import { ALL_RUIN_IDS } from "./types";
import * as lex from "./lexicon";
import * as tpl from "./templates";
import { distortSentence, mythifyTerm } from "./distort";

// ─── 1. Destroyer God ───

function generateDestroyerGod(rng: RNG): DestroyerGod {
  const mythTitle = rng.pick(lex.titles);
  const epithet = rng.pick(lex.epithets);
  const domain = rng.pick(lex.domains);
  const trueNature = rng.pick(lex.trueNatures);
  const sealVerb = rng.pick(lex.sealVerbs);
  const awakeningOmen = rng.pick(lex.omens);
  const punishment = rng.pick(lex.punishments);

  return {
    mythTitle,
    epithet,
    domain,
    trueNature,
    sealDescription: `일곱 유적은 ${mythTitle}의 숨결을 ${sealVerb} 위한 봉인의 못이다.`,
    awakeningOmen,
    punishment,
  };
}

// ─── 2. Ruins ───

function generateRuins(rng: RNG, _god: DestroyerGod): Ruin[] {
  // Ensure unique myth names
  const usedNames = new Set<string>();
  const ruins: Ruin[] = [];

  for (const id of ALL_RUIN_IDS) {
    let mythName: string;
    do {
      const adj = rng.pick(lex.ruinAdjs);
      const noun = rng.pick(lex.ruinNouns);
      mythName = `${adj} ${noun}`;
    } while (usedNames.has(mythName));
    usedNames.add(mythName);

    const relicPrefix = rng.pick(lex.relicPrefixes);
    const relicNoun = rng.pick(lex.relicNouns);
    const relic = `${relicPrefix} ${relicNoun}`;

    const relicEffect = rng.pick(tpl.relicEffectTemplates);
    const trueFunction = rng.pick(lex.trueFunctions);
    const religiousEffect = rng.pick(lex.religiousEffects);
    const taboo = rng.pick(lex.taboos);

    ruins.push({
      id,
      mythName,
      trueFunction,
      relic,
      relicEffect,
      religiousEffect,
      taboo,
      controlledByFactionId: null, // assigned after factions generated
    });
  }

  return ruins;
}

// ─── 3. Factions ───

function generateFactions(rng: RNG, ruins: Ruin[]): Faction[] {
  const count = rng.int(3, 4);
  const factions: Faction[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let name: string;
    do {
      const pre = rng.pick(lex.factionPrefix);
      const core = rng.pick(lex.factionCore);
      const suf = rng.pick(lex.factionSuffix);
      name = `${pre} ${core} ${suf}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    factions.push({
      id: `faction_${i}`,
      name,
      ideology: rng.pick(lex.ideologies),
      doctrine: rng.pick(lex.doctrines),
      founderMyth: rng.pick(lex.founderMyths),
      controlledRuins: [],
      rivals: [],
      attitudeToDestroyer: rng.pick(lex.attitudes),
    });
  }

  // ─── Distribute ruins to factions ───
  // Each faction gets at least 1 ruin
  const shuffledRuinIds = rng.shuffle([...ALL_RUIN_IDS]);

  // First: give each faction 1 ruin
  for (let i = 0; i < factions.length; i++) {
    const ruinId = shuffledRuinIds[i];
    factions[i].controlledRuins.push(ruinId);
    const ruin = ruins.find((r) => r.id === ruinId)!;
    ruin.controlledByFactionId = factions[i].id;
  }

  // Remaining ruins: randomly assign or leave uncontrolled
  for (let i = factions.length; i < shuffledRuinIds.length; i++) {
    const ruinId = shuffledRuinIds[i];
    if (rng.chance(0.6)) {
      const faction = rng.pick(factions);
      faction.controlledRuins.push(ruinId);
      const ruin = ruins.find((r) => r.id === ruinId)!;
      ruin.controlledByFactionId = faction.id;
    }
    // else: uncontrolled
  }

  // ─── Assign rivals ───
  for (const f of factions) {
    const others = factions.filter((o) => o.id !== f.id);
    const rivalCount = rng.int(1, Math.min(2, others.length));
    const rivals = rng.pickN(others, rivalCount);
    f.rivals = rivals.map((r) => r.name);
  }

  return factions;
}

// ─── 4. Timeline ───

function generateTimeline(
  rng: RNG,
  god: DestroyerGod,
  ruins: Ruin[],
  factions: Faction[]
): TimelineEvent[] {
  const eventCount = rng.int(8, 14);
  const events: TimelineEvent[] = [];

  // Generate sorted years
  const years: number[] = [];
  for (let i = 0; i < eventCount; i++) {
    years.push(rng.int(-1200, -10));
  }
  years.sort((a, b) => a - b);

  for (let i = 0; i < eventCount; i++) {
    const year = years[i];

    // trueEvent
    const trueTpl = rng.pick(tpl.timelineTrueTemplates);
    const techSystem = rng.pick(lex.trueFunctions);
    const trueRuinId = rng.pick(ALL_RUIN_IDS);
    const trueEvent = trueTpl
      .replace("{techSystem}", techSystem)
      .replace("{id}", trueRuinId);

    // mythVersion — compose 2-3 myth sentences
    const mythSentences: string[] = [];
    const sentenceCount = rng.int(2, 3);
    for (let s = 0; s < sentenceCount; s++) {
      const mythTpl = rng.pick(tpl.timelineMythTemplates);
      const ruin = rng.pick(ruins);
      const faction = rng.pick(factions);
      const filled = mythTpl
        .replace("{omen}", rng.pick(lex.omens))
        .replace("{place}", ruin.mythName)
        .replace("{fellVerb}", rng.pick(tpl.fellVerbs))
        .replace("{clergyGroup}", rng.pick(lex.clergy))
        .replace("{ritualName}", rng.pick(lex.rituals))
        .replace("{techMythWord}", mythifyTerm(rng.pick(lex.trueFunctions)))
        .replace("{godTitle}", god.mythTitle)
        .replace("{domain}", god.domain)
        .replace("{factionName}", faction.name);
      mythSentences.push(distortSentence(rng, filled));
    }

    events.push({
      year,
      trueEvent,
      mythVersion: mythSentences.join(" "),
    });
  }

  return events;
}

// ─── 5. Main generator ───

export function generateMythWorld(seed: number | string): MythWorld {
  const rng = createRNG(seed);
  const god = generateDestroyerGod(rng);
  const ruins = generateRuins(rng, god);
  const factions = generateFactions(rng, ruins);
  const timeline = generateTimeline(rng, god, ruins, factions);

  return { seed, god, ruins, factions, timeline };
}

// ─── Public API helpers ───

export function getRuinLore(world: MythWorld, ruinId: RuinId): Ruin | undefined {
  return world.ruins.find((r) => r.id === ruinId);
}

export function getFaction(world: MythWorld, factionId: string): Faction | undefined {
  return world.factions.find((f) => f.id === factionId);
}
