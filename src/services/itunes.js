/*
  itunes.js — iTunes Search API로 한국 스토어(country=KR) 음악을 가져온다.
  - 검색 한 번에 제목·아티스트·표지·30초 미리듣기·상세 링크가 모두 들어온다. API 키 불필요.
*/

import { fetchJson } from './http'

const BASE_URL = 'https://itunes.apple.com/search'

/*
  searchKoreanTracks — 한글 키워드로 한국 스토어의 곡을 후보 풀로 받아온다.
    입력: keyword(한글 검색어), limit(기본 40)
    반환: Promise<곡 배열>  각 원소: { trackId, trackName, artistName, artworkUrl100, previewUrl, trackViewUrl }
  - page 파라미터가 없어 limit을 넉넉히 받아 호출 쪽에서 섞어 뽑는다.
*/
export async function searchKoreanTracks(keyword, limit = 40) {
  if (!keyword) return []

  const term = encodeURIComponent(keyword)
  const url = `${BASE_URL}?term=${term}&entity=song&country=KR&limit=${limit}`

  const data = await fetchJson(url, '음악 추천을 불러오지 못했습니다.')
  return data.results ?? []
}
