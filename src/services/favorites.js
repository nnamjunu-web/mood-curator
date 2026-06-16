import { getCurrentUser } from './auth'

/*
  favorites.js — 즐겨찾기를 localStorage에 보관하는 함수 모음
  - 로그인 사용자마다 저장 키에 이메일을 붙여 보관함을 분리한다.
  - 비로그인 상태에서는 즐겨찾기를 쓰지 않는다(읽으면 빈 목록, 저장은 무시).
*/

// 현재 로그인 사용자의 저장 키 (비로그인이면 null → 읽기·쓰기 안 함)
function storageKey() {
  const user = getCurrentUser()
  return user ? `moodcurator:favorites:${user.email}` : null
}

// 저장된 즐겨찾기 배열을 읽어온다 (비로그인이거나 없으면 빈 배열)
export function getFavorites() {
  const key = storageKey()
  if (!key) return []

  // 저장값이 깨져 JSON.parse가 실패해도 앱이 멈추지 않게 보호
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// 즐겨찾기 배열을 통째로 저장한다 (비로그인이면 무시)
function saveFavorites(list) {
  const key = storageKey()
  if (!key) return
  localStorage.setItem(key, JSON.stringify(list))
}

// 어떤 항목이 이미 즐겨찾기에 들어 있는지 확인
export function isFavorite(id, list = getFavorites()) {
  return list.some((item) => item.id === id)
}

// 항목이 없으면 추가, 있으면 제거하고 갱신된 배열을 반환
export function toggleFavorite(item) {
  const list = getFavorites()
  let updated

  if (isFavorite(item.id, list)) {
    updated = list.filter((fav) => fav.id !== item.id)
  } else {
    updated = [item, ...list] // 최신 저장이 맨 앞에 오도록
  }

  saveFavorites(updated)
  return updated
}

// id로 특정 항목을 제거하고 갱신된 배열을 반환
export function removeFavorite(id) {
  const updated = getFavorites().filter((fav) => fav.id !== id)
  saveFavorites(updated)
  return updated
}
