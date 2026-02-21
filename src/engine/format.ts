/**
 * Formatter — converts MythWorld data into display text.
 */

import type { MythWorld, RuinId } from "./types";
import * as tpl from "./templates";
import * as lex from "./lexicon";
import { createRNG } from "./rng";
import { mythifyTerm } from "./distort";

// ─── Helpers ───

function fillGodTemplate(
  template: string,
  world: MythWorld,
  rngSeed: string
): string {
  const rng = createRNG(rngSeed);
  const g = world.god;
  return template
    .replace("{godTitle}", g.mythTitle)
    .replace("{domain}", g.domain)
    .replace("{trueNatureMyth}", rng.pick(tpl.trueNatureMythVersions))
    .replace("{sealVerb}", rng.pick(lex.sealVerbs))
    .replace("{awakeningOmen}", g.awakeningOmen)
    .replace("{punishment}", g.punishment)
    .replace("{epithet}", g.epithet);
}

// ─── World Summary ───

export function formatWorldSummary(world: MythWorld, truthMode: boolean): string {
  const lines: string[] = [];

  lines.push("══════════════════════════════════════");
  lines.push(`  ◈ 파괴신: ${world.god.mythTitle}`);
  lines.push("══════════════════════════════════════");
  lines.push("");

  // God intro: pick 4 templates deterministically
  const rng = createRNG(`god_intro_${world.seed}`);
  const templates = rng.shuffle([...tpl.godIntroTemplates]);
  const count = rng.int(3, 5);
  for (let i = 0; i < count; i++) {
    const filled = fillGodTemplate(templates[i], world, `god_tpl_${world.seed}_${i}`);
    lines.push(filled);
  }

  if (truthMode) {
    lines.push("");
    lines.push("── [진실 모드] ──");
    lines.push(`실체: ${world.god.trueNature}`);
  }

  lines.push("");
  lines.push(`칭호: ${world.god.epithet}`);
  lines.push(`영역: ${world.god.domain}`);
  lines.push(`봉인: ${world.god.sealDescription}`);

  return lines.join("\n");
}

// ─── Ruin ───

export function formatRuin(
  world: MythWorld,
  ruinId: RuinId,
  truthMode: boolean
): string {
  const ruin = world.ruins.find((r) => r.id === ruinId);
  if (!ruin) return `유적 ${ruinId}를 찾을 수 없습니다.`;

  const faction = ruin.controlledByFactionId
    ? world.factions.find((f) => f.id === ruin.controlledByFactionId)
    : null;

  const rng = createRNG(`ruin_${ruinId}_${world.seed}`);

  const lines: string[] = [];
  lines.push("──────────────────────────────────────");
  lines.push(`  ◈ 유적 [${ruin.id}] ${ruin.mythName}`);
  lines.push("──────────────────────────────────────");
  lines.push("");

  // Pick myth role
  const mythRole = rng.pick(tpl.ruinMythRoles);
  lines.push(`이곳은 ${mythRole}이라 전해진다.`);
  lines.push("");

  lines.push(`유물: ${ruin.relic}`);
  lines.push(`  └ ${ruin.relicEffect}`);
  lines.push("");

  if (faction) {
    const ritual = rng.pick(lex.rituals);
    lines.push(`지배: ${faction.name}`);
    lines.push(`  └ 그들의 ${ritual}로 힘이 깃든다.`);
  } else {
    lines.push("지배: 없음 — 이곳은 어떤 교단도 장악하지 못한 폐허이다.");
  }
  lines.push("");

  lines.push(`성스러운 효과: ${ruin.religiousEffect}`);
  lines.push(`금기: ${ruin.taboo}`);

  if (truthMode) {
    lines.push("");
    lines.push("── [진실 모드] ──");
    lines.push(`실제 기능: ${ruin.trueFunction}`);
  }

  return lines.join("\n");
}

// ─── Faction ───

export function formatFaction(
  world: MythWorld,
  factionId: string,
  truthMode: boolean
): string {
  const faction = world.factions.find((f) => f.id === factionId);
  if (!faction) return `파벌을 찾을 수 없습니다.`;

  const rng = createRNG(`faction_${factionId}_${world.seed}`);

  const lines: string[] = [];
  lines.push("──────────────────────────────────────");
  lines.push(`  ◈ ${faction.name}`);
  lines.push("──────────────────────────────────────");
  lines.push("");

  lines.push(`${faction.name}은(는) "${faction.ideology}"을 신봉한다.`);
  lines.push("");

  // Controlled ruins
  if (faction.controlledRuins.length > 0) {
    const ruinNames = faction.controlledRuins.map((rid) => {
      const r = world.ruins.find((ruin) => ruin.id === rid);
      return r ? `[${r.id}] ${r.mythName}` : rid;
    });
    lines.push(`성지: ${ruinNames.join(", ")}`);
  } else {
    lines.push("성지: 아직 확보하지 못함");
  }
  lines.push("");

  lines.push(`창건 신화: ${faction.founderMyth}`);
  lines.push("");
  lines.push(`교리: ${faction.doctrine}`);
  lines.push("");
  lines.push(`파괴신에 대한 입장: ${faction.attitudeToDestroyer}`);
  lines.push("");

  const ritual = rng.pick(lex.rituals);
  lines.push(`그들의 사제는 ${ritual}을 통해 권능을 유지한다.`);
  lines.push("");

  if (faction.rivals.length > 0) {
    lines.push(`원수: ${faction.rivals.join(", ")}`);
  } else {
    lines.push("원수: 알려진 적 없음");
  }

  if (truthMode) {
    lines.push("");
    lines.push("── [진실 모드] ──");
    const controlledTruths = faction.controlledRuins.map((rid) => {
      const r = world.ruins.find((ruin) => ruin.id === rid);
      return r ? `[${r.id}] ${r.trueFunction}` : rid;
    });
    lines.push(`점유 시설(실제): ${controlledTruths.join(", ") || "없음"}`);
  }

  return lines.join("\n");
}

// ─── Timeline ───

export function formatTimeline(world: MythWorld, truthMode: boolean): string {
  const lines: string[] = [];
  lines.push("══════════════════════════════════════");
  lines.push("  ◈ 연대기");
  lines.push("══════════════════════════════════════");
  lines.push("");

  for (const event of world.timeline) {
    const yearLabel = event.year < 0
      ? `봉인력 ${Math.abs(event.year)}년`
      : `봉인력 이후 ${event.year}년`;

    lines.push(`▸ ${yearLabel}`);
    lines.push(`  ${event.mythVersion}`);

    if (truthMode) {
      lines.push(`  [진실] ${mythifyTerm(event.trueEvent)}`);
    }

    lines.push("");
  }

  return lines.join("\n");
}
