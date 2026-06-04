/*
  emotionMapper.js — 감정(영문 코드)을 각 서비스가 이해하는 검색 기준으로 변환
    - 영화: TMDB 장르 ID(숫자)
    - 음악: Last.fm 태그(문자열)
    - 도서: Google Books 주제(문자열)

  ※ 아래 EMOTION_MAP은 "기본값"입니다.
    사용자가 제공할 매핑표를 받으면 이 표만 통째로 교체하면 됩니다.
    (API 함수나 페이지 코드는 손댈 필요 없음)

  참고 — 자주 쓰는 TMDB 장르 ID:
    코미디 35 · 드라마 18 · 액션 28 · SF 878 · 스릴러 53 · 공포 27
    다큐 99 · 로맨스 10749 · 애니메이션 16 · 판타지 14 · 음악 10402
*/

// 감정 → { 영화 장르ID, 음악 태그, 도서 주제 } 매핑표 (기본값)
const EMOTION_MAP = {
  happy:     { movieGenreId: 35,  musicTag: 'happy',      bookSubject: 'Humor' },
  sad:       { movieGenreId: 18,  musicTag: 'sad',        bookSubject: 'Poetry' },
  angry:     { movieGenreId: 28,  musicTag: 'rock',       bookSubject: 'Self-Help' },
  surprised: { movieGenreId: 878, musicTag: 'electronic', bookSubject: 'Science' },
  fearful:   { movieGenreId: 53,  musicTag: 'ambient',    bookSubject: 'Psychology' },
  disgusted: { movieGenreId: 27,  musicTag: 'metal',      bookSubject: 'Mystery' },
  neutral:   { movieGenreId: 99,  musicTag: 'chill',      bookSubject: 'Philosophy' },
  // 홈 화면에서 직접 고르는 '분위기' 감정 (위 7종에 더해 추가 지원)
  energetic: { movieGenreId: 28,  musicTag: 'dance',         bookSubject: 'Adventure' },
  calm:      { movieGenreId: 18,  musicTag: 'ambient',       bookSubject: 'Poetry' },
  inspired:  { movieGenreId: 12,  musicTag: 'inspirational', bookSubject: 'Self-Help' },
  // 감정 분석 화면의 빠른 선택 태그
  peaceful:  { movieGenreId: 18,  musicTag: 'ambient',       bookSubject: 'Poetry' },
  reflective:{ movieGenreId: 18,  musicTag: 'classical',     bookSubject: 'Philosophy' },
}

// 매핑표에 없는 감정이 들어왔을 때 쓸 안전한 기본값
const FALLBACK = { movieGenreId: 18, musicTag: 'chill', bookSubject: 'Fiction' }

/*
  getRecommendationKeys — 감정 하나에 대한 세 서비스의 검색 기준을 한 번에 돌려준다.
    입력: emotion(영문 감정 코드, 예: 'happy')
    반환: { movieGenreId, musicTag, bookSubject }
*/
export function getRecommendationKeys(emotion) {
  // 매핑표에 있으면 그 값을, 없으면 FALLBACK을 돌려준다
  return EMOTION_MAP[emotion] ?? FALLBACK
}
