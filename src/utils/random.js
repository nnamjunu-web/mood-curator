/*
  random.js — 랜덤 추천에 쓰는 도우미 함수 모음
  - 공통 원리: "후보를 넓게 모아 → 잘 섞어 → 앞에서 N개만 뽑기"
*/

/*
  randomInt — min~max 사이의 정수를 하나 무작위로 고른다 (양 끝 포함).
    입력: min(최소), max(최대)
    반환: min 이상 max 이하의 정수
  - 예: randomInt(1, 10) → 1,2,…,10 중 하나
*/
export function randomInt(min, max) {
  // Math.random(): 0 이상 1 미만의 실수를 돌려줌
  // (max - min + 1)을 곱하고 내림한 뒤 min을 더하면 [min, max] 정수가 된다
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/*
  fisherYatesShuffle — 배열을 고르게(편향 없이) 섞어 새 배열로 돌려준다.
    입력: array(원본 배열)
    반환: 섞인 새 배열 (원본은 건드리지 않음)

  ───────────────────────────────────────────────────────────────
  왜 array.sort(() => Math.random() - 0.5) 를 쓰면 안 되나?
  - sort는 "두 원소를 비교"해 정렬하는 함수다. 비교 함수가 매번 무작위 값을 주면,
    정렬 알고리즘 입장에서는 "일관성 없는 비교"가 되어 결과가 고르게 섞이지 않는다.
  - 게다가 정렬 구현(브라우저/엔진)에 따라 어떤 원소는 더 자주 앞에 오는 등
    위치별 확률이 한쪽으로 치우친다(편향). 즉 "겉보기엔 랜덤 같지만 실제로는 불공정".
  - 피셔-예이츠(Fisher–Yates)는 뒤에서부터 한 칸씩 "지금 칸 ~ 첫 칸" 중 하나를 골라
    맞바꾼다. 모든 순열이 같은 확률로 나오는, 수학적으로 공정한 셔플이다.
  ───────────────────────────────────────────────────────────────
*/
export function fisherYatesShuffle(array) {
  // 원본을 바꾸지 않도록 복사본을 만든다 ([...array] = 얕은 복사)
  const result = [...array]

  // 맨 끝(i)부터 시작해 0까지 내려가며,
  for (let i = result.length - 1; i > 0; i--) {
    // 0 ~ i 사이에서 무작위 위치 j를 고른다
    const j = randomInt(0, i)
    // i번째와 j번째 원소를 맞바꾼다 (구조 분해 할당으로 한 줄 교환)
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

/*
  pickRandom — 후보 배열에서 "제외 목록을 뺀 뒤 섞어서" count개를 뽑는다.
    입력:
      array      : 후보 배열 (각 원소는 id를 가져야 함)
      count      : 뽑을 개수
      excludeIds : 제외할 id 목록 (직전에 보여준 항목들) — 기본 []
    반환: 뽑힌 항목 배열 (최대 count개)

  - 제외하고 남은 게 너무 적으면(0개) 어쩔 수 없이 전체에서 뽑아 화면이 비지 않게 한다.
*/
export function pickRandom(array, count, excludeIds = []) {
  // Set: 포함 여부(has) 확인이 빠른 자료구조. 제외 목록을 Set으로 만든다.
  const excludeSet = new Set(excludeIds)

  // 직전에 보여준 항목을 먼저 걸러낸다
  let pool = array.filter((item) => !excludeSet.has(item.id))

  // 전부 제외되어 남은 게 없으면, 폴백으로 전체에서 뽑는다(빈 화면 방지)
  if (pool.length === 0) pool = array

  // 공정하게 섞은 뒤 앞에서 count개만 반환
  return fisherYatesShuffle(pool).slice(0, count)
}
