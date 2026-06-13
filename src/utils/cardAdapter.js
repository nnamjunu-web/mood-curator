/*
  cardAdapter.js — 서로 다른 API 응답을 "카드 한 장"이 쓰는 공통 형태로 변환
  - TMDB(영화) / iTunes 한국 스토어(음악) / 카카오(도서)는 각자 응답 구조가 완전히 다르다.
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
        previewId,   // (영화 전용) 예고편 조회용 TMDB 숫자 id
        previewUrl,  // (음악 전용) 30초 미리듣기 오디오 URL (없으면 null)
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
    // previewId: 예고편 조회(fetchMovieTrailer)에 쓸 TMDB 숫자 id.
    //   id('movie-123')는 접두어가 붙어 API에 바로 못 쓰므로, 숫자 id를 따로 싣는다.
    previewId: movie.id,
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
  normalizeItunesTracks — iTunes(한국 스토어) 검색 결과를 공통 카드 배열로 변환
    입력: results (iTunes 응답의 results 배열,
                   각 원소: { trackId, trackName, artistName, artworkUrl100, previewUrl, trackViewUrl })
    반환: 공통 카드 배열
  - iTunes 검색 한 번에 표지·미리듣기·링크가 다 들어오므로, 추가 보조 조회 없이 바로 카드가 된다.
*/
export function normalizeItunesTracks(results) {
  return results.map((song) => ({
    // trackId는 곡마다 고유한 숫자 → 즐겨찾기 구분용 id로 사용
    id: `music-${song.trackId}`,
    type: 'music',
    title: song.trackName,
    subtitle: song.artistName ?? '',
    description: '',
    // 100x100 표지를 512x512로 키워 쓴다(없으면 null → 그라데이션 폴백)
    image: song.artworkUrl100
      ? song.artworkUrl100.replace('100x100bb', '512x512bb')
      : null,
    // 30초 미리듣기 URL(없을 수도 있음)
    previewUrl: song.previewUrl ?? null,
    // 애플 뮤직 상세 페이지 링크
    link: song.trackViewUrl ?? null,
  }))
}

/*
  normalizeKakaoBooks — 카카오 책검색 결과(documents)를 공통 카드 배열로 변환
    입력: documents (카카오 응답의 documents 배열,
                     각 원소: { title, contents, url, isbn, authors, publisher, thumbnail, ... })
    반환: 공통 카드 배열
  - 추천 도서를 한글로 보여주려고 카카오를 쓰며, 이 함수가 그 응답을 공통 카드로 맞춘다.
*/
export function normalizeKakaoBooks(documents) {
  return documents.map((book) => {
    // isbn은 "ISBN10 ISBN13"처럼 공백으로 이어진 문자열이고 비어 있을 수도 있다.
    // 비면 url로 폴백하고, 공백을 -로 바꿔 id가 깨지지 않게 한다(고유성 보장).
    const rawId = book.isbn || book.url || book.title
    const id = `book-${rawId}`.replace(/\s+/g, '-')

    return {
      id,
      type: 'book',
      title: book.title,
      // authors는 배열 → 쉼표로 이어 붙인다(없으면 빈 문자열)
      subtitle: book.authors?.length ? book.authors.join(', ') : '',
      description: book.contents ?? '',
      // thumbnail은 표지 없을 때 빈 문자열일 수 있으므로, 빈 값이면 null(→ 그라데이션 폴백)
      image: book.thumbnail || null,
      // 상세 페이지(다음 책 페이지) 링크
      link: book.url ?? null,
    }
  })
}
