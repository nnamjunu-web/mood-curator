/*
  kakaoBooks.js — 카카오 책검색 API로 한글 도서를 받아오는 함수
  - 헤더 인증(Authorization: KakaoAK 키)을 쓴다. 키는 빌드에 노출되는 공개용 REST 키.
*/

import { fetchJson } from './http'
import { randomInt } from '../utils/random'

const API_KEY = import.meta.env.VITE_KAKAO_API_KEY
const BASE_URL = 'https://dapi.kakao.com/v3/search/book'

/*
  fetchBooksByQuery — 검색어로 책을 후보 풀로 받아온다.
    입력: query(한글 검색어), limit(1~50, 기본 40)
    반환: Promise<문서 배열>  각 원소: { title, contents, url, isbn, authors, publisher, thumbnail }
  - 랜덤 page로 매번 다른 결과, 카카오는 헤더로 인증한다.
*/
export async function fetchBooksByQuery(query, limit = 40) {
  if (!API_KEY) {
    throw new Error('카카오 API 키가 없습니다. .env의 VITE_KAKAO_API_KEY를 확인하세요.')
  }

  const page = randomInt(1, 3)

  const url =
    `${BASE_URL}` +
    `?query=${encodeURIComponent(query)}` +
    `&sort=accuracy` +
    `&page=${page}` +
    `&size=${limit}`

  const options = {
    headers: { Authorization: `KakaoAK ${API_KEY}` },
  }

  const data = await fetchJson(url, '도서 추천을 불러오지 못했습니다.', options)
  return data.documents ?? []
}
