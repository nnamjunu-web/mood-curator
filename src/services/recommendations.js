/*
  recommendations.js — 감정 하나로 영화·음악·도서 추천을 한 번에 가져오는 함수
  - 이 로직을 한곳에 모아, 결과 페이지(ResultPage)와 홈 인라인 추천(HomePage)이
    똑같이 재사용하게 한다. (중복 제거)
*/

import { getRecommendationKeys } from '../utils/emotionMapper'
import { normalizeMovies, normalizeTracks, normalizeBooks } from '../utils/cardAdapter'
import { pickRandom } from '../utils/random'
import { fetchMoviesByGenre } from './tmdb'
import { fetchTracksByTag } from './lastfm'
import { fetchBooksBySubject } from './openLibrary'
import { fetchAlbumArt } from './itunes'
import { getRecentIds, setRecentIds } from './recents'

/*
  fillMusicArtwork — 음악 카드들에 iTunes 앨범 표지를 채워 넣는다.
    입력: tracks (정규화된 음악 카드 배열)
    반환: Promise<음악 카드 배열> — image가 채워진(또는 그대로인) 새 배열
  - Last.fm 표지가 비어 있을 때만(iTunes로) 보강하고, 이미 있으면 그대로 둔다.
  - Promise.all: 여러 곡의 표지를 "동시에" 조회해 빠르게 끝낸다.
*/
export async function fillMusicArtwork(tracks) {
  return Promise.all(
    tracks.map(async (track) => {
      // 이미 표지가 있으면 추가 조회 없이 그대로 사용
      if (track.image) return track
      // 아티스트(subtitle) + 곡명(title)으로 iTunes 표지 조회
      const artwork = await fetchAlbumArt(track.subtitle, track.title)
      // 찾았으면 image를 채운 새 객체로, 못 찾았으면 원본 그대로(그라데이션 폴백)
      return artwork ? { ...track, image: artwork } : track
    })
  )
}

/*
  getRecommendations — 감정 코드를 받아 세 종류의 추천을 동시에 가져온다.
    입력: mood(감정 코드, 예: 'happy'), limit(카테고리별 최대 개수)
    반환: Promise<{
            movies: [], music: [], books: [],          // 성공한 카테고리의 카드 배열
            errors: { movies, music, books }            // 실패한 카테고리만 메시지(null=성공)
          }>
  - Promise.allSettled: 셋 중 일부가 실패해도 나머지는 살린다(부분 실패 허용).
*/
export async function getRecommendations(mood, limit = 8) {
  // 1) 감정 → 검색 기준(장르ID/태그/주제)
  const keys = getRecommendationKeys(mood)

  // 2) 세 API를 동시에 호출 (allSettled는 절대 reject되지 않음)
  const [movieResult, musicResult, bookResult] = await Promise.allSettled([
    fetchMoviesByGenre(keys.movieGenreId),
    fetchTracksByTag(keys.musicTag),
    fetchBooksBySubject(keys.bookSubject),
  ])

  // 3) 성공(fulfilled)한 것만 공통 카드 형태로 변환 → 넓은 후보 풀을 만든다(자르지 않음)
  const moviePool = movieResult.status === 'fulfilled' ? normalizeMovies(movieResult.value) : []
  const musicPool = musicResult.status === 'fulfilled' ? normalizeTracks(musicResult.value) : []
  const bookPool = bookResult.status === 'fulfilled' ? normalizeBooks(bookResult.value) : []

  // 4) 후보 풀에서 "직전에 보여준 항목을 빼고, 섞어서" limit개만 뽑는다
  //    → 감정에는 항상 맞지만(매핑 유지) 매번 다른 추천이 나온다
  const movies = pickRandom(moviePool, limit, getRecentIds('movie'))
  let music = pickRandom(musicPool, limit, getRecentIds('music'))
  const books = pickRandom(bookPool, limit, getRecentIds('book'))

  // 5) 이번에 보여준 ID를 저장해 다음 추천에서 제외(같은 게 또 안 나오게).
  //    실패해서 비어 있는 카테고리는 기존 기록을 지우지 않도록 건너뛴다.
  if (movies.length > 0) setRecentIds('movie', movies.map((m) => m.id))
  if (music.length > 0) setRecentIds('music', music.map((m) => m.id))
  if (books.length > 0) setRecentIds('book', books.map((b) => b.id))

  // 6) 음악은 표지가 비는 경우가 많아 iTunes 표지로 보강한다(뽑힌 곡만 조회)
  if (music.length > 0) {
    music = await fillMusicArtwork(music)
  }

  // 4) 실패한 카테고리에만 안내 문구 (성공이면 null)
  const errors = {
    movies: movieResult.status === 'rejected' ? '영화 추천을 불러오지 못했어요.' : null,
    music: musicResult.status === 'rejected' ? '음악 추천을 불러오지 못했어요.' : null,
    books: bookResult.status === 'rejected' ? '도서 추천을 불러오지 못했어요.' : null,
  }

  return { movies, music, books, errors }
}

/*
  isAllFailed — 세 카테고리가 모두 실패했는지 확인하는 도우미.
    입력: errors 객체
    반환: true/false
*/
export function isAllFailed(errors) {
  return Boolean(errors.movies && errors.music && errors.books)
}
