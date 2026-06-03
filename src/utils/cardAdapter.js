/*
  cardAdapter.js — 서로 다른 API 응답을 "카드 한 장"이 쓰는 공통 형태로 변환
  - TMDB / Last.fm / Google Books는 각자 응답 구조가 완전히 다르다.
    그대로 쓰면 카드 컴포넌트가 3가지 구조를 모두 알아야 해서 복잡해진다.
  - 그래서 여기서 아래 "공통 카드 형태" 하나로 통일한다:
      {
        id,          // 즐겨찾기 구분용 고유 문자열 (타입 접두어로 충돌 방지)
        type,        // 'movie' | 'music' | 'book'
        title,       // 제목
        subtitle,    // 부제 (연도 / 아티스트 / 저자 등)
        description, // 설명 (없을 수 있음)
        image,       // 표지/포스터 이미지 URL (없으면 null)
        link,        // 자세히 보기 외부 링크 (없으면 null)
      }
*/

// TMDB 포스터 이미지의 기본 주소 (뒤에 poster_path를 붙여 완성)
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

/*
  normalizeMovies — TMDB 영화 배열을 공통 카드 배열로 변환
    입력: movies (TMDB 응답의 results 배열)
    반환: 공통 카드 배열
*/
export function normalizeMovies(movies) {
  // map: 배열의 각 원소를 새 형태로 하나씩 바꿔 새 배열을 만든다
  return movies.map((movie) => ({
    id: `movie-${movie.id}`,
    type: 'movie',
    title: movie.title,
    // release_date가 "2024-05-01" 형태 → 앞 4글자(연도)만 사용
    subtitle: movie.release_date ? movie.release_date.slice(0, 4) : '',
    description: movie.overview,
    // poster_path가 있으면 기본 주소와 합치고, 없으면 null
    image: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
    link: `https://www.themoviedb.org/movie/${movie.id}`,
  }))
}

/*
  normalizeTracks — Last.fm 트랙 배열을 공통 카드 배열로 변환
    입력: tracks (Last.fm 응답의 tracks.track 배열)
    반환: 공통 카드 배열
*/
export function normalizeTracks(tracks) {
  return tracks.map((track) => {
    // 아티스트 이름 위치: track.artist.name (없을 수 있어 ?. 로 안전 접근)
    const artist = track.artist?.name ?? ''
    return {
      // 음악은 숫자 id가 없어서 "아티스트-곡명"으로 고유 id를 만든다(공백은 -로)
      id: `music-${artist}-${track.name}`.replace(/\s+/g, '-'),
      type: 'music',
      title: track.name,
      subtitle: artist,
      description: '',
      image: pickLastfmImage(track.image),
      link: track.url ?? null,
    }
  })
}

// Last.fm이 "이미지 없음"일 때 돌려주는 회색 별 placeholder의 식별자.
// 이 해시가 들어간 URL은 빈 이미지이므로 표지로 쓰지 않는다.
const LASTFM_PLACEHOLDER = '2a96cbd8b46e442fc41c2b86b821562f'

/*
  pickLastfmImage — Last.fm의 이미지 배열에서 가장 큰(마지막) 유효 이미지를 고른다.
    입력: images — [{ '#text': '주소', size: 'small'|... }, ...] 형태 배열
    반환: 이미지 URL 문자열 또는 null
  - 빈 별 placeholder는 걸러서 null을 돌려준다(→ 표지를 다른 데서 보강하거나 폴백).
*/
function pickLastfmImage(images) {
  // 흐름 분기: 배열이 아니면 이미지 없음 처리
  if (!Array.isArray(images)) return null
  // 주소가 있고, placeholder가 아닌 것만 추리기
  const withUrl = images.filter(
    (img) => img['#text'] && !img['#text'].includes(LASTFM_PLACEHOLDER)
  )
  if (withUrl.length === 0) return null
  // Last.fm은 작은→큰 순서라 마지막 것이 가장 큰 이미지
  return withUrl[withUrl.length - 1]['#text']
}

/*
  normalizeBooks — Open Library 검색 결과(docs)를 공통 카드 배열로 변환
    입력: books (Open Library 응답의 docs 배열, 각 원소: { key, title, author_name, cover_i })
    반환: 공통 카드 배열
*/
export function normalizeBooks(books) {
  return books.map((doc) => {
    // cover_i(표지 ID)가 있으면 표지 이미지 URL을 만든다 (M=중간 크기)
    const image = doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : null

    return {
      // doc.key 예: '/works/OL123W' — 그 자체로 고유하다
      id: `book-${doc.key}`,
      type: 'book',
      title: doc.title ?? '제목 없음',
      // author_name은 배열이라 쉼표로 이어 붙인다
      subtitle: doc.author_name ? doc.author_name.join(', ') : '',
      description: '',
      image,
      // 상세 페이지 링크 (openlibrary.org + key)
      link: doc.key ? `https://openlibrary.org${doc.key}` : null,
    }
  })
}
