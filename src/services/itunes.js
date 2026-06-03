/*
  itunes.js — iTunes Search API로 앨범 표지(아트워크)를 가져오는 함수
  - Last.fm 트랙 이미지는 대부분 빈 placeholder라, 음악 표지는 여기서 따로 가져온다.
  - iTunes Search API는 API 키가 필요 없고 브라우저에서 바로 호출할 수 있다.
*/

import { fetchJson } from './http'

const BASE_URL = 'https://itunes.apple.com/search'

/*
  fetchAlbumArt — "아티스트 + 곡명"으로 앨범 표지 URL을 찾는다.
    입력: artist(아티스트명), track(곡명)
    반환: Promise<string|null> — 고해상도 표지 URL, 못 찾거나 오류면 null

  - artworkUrl100(100x100)을 받아 '512x512'로 바꿔 더 큰 이미지를 쓴다.
  - 실패해도 추천 흐름이 멈추면 안 되므로, 오류는 삼키고 null을 돌려준다.
*/
export async function fetchAlbumArt(artist, track) {
  // 검색어가 없으면 조회하지 않는다
  if (!artist && !track) return null

  // encodeURIComponent: 공백/특수문자가 있어도 URL이 깨지지 않게 변환
  const term = encodeURIComponent(`${artist} ${track}`.trim())
  const url = `${BASE_URL}?term=${term}&entity=song&limit=1&country=KR`

  try {
    const data = await fetchJson(url, 'iTunes 표지를 불러오지 못했습니다.')
    // results[0]가 없으면(검색 결과 없음) 표지 없음 처리
    const artwork = data.results?.[0]?.artworkUrl100
    if (!artwork) return null
    // 100x100bb → 512x512bb 로 치환해 고해상도 표지를 얻는다
    return artwork.replace('100x100bb', '512x512bb')
  } catch {
    // 네트워크/CORS 등 오류는 무시하고 표지 없음으로 처리 (그라데이션 폴백)
    return null
  }
}
