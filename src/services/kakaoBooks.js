/*
  kakaoBooks.js — 카카오 책검색 API로 한글 도서를 받아오는 함수
  - 이전에 쓰던 Open Library는 한국어 판이 있어도 카드 제목이 원서(영어)로 나오는 한계가 있었다.
    카카오 책검색은 한글 제목·저자·표지(thumbnail)를 그대로 주므로 추천 도서에 더 적합하다.
  - 비동기 개념(Promise/async/await/fetch)이 궁금하면 ./http.js 상단 설명 참고.
*/

import { fetchJson } from './http'
import { randomInt } from '../utils/random'

// import.meta.env: Vite가 .env 값을 코드에서 읽게 해주는 통로(VITE_ 로 시작하는 것만 노출).
// 주의: 이 키는 빌드 결과물에 그대로 노출되는 "공개용 REST 키"다(서버 비밀키가 아님).
const API_KEY = import.meta.env.VITE_KAKAO_API_KEY
const BASE_URL = 'https://dapi.kakao.com/v3/search/book'

/*
  fetchBooksByQuery — 검색어로 책을 "후보 풀"로 넓게 받아온다.
    입력: query(한글 검색어, 예: '에세이', '유머'), limit(받을 권 수, 1~50, 기본 40)
    반환: Promise<문서 배열> — 각 원소(document): { title, contents, url, isbn, authors, publisher, thumbnail, ... }

  - "매번 다른 추천"을 위해 page를 랜덤(1~3)으로 준다.
  - 카카오는 인증을 헤더로 받으므로 fetchJson에 Authorization 헤더를 넘긴다.
*/
export async function fetchBooksByQuery(query, limit = 40) {
  // 흐름 분기: 키가 없으면 요청 전에 친절한 에러로 막는다(다른 카테고리는 계속 동작)
  if (!API_KEY) {
    throw new Error('카카오 API 키가 없습니다. .env의 VITE_KAKAO_API_KEY를 확인하세요.')
  }

  const page = randomInt(1, 3) // 후보 풀을 넓히고 매번 다른 결과가 나오게 하는 랜덤 페이지

  // 요청 URL (검색어·정확도순·페이지·개수). encodeURIComponent: 공백/한글이 깨지지 않게 변환
  const url =
    `${BASE_URL}` +
    `?query=${encodeURIComponent(query)}` +
    `&sort=accuracy` +
    `&page=${page}` +
    `&size=${limit}`

  // 카카오 인증 헤더 — "KakaoAK " 뒤에 REST 키를 붙이는 형식
  const options = {
    headers: { Authorization: `KakaoAK ${API_KEY}` },
  }

  // 공통 도우미로 요청 + JSON 파싱 (세 번째 인자로 헤더 옵션 전달)
  const data = await fetchJson(url, '도서 추천을 불러오지 못했습니다.', options)

  // 검색 결과는 data.documents 배열. 결과가 부족하거나 마지막 페이지면 비어 있을 수 있어 ?? [] 로 보호.
  return data.documents ?? []
}
