/*
  tmdb.js — TMDB API로 영화 목록과 예고편을 가져오는 함수 모음
*/

import { fetchJson } from './http'
import { randomInt } from '../utils/random'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

/*
  fetchMoviesByGenre — 특정 장르의 영화를 후보 풀(약 20개)로 받아온다.
    입력: genreId(TMDB 장르 번호), language
    반환: Promise<영화 배열>
  - 랜덤 page로 매번 다른 묶음, vote_count.gte=100으로 품질 낮은 영화 제외.
*/
export async function fetchMoviesByGenre(genreId, language = 'ko-KR') {
  if (!API_KEY) {
    throw new Error('TMDB API 키가 없습니다. .env의 VITE_TMDB_API_KEY를 확인하세요.')
  }

  const page = randomInt(1, 10)

  const url =
    `${BASE_URL}/discover/movie` +
    `?api_key=${API_KEY}` +
    `&with_genres=${genreId}` +
    `&language=${language}` +
    `&sort_by=popularity.desc` +
    `&vote_count.gte=100` +
    `&page=${page}`

  const data = await fetchJson(url, '영화 추천을 불러오지 못했습니다.')
  return data.results
}

// 영상 목록에서 보여줄 유튜브 예고편 1개의 key를 고른다 (공식 Trailer 우선)
function pickTrailerKey(results) {
  const youtube = results.filter((video) => video.site === 'YouTube')
  if (youtube.length === 0) return null

  const trailers = youtube.filter((video) => video.type === 'Trailer')
  const chosen = trailers.find((video) => video.official) ?? trailers[0] ?? youtube[0]
  return chosen ? chosen.key : null
}

/*
  fetchMovieTrailer — 영화 하나의 유튜브 예고편 key를 가져온다.
    입력: movieId(TMDB 숫자 id) / 반환: Promise<string|null>
  - ko-KR 영상이 비면 en-US로 한 번 더 시도한다.
*/
export async function fetchMovieTrailer(movieId) {
  if (!API_KEY) {
    throw new Error('TMDB API 키가 없습니다. .env의 VITE_TMDB_API_KEY를 확인하세요.')
  }

  async function queryVideos(language) {
    const url = `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=${language}`
    const data = await fetchJson(url, '예고편을 불러오지 못했습니다.')
    return data.results ?? []
  }

  let key = pickTrailerKey(await queryVideos('ko-KR'))
  if (!key) {
    key = pickTrailerKey(await queryVideos('en-US'))
  }
  return key
}

// 지금 인기 있는 영화 목록을 받아온다 (인기 차트용)
export async function fetchPopularMovies(language = 'ko-KR') {
  if (!API_KEY) {
    throw new Error('TMDB API 키가 없습니다. .env의 VITE_TMDB_API_KEY를 확인하세요.')
  }

  const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${language}`
  const data = await fetchJson(url, '인기 영화를 불러오지 못했습니다.')
  return data.results
}
