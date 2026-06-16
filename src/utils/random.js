/*
  random.js — 랜덤 추천 도우미: 후보를 넓게 모아 → 섞어 → 앞에서 N개만 뽑기
*/

// min~max 사이의 정수를 하나 무작위로 고른다 (양 끝 포함)
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/*
  fisherYatesShuffle — 배열을 편향 없이 섞어 새 배열로 반환(원본 불변).
  - sort(() => Math.random()-0.5)는 위치별 확률이 치우쳐 불공정하므로 쓰지 않는다.
*/
export function fisherYatesShuffle(array) {
  const result = [...array]

  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

/*
  pickRandom — 후보에서 제외 목록을 뺀 뒤 섞어서 count개를 뽑는다.
    입력: array(각 원소 id 보유), count, excludeIds(직전 항목)
  - 제외 후 남는 게 없으면 전체에서 뽑아 빈 화면을 막는다.
*/
export function pickRandom(array, count, excludeIds = []) {
  const excludeSet = new Set(excludeIds)

  let pool = array.filter((item) => !excludeSet.has(item.id))
  if (pool.length === 0) pool = array

  return fisherYatesShuffle(pool).slice(0, count)
}
