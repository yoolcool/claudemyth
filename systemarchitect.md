# System Architecture — MYTH ENGINE

## 아키텍처 개요

```
┌─────────────────────────────────────────────┐
│                   Web UI                     │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ TopBar  │ │ MainView │ │ BottomPanel  │  │
│  │(seed,   │ │(pre-wrap │ │ ┌──────────┐ │  │
│  │ gen,    │ │ text     │ │ │  Tabs    │ │  │
│  │ truth)  │ │ display) │ │ │W|R|F|P|R|T│ │  │
│  └─────────┘ └──────────┘ │ └──────────┘ │  │
│                            │ ┌──────────┐ │  │
│                            │ │ *Panel   │ │  │
│                            │ │ (리스트)  │ │  │
│                            │ └──────────┘ │  │
│                            └──────────────┘  │
└───────────────┬─────────────────────────────┘
                │ generateMythWorld(seed)
                │ format*(world, truthMode)
┌───────────────▼─────────────────────────────┐
│              Engine Layer                    │
│                                              │
│  ┌───────┐   ┌──────────┐   ┌────────────┐  │
│  │  RNG  │──▶│ Generate │──▶│   Format   │  │
│  │(seed) │   │          │   │(truthMode) │  │
│  └───────┘   └────┬─────┘   └────────────┘  │
│                   │                          │
│       ┌───────────┼───────────┐              │
│       ▼           ▼           ▼              │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐       │
│  │ Lexicon │ │Templates │ │ Distort │       │
│  │ (어휘)  │ │ (문장)   │ │ (왜곡)  │       │
│  └─────────┘ └──────────┘ └─────────┘       │
└──────────────────────────────────────────────┘
```

## 데이터 흐름

```
seed(number|string)
  │
  ▼
createRNG(seed) → RNG 인스턴스
  │
  ├─▶ generateDestroyerGod(rng)     → DestroyerGod
  ├─▶ generateRuins(rng, god)       → Ruin[7]
  ├─▶ generateFactions(rng, ruins)  → Faction[3~4]
  ├─▶ generateTimeline(rng, ...)    → TimelineEvent[8~14]
  ├─▶ generatePeople(rng, ...)      → Character[6~12]
  └─▶ generateRelations(rng, ...)   → RelationEdge[10~20]
  │
  ▼
MythWorld 객체 (모든 데이터 포함)
  │
  ├─▶ formatWorldSummary(world, truthMode)  → string
  ├─▶ formatRuin(world, ruinId, truthMode)  → string
  ├─▶ formatFaction(world, factionId, ...)  → string
  ├─▶ formatCharacter(world, charId, ...)   → string
  ├─▶ formatRelations(world, truthMode)     → string
  └─▶ formatTimeline(world, truthMode)      → string
```

**핵심**: RNG 인스턴스는 하나만 생성되어 순차적으로 소비됨 → seed가 같으면 모든 호출 순서가 동일 → 결정적 출력

## 파일별 상세

### engine/rng.ts (97 lines)

**역할**: 결정적 난수 생성기

```typescript
interface RNG {
  next(): number;              // [0, 1) float
  int(min, max): number;       // inclusive 정수
  pick<T>(arr): T;             // 배열에서 1개 선택
  shuffle<T>(arr): T[];        // Fisher-Yates 셔플
  chance(p): boolean;          // 확률 판정
  weightedPick<T>(items, weights): T;  // 가중 선택
  pickN<T>(arr, n): T[];       // N개 고유 선택
  pickUnique<T>(arr, usedSet): T;  // usedSet에 없는 것 선택 (중복 방지)
}
```

- mulberry32 알고리즘 (state 기반, 단방향)
- `hashSeed()`: string seed를 uint32로 해싱
- `pickUnique()`: usedSet 소진 시 fallback to pick (결정성 유지)

### engine/types.ts (88 lines)

**역할**: 모든 데이터 구조 정의

| 타입 | 핵심 필드 |
|---|---|
| `RuinId` | `"A"\|"B"\|...\|"G"` 리터럴 유니언 |
| `DestroyerGod` | mythTitle, epithet, domain, trueNature |
| `Ruin` | id, mythName, trueFunction, relic, controlledByFactionId |
| `Faction` | id, name, ideology, doctrine, controlledRuins[], rivals[] |
| `TimelineEvent` | year, trueEvent, mythVersion |
| `Character` | id, name, epithet, archetype, factionId?, linkedRuins[], goals[], mythBio, truthBio |
| `RelationEdge` | from, to, kind(13종), mythLine, truthLine? |
| `RelationKind` | ally\|mentor\|betrayal\|rival\|oath\|blood\|trade\|hunt\|prophecy\|secret\|curse\|debt\|oracle |
| `MythWorld` | seed, god, ruins[], factions[], timeline[], people[], relations[] |

