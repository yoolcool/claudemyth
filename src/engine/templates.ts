/**
 * Sentence templates for myth generation.
 * {slots} are filled by the generator with RNG-selected lexicon values.
 */

// ─── 파괴신 소개 (3–5문장 풀) ───

export const godIntroTemplates = [
  "그들은 {godTitle}를 {domain}의 주인이라 부른다.",
  "{godTitle}는 한때 {trueNatureMyth}의 형태로 이 땅을 걸었다고 전한다.",
  "일곱 유적은 {godTitle}의 숨결을 {sealVerb} 위한 봉인의 못이다.",
  "유물 일곱이 한 곳에 모이면, {awakeningOmen}이 시작된다고 한다.",
  "그러나 진실을 말하는 자는 {punishment}을 맞는다.",
  "{epithet}라 불리는 그 존재의 잔영은 아직도 일곱 유적 사이를 떠돈다.",
  "경전에 따르면 {godTitle}의 눈은 {domain}으로 이루어져 있다.",
  "그가 마지막으로 내뱉은 숨결이 대지를 갈랐고, 그 틈에 유적이 세워졌다.",
] as const;

// ─── 유적 소개 (각 유적 2–4문장 풀) ───

export const ruinIntroTemplates = [
  "[{id}] {mythName}",
  "이곳은 {ruinMythRole}이라 전해진다.",
  "유물: {relic} — {relicEffect}",
  "지배: {factionNameOrNone}. 그들의 {ritual}로 힘이 깃든다.",
  "금기: {taboo}",
  "이 유적에 가까이 다가서면 {omen}고 한다.",
  "봉인의 {sealVerb} 의식이 매 달 이곳에서 행해진다.",
] as const;

// ─── 유적 역할 서술 ───

export const ruinMythRoles = [
  "파괴신의 왼팔이 묻힌 곳",
  "신의 숨결이 잠든 제단",
  "일곱 봉인 중 가장 깊은 못",
  "파괴신의 꿈이 흐르는 우물",
  "신의 분노가 응축된 심장",
  "세계가 처음 갈라진 틈새",
  "파괴신의 눈물이 결정화된 성소",
  "최후의 기계성인이 쓰러진 자리",
  "봉인의 마지막 못이 박힌 곳",
  "금기의 지식이 봉헌된 도서관",
] as const;

// ─── 유물 효과 서술 ───

export const relicEffectTemplates = [
  "만지면 봉인이 흔들리며 대지가 울린다",
  "소유한 자에게 금지된 환시를 보여준다",
  "근처의 모든 기계가 속삭이기 시작한다",
  "어둠 속에서 스스로 빛을 내며 길을 보여준다",
  "피를 바치면 봉인의 일부가 열린다",
  "꿈에서 파괴신의 목소리를 들려준다",
  "시간의 흐름이 이 유물 주변에서 왜곡된다",
] as const;

// ─── 파벌 소개 (각 파벌 3–6문장 풀) ───

export const factionIntroTemplates = [
  "{factionName}은(는) {ideology}을 신봉한다.",
  "그들은 {controlledRuinsList}을(를) 성지로 삼는다.",
  "창건 신화: {founderMyth}",
  "교리: {doctrine}",
  "파괴신에 대한 입장: {attitude}",
  "원수: {rivalList}",
  "그들의 사제는 {ritual}을 통해 권능을 유지한다.",
  "{factionName}의 기사들은 유적을 순례하며 봉인의 상태를 감시한다.",
] as const;

// ─── 타임라인 mythVersion 템플릿 ───

export const timelineMythTemplates = [
  "그 해, {omen} {place}가 {fellVerb}했다.",
  "{clergyGroup}는 이를 '{ritualName}'이라 기록했다.",
  "사람들은 {techMythWord}을(를) 보았다고 속삭였다.",
  "경전에 따르면, {godTitle}의 {domain}이 잠시 깨어난 것이라 한다.",
  "이후 {factionName}이 일어나 {place}를 장악했다.",
  "봉인이 흔들리자 {omen} 대지가 울었다.",
  "그날 이후 {place}에서는 누구도 꿈을 꾸지 못하게 되었다.",
] as const;

// ─── 타임라인 trueEvent 템플릿 ───

export const timelineTrueTemplates = [
  "{techSystem}이(가) 과부하로 셧다운되었다.",
  "{techSystem}에서 데이터 유출이 발생했다.",
  "위성 네트워크와의 통신이 두절되었다.",
  "나노기계 생산 라인에서 변이체가 출현했다.",
  "AI 코어의 자기 복제 프로세스가 폭주했다.",
  "궤도 엘리베이터 {id}번 기저부가 구조적으로 붕괴했다.",
  "방어포대 시스템이 아군 시설을 오인 공격했다.",
  "생체공학 피험자 집단이 시설을 탈출했다.",
  "양자 통신에서 미확인 신호가 반복 수신되었다.",
  "핵심코어의 출력이 한계치를 넘어섰다.",
  "프로토콜 갱신 중 전체 네트워크가 일시 정지했다.",
  "실험실에서 예측 불가능한 에너지 파동이 관측되었다.",
] as const;

// ─── 타임라인 fellVerb (신화적 서술 동사) ───

export const fellVerbs = [
  "무너져 내렸",
  "불타올랐",
  "침묵에 잠겼",
  "재로 변했",
  "갈라졌",
  "어둠에 삼켜졌",
  "하늘로 솟구쳤",
] as const;

// ─── 파괴신 trueNature의 신화화 버전 ───

export const trueNatureMythVersions = [
  "꺼지지 않는 불꽃",
  "영원히 깨어 있는 눈",
  "만물을 삼키는 입",
  "하늘에서 떨어진 그림자",
  "대지 아래 잠든 거인",
  "일곱 개의 머리를 가진 뱀",
  "형체 없는 목소리",
] as const;

// ─── 종교적 어투 변환 패턴 ───

export const religiousToneReplacements: readonly [string, string][] = [
  ["보고에 따르면", "경전에 기록되기를"],
  ["관측되었다", "예언에 나타났다"],
  ["시스템 오류", "신의 분노"],
  ["제어 불능", "봉인의 균열"],
  ["기술적 결함", "금기의 대가"],
  ["과부하", "신벌"],
  ["셧다운", "침묵의 심판"],
  ["통신 두절", "천상의 침묵"],
  ["탈출", "해방"],
  ["변이", "각성"],
] as const;
