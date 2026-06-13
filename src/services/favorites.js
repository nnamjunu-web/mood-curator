import { getCurrentUser } from './auth'

/*
  favorites.js — '즐겨찾기'를 브라우저 저장소(localStorage)에 보관하는 함수 모음
  - 서버 DB가 없으므로, 사용자가 마음에 든 항목을 브라우저에 직접 저장한다.
  - 로그인한 사용자마다 보관함을 따로 쓰도록, 저장 열쇠에 이메일을 붙인다
    (예: moodcurator:favorites:hong@x.com). 비로그인 상태면 'guest' 보관함을 쓴다.
    → 이렇게 하면 계정을 바꿔 로그인했을 때 각자의 보관함이 보인다.

  ───────────────────────────────────────────────────────────────
  ● localStorage 란?
    - 브라우저가 제공하는 "작은 영구 저장소". key-value(열쇠-값) 형태로 저장한다.
    - 특징
      1) 새로고침하거나 브라우저를 껐다 켜도 데이터가 남아 있다.
         (반면 useState 값은 새로고침하면 사라진다)
      2) 문자열만 저장할 수 있다 → 객체/배열은 JSON 문자열로 바꿔 저장해야 한다.
         · JSON.stringify(값): 자바스크립트 값 → JSON 문자열 로 변환(저장할 때)
         · JSON.parse(문자열): JSON 문자열 → 자바스크립트 값 으로 변환(읽을 때)
      3) 같은 브라우저·같은 사이트(origin) 안에서만 공유된다.
    - 주요 메서드
      · localStorage.getItem(key)    : 값 읽기(없으면 null)
      · localStorage.setItem(key, v) : 값 저장(덮어쓰기)
      · localStorage.removeItem(key) : 값 삭제
  ───────────────────────────────────────────────────────────────
*/

/*
  storageKey — 지금 로그인한 사용자에 맞는 저장 열쇠(key)를 만들어 돌려준다.
    입력: 없음
    반환: 문자열 — 로그인 시 'moodcurator:favorites:<이메일>', 비로그인 시 'moodcurator:favorites:guest'
    ※ 고정 상수가 아니라 함수로 둔 이유: 호출 시점의 로그인 사용자에 따라 키가 달라져야 하기 때문.
*/
function storageKey() {
  const user = getCurrentUser() // { email, nickname } 또는 null
  return user ? `moodcurator:favorites:${user.email}` : 'moodcurator:favorites:guest'
}

/*
  getFavorites — 저장된 즐겨찾기 목록(배열)을 읽어온다.
    입력: 없음
    반환: 즐겨찾기 배열 (저장된 게 없으면 빈 배열 [])
*/
export function getFavorites() {
  // try/catch: 저장값이 깨져서 JSON.parse가 실패해도 앱이 멈추지 않게 보호
  try {
    const raw = localStorage.getItem(storageKey()) // 문자열 또는 null
    return raw ? JSON.parse(raw) : []              // 문자열을 배열로 복원
  } catch {
    return []
  }
}

/*
  saveFavorites — 즐겨찾기 배열을 통째로 저장한다(내부 전용).
    입력: list(즐겨찾기 배열)
    반환: 없음
*/
function saveFavorites(list) {
  // 배열을 JSON 문자열로 바꿔서 저장 (localStorage는 문자열만 가능)
  localStorage.setItem(storageKey(), JSON.stringify(list))
}

/*
  isFavorite — 어떤 항목이 이미 즐겨찾기에 들어 있는지 확인한다.
    입력: id(항목 고유 id), list(검사할 목록 — 기본은 저장된 목록)
    반환: true/false
*/
export function isFavorite(id, list = getFavorites()) {
  // some: 배열에 조건을 만족하는 원소가 하나라도 있으면 true
  return list.some((item) => item.id === id)
}

/*
  toggleFavorite — 항목이 없으면 추가, 있으면 제거(=즐겨찾기 켜고 끄기).
    입력: item(공통 카드 형태의 항목 객체, 반드시 id를 가짐)
    반환: 갱신된 즐겨찾기 배열 (호출한 화면이 state를 업데이트하기 쉽도록)
*/
export function toggleFavorite(item) {
  const list = getFavorites()
  let updated

  // 흐름 분기: 이미 있으면 빼고, 없으면 맨 앞에 추가
  if (isFavorite(item.id, list)) {
    // filter: 조건(=다른 id)을 만족하는 것만 남겨 해당 항목을 제거
    updated = list.filter((fav) => fav.id !== item.id)
  } else {
    updated = [item, ...list] // 최신 저장이 맨 앞에 오도록
  }

  saveFavorites(updated)
  return updated
}

/*
  removeFavorite — id로 특정 항목을 즐겨찾기에서 제거한다.
    입력: id(항목 고유 id)
    반환: 갱신된 즐겨찾기 배열
*/
export function removeFavorite(id) {
  const updated = getFavorites().filter((fav) => fav.id !== id)
  saveFavorites(updated)
  return updated
}
