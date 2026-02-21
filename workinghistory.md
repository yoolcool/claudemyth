# Working History — MYTH ENGINE

## 커밋 히스토리

### v0.1.0 — 초기 POC (commit: 5f806d8)

**목표**: seed 입력 → 신화/문화/파벌/유적 서사 생성 → 웹에서 텍스트 열람

**구현 내용**:
- Vite + React + TypeScript 프로젝트 세팅
- 결정적 RNG (mulberry32) — `rng.ts`
- 핵심 타입 정의 — `types.ts` (RuinId, DestroyerGod, Ruin, Faction, TimelineEvent, MythWorld)
- 어휘 사전 — `lexicon.ts` (titles, epithets, domains, techToMyth, clergy, rituals, ruinNouns/Adjs, factionPrefix/Core/Suffix, relics, omens, punishments, taboos, trueFunctions, trueNatures, ideologies, doctrines, founderMyths, attitudes, religiousEffects)
- 문장 템플릿 — `templates.ts` (godIntro, ruinIntro, factionIntro, timeline, fellVerbs, trueNatureMythVersions, religiousToneReplacements)
- 왜곡 엔진 — `distort.ts` (mythifyTerm, elevateToReligiousTone, addTabooOrOmen)
- 생성기 — `generate.ts` (파괴신 1, 유적 A~G, 파벌 3~4, 타임라인 8~14)
- 포매터 — `format.ts` (formatWorldSummary, formatRuin, formatFaction, formatTimeline + truthMode)
- 웹 UI — 상단 바(seed/Generate/Random/Truth) + 메인 뷰(pre-wrap) + 하단 패널(World/Ruins/Factions/Timeline 탭)
- 다크 테마 CSS, 모바일 safe-area 대응

**파일 목록**: 30개 파일, 5,248줄

---

### v0.2.0 — People & Relations (commit: 5150f8e)

**목표**: 등장인물 6~12명 + 관계도 생성, People/Relations 탭 추가

**구현 내용**:
- 새 타입: `Character`, `CharacterId`, `RelationEdge`, `RelationKind` (9종: ally, mentor, betrayal, rival, oath, blood, trade, hunt, prophecy)
- `MythWorld`에 `people[]`, `relations[]` 추가
- 인물 생성 규칙:
  - 6~12명, 각 파벌 최소 1명
  - linkedRuins 1~2개, 모든 유적 A~G 최소 1명 커버
  - mythBio 3~6문장, truthBio 진실 1줄
- 관계 생성 규칙:
  - 10~20 엣지, 같은 유적 공유 시 ally 확률↑, 교차 파벌 시 rival 확률↑
  - betrayal ≥1 보장
- 어휘 추가: namePrefix/Suffix, characterEpithets, archetypes, characterGoals, relationVerbs, truthBioSnippets, relationTruthSnippets
- 템플릿 추가: characterIntroTemplates (8), relationMythTemplates (8)
- 포매터 추가: formatPeopleList, formatCharacter, formatRelations
- API: getCharacter, getPeopleForRuin, getRelationsFor
- UI: PeoplePanel, RelationsPanel, 탭에 People/Relations 추가

**변경**: 11파일, +663줄

---

### v0.3.0 — 콘텐츠 풀 2배 확장 (commit: 62a5899)

**목표**: 생성 품질 향상을 위한 어휘/템플릿 ~2배 보강

**Lexicon 확장 요약**:
| 카테고리 | Before → After |
|---|---|
| titles | 10 → 24 |
| epithets | 7 → 18 |
| domains | 10 → 20 |
| techToMyth | 15 → 40쌍 |
| clergy/rituals | 8/8 → 16/16 |
| ruinNouns/Adjs | 12/12 → 24/24 |
| relicPrefixes/Nouns | 10/12 → 20/24 |
| factionPrefix/Core/Suffix | 10/10/10 → 20/20/20 |
| ideologies/doctrines | 6/6 → 12/12 |
| founderMyths | 6 → 12 |
| attitudes | 5 → 10 |
| religiousEffects | 7 → 14 |
| omens/punishments | 8/7 → 16/14 |
| sealVerbs/taboos | 6/7 → 12/14 |
| trueFunctions/trueNatures | 10/5 → 20/10 |
| namePrefix/Suffix | 10/10 → 20/20 |
| characterEpithets | 7 → 15 |
| archetypes | 6 → 12 |
| characterGoals | 7 → 14 |
| truthBioSnippets | 10 → 20 |
| relationTruthSnippets | 8 → 16 |
| relationVerbs | 6 → 12 |

