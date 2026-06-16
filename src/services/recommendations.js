/*
  recommendations.js — 감정 하나로 영화·음악·도서 추천을 한 번에 가져온다.
  - ResultPage와 HomePage가 똑같이 재사용한다.
*/

import { getRecommendationKeys } from '../utils/emotionMapper'
import { normalizeMovies, normalizeItunesTracks, normalizeKakaoBooks } from '../utils/cardAdapter'
import { pickRandom } from '../utils/random'
import { fetchMoviesByGenre } from './tmdb'
import { searchKoreanTracks } from './itunes'
import { fetchBooksByQuery } from './kakaoBooks'
import { getRecentIds, setRecentIds } from './recents'

/*
  getRecommendations — 감정 코드로 세 종류 추천을 가져온다.
    입력: mood(감정 코드), limit(카테고리별 최대 개수)
    반환: Promise<{ movies, music, books, errors }>
*/
export async function getRecommendations(mood, limit = 8) {
  // 감정 → 검색 기준(장르ID / 한글 검색어)
  const keys = getRecommendationKeys(mood)

  // 세 API를 동시에 호출 (allSettled로 일부 실패해도 나머지는 살림)
  const [movieResult, musicResult, bookResult] = await Promise.allSettled([
    fetchMoviesByGenre(keys.movieGenreId),
    searchKoreanTracks(keys.musicTag),
    fetchBooksByQuery(keys.bookSubject),
  ])

  // 성공한 것만 공통 카드로 변환해 넓은 후보 풀을 만든다
  const moviePool = movieResult.status === 'fulfilled' ? normalizeMovies(movieResult.value) : []
  const musicPool = musicResult.status === 'fulfilled' ? normalizeItunesTracks(musicResult.value) : []
  const bookPool = bookResult.status === 'fulfilled' ? normalizeKakaoBooks(bookResult.value) : []

  // 직전에 보여준 항목을 빼고 섞어서 limit개만 뽑는다 (매번 다른 추천)
  const movies = pickRandom(moviePool, limit, getRecentIds('movie'))
  const music = pickRandom(musicPool, limit, getRecentIds('music'))
  const books = pickRandom(bookPool, limit, getRecentIds('book'))

  // 이번에 보여준 ID를 저장 (실패해 비어 있으면 기록을 지우지 않음)
  if (movies.length > 0) setRecentIds('movie', movies.map((m) => m.id))
  if (music.length > 0) setRecentIds('music', music.map((m) => m.id))
  if (books.length > 0) setRecentIds('book', books.map((b) => b.id))

  // 실패한 카테고리에만 안내 문구
  const errors = {
    movies: movieResult.status === 'rejected' ? '영화 추천을 불러오지 못했어요.' : null,
    music: musicResult.status === 'rejected' ? '음악 추천을 불러오지 못했어요.' : null,
    books: bookResult.status === 'rejected' ? '도서 추천을 불러오지 못했어요.' : null,
  }

  return { movies, music, books, errors }
}

// 세 카테고리가 모두 실패했는지 확인
export function isAllFailed(errors) {
  return Boolean(errors.movies && errors.music && errors.books)
}
