/*
  tmdb.js — TMDB(The Movie Database)에서 장르로 영화를 추천받는 API 함수
  - 비동기 개념(Promise/async/await/fetch)이 궁금하면 ./http.js 상단 설명 참고.
*/

import { fetchJson } from './http'
import { randomInt } from '../utils/random'

// import.meta.env: Vite가 .env 파일의 값을 코드에서 읽게 해주는 통로.
//                  VITE_ 로 시작하는 변수만 브라우저에 노출된다.
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

/*
  fetchMoviesByGenre — 특정 장르의 영화를 "후보 풀(약 20개)"로 넓게 받아온다.
    입력: genreId(TMDB 장르 번호, 예: 35=코미디), 그리고 선택적으로 언어
    반환: Promise<영화 배열> — 각 원소는 { id, title, overview, poster_path, ... }

  - 랜덤 page(1~10)로 매번 다른 묶음을 받아 추천이 고정되지 않게 한다.
  - vote_count.gte=100 으로 평점 수가 너무 적은(품질 낮은) 영화는 거른다.
  - 상위 몇 개로 자르지 않고 한 페이지(약 20개)를 통째로 돌려준다 → 호출 쪽에서 섞어 뽑음.
*/
export async function fetchMoviesByGenre(genreId, language = 'ko-KR') {
  // 흐름 분기: 키가 없으면 요청을 보내기 전에 친절한 에러로 막는다
  if (!API_KEY) {
    throw new Error('TMDB API 키가 없습니다. .env의 VITE_TMDB_API_KEY를 확인하세요.')
  }

  const page = randomInt(1, 10) // 후보 풀을 넓히기 위한 랜덤 페이지

  // 요청 URL 만들기 (키·장르·언어·정렬·품질 하한·랜덤 페이지)
  const url =
    `${BASE_URL}/discover/movie` +
    `?api_key=${API_KEY}` +
    `&with_genres=${genreId}` +
    `&language=${language}` +
    `&sort_by=popularity.desc` +
    `&vote_count.gte=100` +
    `&page=${page}`

  // 공통 도우미로 요청 + JSON 파싱 (await로 결과를 기다림)
  const data = await fetchJson(url, '영화 추천을 불러오지 못했습니다.')

  // TMDB는 결과 목록을 data.results 안에 담아준다 → 그 배열만 돌려준다
  return data.results
}

/*
  fetchPopularMovies — 지금 인기 있는 영화 목록을 받아온다 (인기 차트용).
    입력: language(언어, 기본 한국어)
    반환: Promise<영화 배열>
*/
export async function fetchPopularMovies(language = 'ko-KR') {
  if (!API_KEY) {
    throw new Error('TMDB API 키가 없습니다. .env의 VITE_TMDB_API_KEY를 확인하세요.')
  }

  // /movie/popular: 인기순 영화를 돌려주는 TMDB 엔드포인트
  const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${language}`

  const data = await fetchJson(url, '인기 영화를 불러오지 못했습니다.')
  return data.results
}
