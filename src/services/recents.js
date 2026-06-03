/*
  recents.js — "직전에 보여준 추천 항목 ID"를 localStorage에 기억하는 저장소
  - 같은 감정으로 다시 추천받을 때(예: '다시 분석하기') 똑같은 항목이 또 나오지 않도록,
    방금 보여준 ID들을 저장해 두었다가 다음 추천에서 제외(excludeIds)로 넘긴다.
*/

// 카테고리(영문) → localStorage 키 이름
const KEY = {
  movie: 'recent_movie',
  music: 'recent_music',
  book: 'recent_book',
}

/*
  getRecentIds — 해당 카테고리에서 직전에 보여준 ID 목록을 읽는다.
    입력: category('movie' | 'music' | 'book')
    반환: id 문자열 배열 (저장된 게 없으면 빈 배열)
*/
export function getRecentIds(category) {
  try {
    const raw = localStorage.getItem(KEY[category])
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/*
  setRecentIds — 이번에 보여준 ID 목록을 저장한다(덮어쓰기).
    입력: category('movie' | 'music' | 'book'), ids(id 문자열 배열)
    반환: 없음
*/
export function setRecentIds(category, ids) {
  try {
    localStorage.setItem(KEY[category], JSON.stringify(ids))
  } catch {
    // 저장 실패(용량 초과 등)는 추천 흐름에 치명적이지 않으므로 조용히 무시
  }
}
