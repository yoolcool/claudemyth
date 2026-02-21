export type RuinId = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export const ALL_RUIN_IDS: readonly RuinId[] = ["A", "B", "C", "D", "E", "F", "G"];

export interface DestroyerGod {
  mythTitle: string;
  epithet: string;
  domain: string;
  trueNature: string;       // hidden truth (tech origin)
  sealDescription: string;
  awakeningOmen: string;
  punishment: string;
}

export interface Ruin {
  id: RuinId;
  mythName: string;
  trueFunction: string;
  relic: string;
  relicEffect: string;
  religiousEffect: string;
  taboo: string;
  controlledByFactionId: string | null;
}

export interface Faction {
  id: string;
  name: string;
  ideology: string;
  doctrine: string;
  founderMyth: string;
  controlledRuins: RuinId[];
  rivals: string[];
  attitudeToDestroyer: string;
}

export interface TimelineEvent {
  year: number;
  trueEvent: string;
  mythVersion: string;
}

export type CharacterId = string;

export type RelationKind =
  | "ally"
  | "mentor"
  | "betrayal"
  | "rival"
  | "oath"
  | "blood"
  | "trade"
  | "hunt"
  | "prophecy"
  | "secret"
  | "curse"
  | "debt"
  | "oracle";

export type DialogueSet = {
  greet: string[];     // 첫 조우 (2~4줄)
  rumor: string[];     // 세계관/유적/파벌 소문 (2~4줄)
  warning: string[];   // 금기/위협/경고 (1~3줄)
  offer: string[];     // 제안/유혹/거래 (1~3줄)
  farewell: string[];  // 작별 (1~2줄)
  repeat: string[];    // 반복 조우 (1~3줄)
  truth?: string[];    // Truth ON일 때만 표시 (1~3줄)
};

export interface Character {
  id: CharacterId;
  name: string;
  epithet: string;
  archetype: string;
  factionId?: string;
  linkedRuins: RuinId[];
  goals: string[];
  mythBio: string;
  truthBio: string;
  dialogue: DialogueSet;
}

export interface RelationEdge {
  from: string;
  to: string;
  kind: RelationKind;
  mythLine: string;
  truthLine?: string;
}

export interface MythWorld {
  seed: number | string;
  god: DestroyerGod;
  ruins: Ruin[];
  factions: Faction[];
  timeline: TimelineEvent[];
  people: Character[];
  relations: RelationEdge[];
}
