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
  pickTrailerKey — TMDB 영상 목록에서 보여줄 유튜브 예고편 1개의 key를 고른다(내부 전용).
    입력: results (TMDB /videos 응답의 results 배열, 각 원소: { key, site, type, official, ... })
    반환: 유튜브 영상 key 문자열 또는 null
  - 우선순위: 'YouTube'이면서 'Trailer'인 공식(official) 영상 → 아무 Trailer → 아무 YouTube 영상.
*/
function pickTrailerKey(results) {
  // 유튜브에 올라간 영상만 추린다(다른 사이트는 iframe 임베드 방식이 달라 제외)
  const youtube = results.filter((video) => video.site === 'YouTube')
  if (youtube.length === 0) return null

  // 그중 '예고편(Trailer)' 종류만 따로 모은다
  const trailers = youtube.filter((video) => video.type === 'Trailer')

  // 공식 예고편 우선 → 없으면 첫 예고편 → 그래도 없으면 첫 유튜브 영상
  // find: 조건을 만족하는 첫 원소(없으면 undefined) / ??: 앞이 비면 뒷값 사용
  const chosen = trailers.find((video) => video.official) ?? trailers[0] ?? youtube[0]
  return chosen ? chosen.key : null
}

/*
  fetchMovieTrailer — 영화 하나의 유튜브 예고편 key를 가져온다(예고편 보기 클릭 시 호출).
    입력: movieId(TMDB 영화 숫자 id)
    반환: Promise<string|null> — 유튜브 영상 key(예: 'abc123') 또는 null(예고편 없음)

  - TMDB /movie/{id}/videos 엔드포인트는 그 영화의 예고편·클립 영상 목록을 돌려준다.
  - 한국어(ko-KR)는 영상이 비는 경우가 많아, 비면 영어(en-US)로 한 번 더 시도한다.
  - 호출 쪽에서 `https://www.youtube.com/embed/{key}` 형태로 iframe에 끼워 재생한다.
*/
export async function fetchMovieTrailer(movieId) {
  // 흐름 분기: 키가 없으면 친절한 에러로 막는다
  if (!API_KEY) {
    throw new Error('TMDB API 키가 없습니다. .env의 VITE_TMDB_API_KEY를 확인하세요.')
  }

  // 특정 언어로 영상 목록을 받아오는 작은 도우미 (같은 호출을 언어만 바꿔 두 번 쓰므로 분리)
  async function queryVideos(language) {
    const url = `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=${language}`
    const data = await fetchJson(url, '예고편을 불러오지 못했습니다.')
    return data.results ?? []
  }

  // 1) 한국어로 먼저 시도
  let key = pickTrailerKey(await queryVideos('ko-KR'))
  // 2) 비었으면 영어로 재시도
  if (!key) {
    key = pickTrailerKey(await queryVideos('en-US'))
  }
  return key
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
