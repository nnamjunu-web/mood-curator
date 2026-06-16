/*
  cardAdapter.js — 서로 다른 API 응답(TMDB/iTunes/카카오)을 하나의 공통 카드 형태로 변환
    공통 카드: { id, type, title, subtitle, description, image, link, previewId?, previewUrl? }
*/

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

// TMDB 영화 배열 → 공통 카드 배열
export function normalizeMovies(movies) {
  return movies.map((movie) => ({
    id: `movie-${movie.id}`,
    type: 'movie',
    previewId: movie.id, // 예고편 조회에 쓸 TMDB 숫자 id
    title: movie.title,
    subtitle: movie.release_date ? movie.release_date.slice(0, 4) : '', // 연도
    description: movie.overview,
    image: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
    link: `https://www.themoviedb.org/movie/${movie.id}`,
  }))
}

// iTunes 검색 결과 → 공통 카드 배열 (표지·미리듣기·링크가 이미 들어 있음)
export function normalizeItunesTracks(results) {
  return results.map((song) => ({
    id: `music-${song.trackId}`,
    type: 'music',
    title: song.trackName,
    subtitle: song.artistName ?? '',
    description: '',
    image: song.artworkUrl100
      ? song.artworkUrl100.replace('100x100bb', '512x512bb') // 표지 고해상도로
      : null,
    previewUrl: song.previewUrl ?? null,
    link: song.trackViewUrl ?? null,
  }))
}

// 카카오 책검색 결과 → 공통 카드 배열
export function normalizeKakaoBooks(documents) {
  return documents.map((book) => {
    // isbn이 비거나 공백을 포함할 수 있어 url로 폴백하고 공백을 -로 바꿔 고유성 보장
    const rawId = book.isbn || book.url || book.title
    const id = `book-${rawId}`.replace(/\s+/g, '-')

    return {
      id,
      type: 'book',
      title: book.title,
      subtitle: book.authors?.length ? book.authors.join(', ') : '',
      description: book.contents ?? '',
      image: book.thumbnail || null, // 빈 문자열이면 null
      link: book.url ?? null,
    }
  })
}