### engine/lexicon.ts (752 lines)

**역할**: 어휘 사전 — 하드코딩된 단어/구문 배열

| 카테고리 | 배열명 | 개수 | 용도 |
|---|---|---|---|
| 파괴신 칭호 | `titles` | 24 | 파괴신 이름 |
| 파괴신 별칭 | `epithets` | 18 | 파괴신 수식어 |
| 파괴신 영역 | `domains` | 20 | 파괴신 속성 |
| 과학→신화 | `techToMyth` | 40쌍 | distort에서 치환 |
| 교단명 | `clergy` | 16 | 타임라인/파벌 |
| 의식명 | `rituals` | 16 | 파벌/유적 |
| 유적 명사 | `ruinNouns` | 24 | 유적 이름 조합 |
| 유적 형용사 | `ruinAdjs` | 24 | 유적 이름 조합 |
| 파벌 접두/핵/접미 | `factionPrefix/Core/Suffix` | 20/20/20 | 파벌 이름 조합 |
| 유물 접두/명사 | `relicPrefixes/relicNouns` | 20/24 | 유물 이름 |
| 유물 동사 | `relicVerbs` | 12 | 유물 효과 |
| 징조 | `omens` | 16 | 타임라인/왜곡 |
| 처벌 | `punishments` | 14 | 파괴신 소개 |
| 봉인 동사 | `sealVerbs` | 12 | 봉인 묘사 |
| 금기 | `taboos` | 14 | 유적 |
| 과학 기능 | `trueFunctions` | 20 | trueFunction 배정 |
| 과학 본질 | `trueNatures` | 10 | 파괴신 trueNature |
| 이념 | `ideologies` | 12 | 파벌 생성 |
| 교리 | `doctrines` | 12 | 파벌 생성 |
| 창건 신화 | `founderMyths` | 12 | 파벌 생성 |
| 태도 | `attitudes` | 10 | 파벌 생성 |
| 종교 효과 | `religiousEffects` | 14 | 유적 |
| 인물 이름 접두/접미 | `namePrefix/nameSuffix` | 20/20 | 인물 이름 |
| 인물 칭호 | `characterEpithets` | 15 | 인물 |
| 원형 | `archetypes` | 12 | 인물 |
| 목표 | `characterGoals` | 14 | 인물 |
| 성격 | `personalityTraits` | 10 | 확장용 (미사용) |
| 상처 | `wounds` | 10 | 확장용 (미사용) |
| 상징 | `symbols` | 10 | 확장용 (미사용) |
| 관계 동사 | `relationVerbs` | 12 | 관계 |
| 진실 바이오 | `truthBioSnippets` | 20 | 인물 truthBio |
| 관계 진실 | `relationTruthSnippets` | 16 | 관계 truthLine |

**미사용 어휘** (향후 확장 시 generate.ts에서 활용): `personalityTraits`, `wounds`, `symbols`, `relicVerbs`

### engine/templates.ts (323 lines)

**역할**: `{slot}` 방식 문장 템플릿

| 배열명 | 개수 | 용도 |
|---|---|---|
| `godIntroTemplates` | 16 | 파괴신 소개문 |
| `ruinIntroTemplates` | 20 | 유적 소개문 |
| `ruinMythRoles` | 20 | 유적 역할 서술 |
| `relicEffectTemplates` | 14 | 유물 효과 |
| `factionIntroTemplates` | 16 | 파벌 소개문 |
| `timelineMythTemplates` | 30 | 타임라인 신화 |
| `timelineTrueTemplates` | 24 | 타임라인 진실 |
| `fellVerbs` | 14 | 신화적 동사 |
| `trueNatureMythVersions` | 14 | 파괴신 본질의 신화 버전 |
| `characterIntroTemplates` | 30 | 인물 mythBio |
| `truthBioTemplates` | 10 | 인물 truthBio |
| `relationMythTemplates` | 30 | 관계 mythLine |
| `religiousToneReplacements` | 16쌍 | 어투 변환 |

**슬롯 규약**: `{godTitle}`, `{domain}`, `{name}`, `{A}`, `{B}`, `{ruin}`, `{faction}` 등

