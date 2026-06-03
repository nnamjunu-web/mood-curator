/*
  lastfm.js — Last.fm에서 태그(분위기/장르)로 인기 음악을 받아오는 API 함수
*/

import { fetchJson } from './http'
import { randomInt } from '../utils/random'

const API_KEY = import.meta.env.VITE_LASTFM_API_KEY
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/'

/*
  fetchTracksByTag — 특정 태그가 붙은 인기 트랙을 "후보 풀(약 40개)"로 넓게 받아온다.
    입력: tag(태그 문자열, 예: 'chill', 'happy'), limit(받을 곡 수, 기본 40)
    반환: Promise<트랙 배열> — 각 원소는 { name, artist, url, ... }

  - 랜덤 page를 줘서 매번 다른 묶음을 받아 추천이 고정되지 않게 한다.
*/
export async function fetchTracksByTag(tag, limit = 40) {
  // 흐름 분기: 키 누락 시 미리 막기
  if (!API_KEY) {
    throw new Error('Last.fm API 키가 없습니다. .env의 VITE_LASTFM_API_KEY를 확인하세요.')
  }

  const page = randomInt(1, 10) // 후보 풀을 넓히기 위한 랜덤 페이지

  // Last.fm은 method 파라미터로 무엇을 할지 정한다(tag.gettoptracks).
  // format=json 을 줘야 JSON으로 응답한다(기본은 XML).
  // encodeURIComponent: 태그에 공백/특수문자가 있어도 URL에서 깨지지 않게 변환
  //   입력: 문자열, 반환: URL에 안전한 문자열
  const url =
    `${BASE_URL}?method=tag.gettoptracks` +
    `&tag=${encodeURIComponent(tag)}` +
    `&api_key=${API_KEY}` +
    `&limit=${limit}` +
    `&page=${page}` +
    `&format=json`

  const data = await fetchJson(url, '음악 추천을 불러오지 못했습니다.')

  // 응답 구조: data.tracks.track 안에 곡 배열이 들어 있다.
  // 혹시 비어 있을 때를 대비해 ?? [] 로 빈 배열을 기본값으로 준다.
  return data.tracks?.track ?? []
}

/*
  fetchTopTracks — 전 세계에서 지금 인기 있는 트랙 목록을 받아온다 (인기 차트용).
    입력: limit(받을 곡 수)
    반환: Promise<트랙 배열>
*/
export async function fetchTopTracks(limit = 20) {
  if (!API_KEY) {
    throw new Error('Last.fm API 키가 없습니다. .env의 VITE_LASTFM_API_KEY를 확인하세요.')
  }

  // chart.gettoptracks: 전체 인기 차트를 돌려주는 Last.fm 메서드
  const url =
    `${BASE_URL}?method=chart.gettoptracks` +
    `&api_key=${API_KEY}` +
    `&limit=${limit}` +
    `&format=json`

  const data = await fetchJson(url, '인기 음악을 불러오지 못했습니다.')

  // 이쪽 응답은 data.tracks.track 배열
  return data.tracks?.track ?? []
}
