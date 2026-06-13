/*
  itunes.js — iTunes(Apple Music) Search API로 음악 데이터를 가져오는 함수
  - 추천/인기 음악은 '한국 스토어(country=KR) 검색'(searchKoreanTracks)으로 받는다.
    이 검색 한 번에 한글 제목(trackName)·아티스트(artistName)·표지(artworkUrl100)·
    30초 미리듣기(previewUrl)·상세 링크(trackViewUrl)가 모두 들어온다.
  - iTunes Search API는 API 키가 필요 없고 브라우저에서 바로 호출할 수 있다.
*/

import { fetchJson } from './http'

const BASE_URL = 'https://itunes.apple.com/search'

/*
  searchKoreanTracks — 한글 키워드로 한국 스토어(country=KR)의 곡을 후보 풀로 받아온다.
    입력: keyword(한글 검색어, 예: '발라드', '신나는 가요'), limit(받을 곡 수, 기본 40)
    반환: Promise<곡 배열> — 각 원소: { trackId, trackName, artistName, artworkUrl100, previewUrl, trackViewUrl, ... }

  - country=KR 로 한국 스토어를 검색해 한국 음악이 나오게 한다.
  - iTunes 검색은 page 파라미터가 없어, limit을 넉넉히 받아 호출 쪽(pickRandom)에서 섞어 뽑는다.
  - 실패는 호출 쪽(Promise.allSettled)이 처리하도록 그대로 던진다(throw).
*/
export async function searchKoreanTracks(keyword, limit = 40) {
  // 검색어가 없으면 조회하지 않고 빈 배열을 돌려준다
  if (!keyword) return []

  // encodeURIComponent: 한글/공백이 URL에서 깨지지 않게 변환
  const term = encodeURIComponent(keyword)
  const url = `${BASE_URL}?term=${term}&entity=song&country=KR&limit=${limit}`

  const data = await fetchJson(url, '음악 추천을 불러오지 못했습니다.')

  // 검색 결과는 data.results 배열. 비어 있을 때를 대비해 ?? [] 로 보호.
  return data.results ?? []
}

/*
  fetchTrackMedia — "아티스트 + 곡명"으로 앨범 표지와 30초 미리듣기 URL을 함께 찾는다.
    입력: artist(아티스트명), track(곡명)
    반환: Promise<{ artwork: string|null, previewUrl: string|null }>
          - artwork: 고해상도 표지 URL (없으면 null)
          - previewUrl: 30초 미리듣기 오디오(.m4a) URL (없으면 null)

  - artworkUrl100(100x100)을 받아 '512x512'로 바꿔 더 큰 이미지를 쓴다.
  - 실패해도 추천 흐름이 멈추면 안 되므로, 오류는 삼키고 둘 다 null을 돌려준다.

  ⚠️ [현재 미사용] 음악 소스를 'searchKoreanTracks(한국 스토어 검색)'으로 바꾸면서 표지·미리듣기가
     이미 한 번에 들어와 보강이 필요 없어졌다. Last.fm처럼 "곡으로 보조 조회"하는 패턴 예시로 남겨둔다.
*/
export async function fetchTrackMedia(artist, track) {
  // 검색어가 없으면 조회하지 않는다
  if (!artist && !track) return { artwork: null, previewUrl: null }

  // encodeURIComponent: 공백/특수문자가 있어도 URL이 깨지지 않게 변환
  const term = encodeURIComponent(`${artist} ${track}`.trim())
  const url = `${BASE_URL}?term=${term}&entity=song&limit=1&country=KR`

  try {
    const data = await fetchJson(url, 'iTunes 미디어를 불러오지 못했습니다.')
    // results[0]가 없으면(검색 결과 없음) 둘 다 없음 처리
    const first = data.results?.[0]
    if (!first) return { artwork: null, previewUrl: null }

    // 100x100bb → 512x512bb 로 치환해 고해상도 표지를 얻는다(표지가 있을 때만)
    const artwork = first.artworkUrl100
      ? first.artworkUrl100.replace('100x100bb', '512x512bb')
      : null
    // 미리듣기 URL(없을 수도 있음)
    const previewUrl = first.previewUrl ?? null

    return { artwork, previewUrl }
  } catch {
    // 네트워크/CORS 등 오류는 무시하고 둘 다 없음으로 처리 (표지는 그라데이션 폴백)
    return { artwork: null, previewUrl: null }
  }
}
