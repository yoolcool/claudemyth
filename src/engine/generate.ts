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
  Character,
  CharacterId,
  RelationEdge,
  RelationKind,
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

    // mythVersion — compose 2-3 myth sentences (pickUnique within event)
    const mythSentences: string[] = [];
    const usedEventTpls = new Set<string>();
    const sentenceCount = rng.int(2, 3);
    for (let s = 0; s < sentenceCount; s++) {
      const mythTpl = rng.pickUnique(tpl.timelineMythTemplates, usedEventTpls);
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

// ─── 5. People ───

function generatePeople(
  rng: RNG,
  ruins: Ruin[],
  factions: Faction[]
): Character[] {
  const count = rng.int(6, 12);
  const people: Character[] = [];
  const usedNames = new Set<string>();

  // Helper: make unique name
  function makeName(): string {
    let name: string;
    do {
      const pre = rng.pick(lex.namePrefix);
      const suf = rng.pick(lex.nameSuffix);
      name = `${pre}${suf}`;
    } while (usedNames.has(name));
    usedNames.add(name);
    return name;
  }

  // Phase 1: ensure each faction has at least 1 member
  for (const faction of factions) {
    if (people.length >= count) break;
    const char = buildCharacter(rng, makeName(), faction.id, ruins);
    people.push(char);
  }

  // Phase 2: fill remaining slots
  while (people.length < count) {
    // 70% chance of belonging to a faction, 30% unaffiliated
    const factionId = rng.chance(0.7) ? rng.pick(factions).id : undefined;
    const char = buildCharacter(rng, makeName(), factionId, ruins);
    people.push(char);
  }

  // Phase 3: ensure all ruins A~G are covered by at least 1 linkedRuins
  for (const ruinId of ALL_RUIN_IDS) {
    const hasLink = people.some((p) => p.linkedRuins.includes(ruinId));
    if (!hasLink) {
      // Add this ruin to a random character
      const char = rng.pick(people);
      if (!char.linkedRuins.includes(ruinId)) {
        char.linkedRuins.push(ruinId);
      }
    }
  }

  return people;
}

function buildCharacter(
  rng: RNG,
  name: string,
  factionId: string | undefined,
  ruins: Ruin[]
): Character {
  const id: CharacterId = `char_${name.toLowerCase()}`;
  const epithet = rng.pick(lex.characterEpithets);
  const archetype = rng.pick(lex.archetypes);

  // linkedRuins: 1~2
  const linkedCount = rng.int(1, 2);
  const linkedRuins = rng.pickN(ALL_RUIN_IDS as unknown as RuinId[], linkedCount) as RuinId[];

  // goals: 1~2
  const goalCount = rng.int(1, 2);
  const goals = rng.pickN([...lex.characterGoals], goalCount);

  // mythBio: 3~6 sentences from templates (using pickUnique to avoid repeats)
  const bioCount = rng.int(3, 6);
  const shuffledTpls = rng.shuffle([...tpl.characterIntroTemplates]);
  const usedTpls = new Set<string>();
  const bioLines: string[] = [];
  for (let i = 0; i < bioCount && i < shuffledTpls.length; i++) {
    const template = rng.pickUnique(shuffledTpls, usedTpls);
    const ruinNames = linkedRuins.map((rid) => {
      const r = ruins.find((ruin) => ruin.id === rid);
      return r ? r.mythName : rid;
    });
    const filled = template
      .replace("{name}", name)
      .replace("{epithet}", epithet)
      .replace("{factionName}", factionId ? factionId : "무소속")
      .replace("{archetype}", archetype)
      .replace("{ruinList}", ruinNames.join(", "))
      .replace("{goal}", goals[0]);
    bioLines.push(distortSentence(rng, filled));
  }
  const mythBio = bioLines.join(" ");

  // truthBio — use truthBioTemplates for variety
  const truthSnippet = rng.pick(lex.truthBioSnippets);
  const truthTemplate = rng.pick(tpl.truthBioTemplates);
  const truthBio = truthTemplate
    .replace("{name}", name)
    .replace("{snippet}", truthSnippet)
    .replace("{goals}", goals.join(", "));

  return {
    id,
    name,
    epithet,
    archetype,
    factionId,
    linkedRuins,
    goals,
    mythBio,
    truthBio,
  };
}

// ─── 6. Relations ───

const RELATION_KINDS: readonly RelationKind[] = [
  "ally",
  "mentor",
  "betrayal",
  "rival",
  "oath",
  "blood",
  "trade",
  "hunt",
  "prophecy",
  "secret",
  "curse",
  "debt",
  "oracle",
];

function generateRelations(
  rng: RNG,
  people: Character[],
  factions: Faction[],
  ruins: Ruin[]
): RelationEdge[] {
  const edges: RelationEdge[] = [];
  const edgeCount = rng.int(10, 20);
  const edgeSet = new Set<string>();

  function edgeKey(a: string, b: string): string {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }

  // Helper: pick kind based on context
  function pickKind(charA: Character, charB: Character): RelationKind {
    // Same ruin → higher ally chance
    const sharesRuin = charA.linkedRuins.some((r) =>
      charB.linkedRuins.includes(r)
    );
    // Same faction → ally, different → rival
    const sameFaction =
      charA.factionId && charB.factionId && charA.factionId === charB.factionId;

    if (sameFaction && rng.chance(0.5)) return "ally";
    if (sharesRuin && rng.chance(0.4)) return "ally";
    if (!sameFaction && charA.factionId && charB.factionId && rng.chance(0.4))
      return "rival";
    return rng.pick(RELATION_KINDS);
  }

  // Generate edges between people (use pickUnique for templates to reduce repetition)
  const usedMythTpls = new Set<string>();
  for (let i = 0; i < edgeCount && i < 50; i++) {
    const charA = rng.pick(people);
    const charB = rng.pick(people.filter((p) => p.id !== charA.id));
    if (!charB) continue;

    const key = edgeKey(charA.id, charB.id);
    if (edgeSet.has(key)) continue;
    edgeSet.add(key);

    const kind = pickKind(charA, charB);

    // mythLine from template (pickUnique to avoid repeating same template)
    const mythTpl = rng.pickUnique(tpl.relationMythTemplates, usedMythTpls);
    const ruinForRelation = rng.pick(ruins);
    const factionForRelation = rng.pick(factions);
    const mythLine = mythTpl
      .replace("{A}", charA.name)
      .replace("{B}", charB.name)
      .replace("{ruin}", ruinForRelation.mythName)
      .replace("{faction}", factionForRelation.name);

    // truthLine
    const truthLine = rng.pick(lex.relationTruthSnippets);

    edges.push({
      from: charA.id,
      to: charB.id,
      kind,
      mythLine,
      truthLine,
    });
  }

  // Guarantee at least 1 betrayal
  const hasBetrayal = edges.some((e) => e.kind === "betrayal");
  if (!hasBetrayal && edges.length > 0) {
    edges[rng.int(0, edges.length - 1)].kind = "betrayal";
  }

  // Guarantee at least 1 secret or curse
  const hasSecretOrCurse = edges.some(
    (e) => e.kind === "secret" || e.kind === "curse"
  );
  if (!hasSecretOrCurse && edges.length > 1) {
    // Pick a different edge than the betrayal one
    const betrayalIdx = edges.findIndex((e) => e.kind === "betrayal");
    let targetIdx = rng.int(0, edges.length - 1);
    if (targetIdx === betrayalIdx && edges.length > 1) {
      targetIdx = (targetIdx + 1) % edges.length;
    }
    edges[targetIdx].kind = rng.chance(0.5) ? "secret" : "curse";
  }

  // Guarantee minimum 10 edges — add person↔faction / person↔ruin if needed
  while (edges.length < 10) {
    const char = rng.pick(people);
    if (rng.chance(0.5) && char.factionId) {
      const faction = factions.find((f) => f.id === char.factionId);
      if (faction) {
        const kind = rng.pick(["oath", "blood", "trade"] as const);
        edges.push({
          from: char.id,
          to: faction.id,
          kind,
          mythLine: `${char.name}은(는) ${faction.name}과(와) ${rng.pick(lex.relationVerbs)}.`,
          truthLine: rng.pick(lex.relationTruthSnippets),
        });
      }
    } else if (char.linkedRuins.length > 0) {
      const ruinId = rng.pick(char.linkedRuins);
      const ruin = ruins.find((r) => r.id === ruinId);
      if (ruin) {
        edges.push({
          from: char.id,
          to: ruinId,
          kind: "prophecy",
          mythLine: `${char.name}은(는) ${ruin.mythName}의 예언과 얽혀 있다.`,
          truthLine: rng.pick(lex.relationTruthSnippets),
        });
      }
    }
  }

  return edges;
}

// ─── 7. Main generator ───

export function generateMythWorld(seed: number | string): MythWorld {
  const rng = createRNG(seed);
  const god = generateDestroyerGod(rng);
  const ruins = generateRuins(rng, god);
  const factions = generateFactions(rng, ruins);
  const timeline = generateTimeline(rng, god, ruins, factions);
  const people = generatePeople(rng, ruins, factions);
  const relations = generateRelations(rng, people, factions, ruins);

  return { seed, god, ruins, factions, timeline, people, relations };
}

// ─── Public API helpers ───

export function getRuinLore(world: MythWorld, ruinId: RuinId): Ruin | undefined {
  return world.ruins.find((r) => r.id === ruinId);
}

export function getFaction(world: MythWorld, factionId: string): Faction | undefined {
  return world.factions.find((f) => f.id === factionId);
}

export function getCharacter(world: MythWorld, charId: CharacterId): Character | undefined {
  return world.people.find((p) => p.id === charId);
}

export function getPeopleForRuin(world: MythWorld, ruinId: RuinId): Character[] {
  return world.people.filter((p) => p.linkedRuins.includes(ruinId));
}

export function getRelationsFor(world: MythWorld, entityId: string): RelationEdge[] {
  return world.relations.filter((r) => r.from === entityId || r.to === entityId);
}