**신규 어휘 카테고리**: relicVerbs(12), personalityTraits(10), wounds(10), symbols(10)

**Templates 확장 요약**:
| 배열 | Before → After |
|---|---|
| godIntroTemplates | 8 → 16 |
| ruinIntroTemplates | 7 → 20 |
| ruinMythRoles | 10 → 20 |
| relicEffectTemplates | 7 → 14 |
| factionIntroTemplates | 8 → 16 |
| timelineMythTemplates | 7 → 30 |
| timelineTrueTemplates | 12 → 24 |
| fellVerbs | 7 → 14 |
| trueNatureMythVersions | 7 → 14 |
| characterIntroTemplates | 8 → 30 |
| relationMythTemplates | 8 → 30 |
| religiousToneReplacements | 10 → 16쌍 |

**신규 템플릿**: truthBioTemplates(10)

**기능 변경**:
- 새 관계 종류 4개: secret, curse, debt, oracle (총 9→13종)
- secret|curse ≥1 보장 로직 추가
- `pickUnique(arr, usedSet)` — rng.ts에 추가 (중복 방지 유틸)
- mythBio, 관계 mythLine, 타임라인 문장에서 pickUnique 적용

**변경**: 6파일, +571줄

---

## 현재 상태 (v0.3.0)

- **총 라인**: ~2,700줄
- **Engine**: 6파일 / ~2,190줄
- **UI**: 9파일 / ~371줄
- **App**: 1파일 / 66줄
- **빌드 크기**: JS ~241KB (gzip ~78KB), CSS ~4KB

## 알려진 이슈 / 개선 기회

### 미사용 어휘 (lexicon.ts에 존재하지만 generate.ts에서 아직 활용 안 함)
- `personalityTraits` — 인물 성격 (10개)
- `wounds` — 인물 상처/저주 (10개)
- `symbols` — 인물 문양/상징 (10개)
- `relicVerbs` — 유물 동사 (12개)

→ 향후 인물 mythBio나 유적 설명에 통합 가능

### UI 개선 기회
- Truth 토글 시 현재 표시 중인 콘텐츠 자동 갱신 (현재는 재클릭 필요)
- 관계도를 시각적 그래프로 표시
- 유적 간 지도 시각화
- 인물 상세에서 관련 유적/파벌로 바로 이동 (cross-navigation)

### 엔진 개선 기회
- 유적 간 관계 (인접, 봉인 연결) 데이터 추가
- 파벌 간 전쟁/동맹 관계 구조화
- 타임라인에 인물 참여 연결
- 예언/경전 전문 생성 시스템

## 의사결정 기록

| 결정 | 이유 |
|---|---|
| mulberry32 PRNG 채택 | 구현 단순, 품질 충분, seed 결정성 보장 |
| 모든 어휘를 하드코딩 배열로 | 외부 데이터 로딩 불필요, 번들에 포함, 타입 안전성 |
| format.ts에서 별도 RNG 생성 | 표시 순서와 생성 순서 분리 → 포매터 독립 실행 가능 |
| pickUnique fallback to pick | usedSet 소진 시에도 결정성 유지하면서 에러 방지 |
| 관계 최소 10개 보장 (while loop) | person↔faction/ruin 관계로 부족분 보충 |
| 파벌명 prefix+core+suffix 조합 | 20×20×20 = 8,000가지 조합으로 다양성 확보 |
| Truth 토글을 UI 상태로만 관리 | 데이터 자체에 myth/truth 모두 저장, 표시만 전환 |