### engine/distort.ts (52 lines)

**역할**: 과학 텍스트 → 신화 텍스트 변환

```
mythifyTerm(text)          — techToMyth 사전 치환
elevateToReligiousTone(text) — religiousToneReplacements 치환
addTabooOrOmen(rng, text)  — 40% 확률로 금기/징조 문장 추가
distortSentence(rng, text) — 위 3개 파이프라인 연결
```

### engine/generate.ts (494 lines)

**역할**: 핵심 생성기

**생성 순서** (RNG 소비 순서 — 변경하면 결정성 깨짐):
1. `generateDestroyerGod(rng)` — 파괴신
2. `generateRuins(rng, god)` — 유적 7개
3. `generateFactions(rng, ruins)` — 파벌 3~4, 유적 분배, 라이벌 배정
4. `generateTimeline(rng, god, ruins, factions)` — 타임라인
5. `generatePeople(rng, ruins, factions)` — 인물 6~12
6. `generateRelations(rng, people, factions, ruins)` — 관계 10~20

**하드 제약 보장 로직**:
- 유적 고유 이름: `usedNames` Set으로 중복 방지
- 파벌당 최소 1유적: shuffledRuinIds에서 순서대로 배정
- 인물당 최소 1유적: Phase 3에서 미할당 유적 강제 연결
- betrayal ≥1: 생성 후 보장 로직
- secret|curse ≥1: 별도 보장 로직
- 최소 10 엣지: while loop으로 person↔faction/ruin 추가

### engine/format.ts (352 lines)

**역할**: MythWorld → 표시 텍스트 변환

- `truthMode=false`: 신화 텍스트만
- `truthMode=true`: trueFunction, truthBio, truthLine 병기
- 각 format 함수는 독립적 RNG 생성 (`createRNG("prefix_seed")`) — 표시 순서와 무관하게 결정적

### engine/index.ts (34 lines)

**역할**: barrel export. 외부에서는 이 파일만 import

## UI 아키텍처

### 상태 관리 (App.tsx)

```typescript
world: MythWorld | null        // 생성된 세계
currentSeed: number | null     // 현재 seed
truthMode: boolean             // 진실 모드
activeTab: TabId               // 현재 탭
mainContent: string            // 메인 뷰 텍스트
selectedRuin: RuinId | null    // 선택된 유적
selectedFaction: string | null // 선택된 파벌
selectedCharacter: CharacterId | null // 선택된 인물
```

### 탭 구조

| TabId | 패널 컴포넌트 | 표시 내용 |
|---|---|---|
| `"world"` | WorldPanel | 파괴신 소개 |
| `"ruins"` | RuinsPanel | A~G 유적 리스트 → 선택 시 상세 |
| `"factions"` | FactionsPanel | 파벌 리스트 → 선택 시 상세 |
| `"people"` | PeoplePanel | 인물 리스트 → 선택 시 상세+관계 |
| `"relations"` | RelationsPanel | 전체 관계도 텍스트 |
| `"timeline"` | TimelinePanel | 전체 연대기 |

### 이벤트 흐름

```
User: seed 입력 + Generate 클릭
  → handleGenerate(seed)
    → generateMythWorld(seed)
    → setWorld(w), setMainContent(formatWorldSummary)

User: 하단 패널 아이템 클릭
  → onSelect(formatXxx(world, id, truthMode))
    → setMainContent(text)

User: Truth 토글
  → setTruthMode(!prev)
  → (재클릭 시 truthMode 반영된 텍스트 표시)
```

## 확장 시 주의사항

### 결정성을 깨지 않으려면

1. `generate.ts`에서 RNG 호출 순서를 바꾸지 말 것
2. 새 생성 단계를 추가할 때는 **반드시 기존 단계 뒤에** 추가
3. 기존 lexicon/templates 배열의 **순서를 변경하지 말 것** (항목 추가는 가능)
4. `pickUnique`는 usedSet이 소진되면 fallback하므로 배열 크기 > 사용 횟수 권장

### 새 탭/데이터 추가 시

1. `types.ts`에 새 타입 추가
2. `MythWorld`에 새 필드 추가
3. `generate.ts`에 생성 함수 추가 (기존 생성 단계 **뒤에**)
4. `format.ts`에 포매터 추가
5. `index.ts`에 export 추가
6. UI: `Tabs.tsx`에 TabId 추가, 패널 컴포넌트 생성, `BottomPanel.tsx`에 라우팅 추가, `App.tsx`에 state 추가
