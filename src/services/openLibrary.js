/*
  openLibrary.js — Open Library에서 주제(subject)로 책을 받아오는 API 함수
  - Google Books의 키 없는 호출은 전 세계가 공유하는 익명 할당량을 써서 자주 429(초과)가 난다.
    Open Library는 키가 필요 없고 할당량도 넉넉해 더 안정적이다. 표지 이미지도 제공한다.

  ⚠️ [현재 미사용] 추천·인기 도서는 한글 제목/표지가 정확한 '카카오 책검색'(services/kakaoBooks.js)으로
     옮겨갔다. 이 파일은 어디서도 import하지 않지만, 키 없는 REST 호출 예시로 학습 참고용으로 남겨둔다.
*/

import { fetchJson } from './http'
import { randomInt } from '../utils/random'

const BASE_URL = 'https://openlibrary.org/search.json'

/*
  fetchBooksBySubject — 특정 주제의 책을 "후보 풀(최대 40권)"로 넓게 받아온다.
    입력: subject(주제 문자열, 예: 'Poetry', 'fiction'), limit(받을 권 수, 기본 40)
    반환: Promise<책 배열> — 각 원소는 { key, title, author_name, cover_i }

  - 랜덤 offset(시작 위치)으로 매번 다른 묶음을 받아 추천이 고정되지 않게 한다.
  - fields= 로 필요한 항목만 받아 응답을 가볍게 한다.
*/
export async function fetchBooksBySubject(subject, limit = 40) {
  const offset = randomInt(0, 40) // 후보 풀을 넓히기 위한 랜덤 시작 위치

const url =
  `${BASE_URL}` +
  `?subject=${encodeURIComponent(subject)}` +
  `&language=kor` +          // ← 한국어 판이 있는 책만
  `&limit=${limit}` +
  `&offset=${offset}` +
  `&fields=key,title,author_name,cover_i`


  const data = await fetchJson(url, '도서 추천을 불러오지 못했습니다.')

  // 검색 결과는 data.docs 안의 배열. 없으면 ?? [] 로 빈 배열.
  return data.docs ?? []
}
