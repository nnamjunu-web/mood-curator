/*
  recents.js — 직전에 보여준 추천 항목 ID를 localStorage에 기억하는 저장소
  - 같은 감정으로 다시 추천받을 때 같은 항목이 또 나오지 않도록 다음 추천에서 제외한다.
*/

// 카테고리 → localStorage 키
const KEY = {
  movie: 'recent_movie',
  music: 'recent_music',
  book: 'recent_book',
}

// 해당 카테고리에서 직전에 보여준 ID 목록을 읽는다 (없으면 빈 배열)
export function getRecentIds(category) {
  try {
    const raw = localStorage.getItem(KEY[category])
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// 이번에 보여준 ID 목록을 저장한다 (저장 실패는 무시)
export function setRecentIds(category, ids) {
  try {
    localStorage.setItem(KEY[category], JSON.stringify(ids))
  } catch {
    // 용량 초과 등은 추천 흐름에 치명적이지 않으므로 무시
  }
}
