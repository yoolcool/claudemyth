# MYTH ENGINE

Seed 기반 결정적 신화 세계 생성기. Warhammer 40K / Dune 톤의 신화 텍스트를 생성한다.

## 빠른 시작

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ 빌드
```

## 핵심 개념

- **Seed 결정성**: 같은 seed → 완전히 동일한 결과. 모든 선택은 mulberry32 PRNG 기반
- **세계관**: 극먼 미래, 한때의 과학은 상실/금기/신화화. 종교가 지배하는 세계
- **파괴신**: 7개 유적(A~G)으로 봉인. 유물 7개를 모으면 부활 가능
- **이중 레이어**: 모든 것에 "신화 버전"과 "진실 버전"이 존재 (Truth 토글)

## 기술 스택

- Vite + React 19 + TypeScript
- 상태관리: React useState만 사용
- 스타일: App.css 단일 파일 (다크 테마)
- 외부 라이브러리 없음 (순수 구현)

## 프로젝트 구조

```
src/
  engine/              # 세계 생성 엔진 (UI 무관)
    rng.ts             # mulberry32 PRNG + pickUnique
    types.ts           # 모든 타입 정의
    lexicon.ts         # 어휘 사전 (750+ lines)
    templates.ts       # 문장 템플릿 (320+ lines)
    distort.ts         # 과학→신화 왜곡 파이프라인
    generate.ts        # 세계 생성기 (god/ruins/factions/timeline/people/relations)
    format.ts          # 텍스트 포매터 (truthMode 지원)
    index.ts           # barrel export
  ui/                  # React UI 컴포넌트
    TopBar.tsx         # seed 입력, Generate, Random, Truth 토글
    MainView.tsx       # 메인 텍스트 표시 영역
    BottomPanel.tsx    # 탭 라우팅 컨테이너
    Tabs.tsx           # World/Ruins/Factions/People/Relations/Timeline
    WorldPanel.tsx     # 파괴신 정보
    RuinsPanel.tsx     # 유적 A~G 리스트
    FactionsPanel.tsx  # 파벌 리스트
    PeoplePanel.tsx    # 인물 리스트
    RelationsPanel.tsx # 관계도
    TimelinePanel.tsx  # 연대기
  app/
    App.tsx            # 메인 앱 (state 관리)
    App.css            # 전체 스타일
  main.tsx             # React 엔트리포인트
```

## 생성 결과물 (seed 1개당)

| 항목 | 수량 | 설명 |
|---|---|---|
| 파괴신 | 1 | title, epithet, domain, trueNature |
| 유적 | 7 (A~G 고정) | mythName, relic, trueFunction, taboo |
| 파벌 | 3~4 | name, ideology, doctrine, controlledRuins |
| 인물 | 6~12 | name, epithet, archetype, linkedRuins, goals, mythBio |
| 관계 | 10~20 | 13종 kind, mythLine, truthLine |
| 타임라인 | 8~14 | trueEvent + mythVersion |

## 하드 제약 (코드 변경 시 절대 깨지면 안 됨)

1. **Seed 결정성**: `generateMythWorld(seed)` — 같은 seed → 동일 결과
2. **유적 A~G 고정**: 7개, ID 변경 불가
3. **파벌당 최소 1 유적**: 모든 파벌이 유적 1개 이상 점유
4. **인물당 linkedRuins 1~2개**: 모든 유적 A~G가 최소 1명과 연결
5. **관계 최소 10개**: betrayal ≥1, secret|curse ≥1 보장
6. **Truth 토글**: 모든 데이터에 myth/truth 이중 레이어

## Public API (Poc2 연동용)

```typescript
import {
  generateMythWorld,
  getRuinLore,
  getFaction,
  getCharacter,
  getPeopleForRuin,
  getRelationsFor,
} from "./engine";

const world = generateMythWorld(42);
const ruinA = getRuinLore(world, "A");
const faction = getFaction(world, "faction_0");
const char = getCharacter(world, "char_아르온");
const peopleAtA = getPeopleForRuin(world, "A");
const rels = getRelationsFor(world, "char_아르온");
```

## 콘텐츠 확장 방법

- **어휘 추가**: `lexicon.ts`의 해당 배열에 항목 추가
- **문장 템플릿 추가**: `templates.ts`의 해당 배열에 `{slot}` 형식 문자열 추가
- **왜곡 규칙 추가**: `distort.ts` 또는 `lexicon.ts`의 `techToMyth`에 쌍 추가
- **관계 종류 추가**: `types.ts`의 `RelationKind` + `generate.ts`의 `RELATION_KINDS` + `format.ts`의 `relationKindLabel`

## 참조 문서

- [systemarchitect.md](./systemarchitect.md) — 시스템 아키텍처 상세
- [workinghistory.md](./workinghistory.md) — 개발 히스토리
