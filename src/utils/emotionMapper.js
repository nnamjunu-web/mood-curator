/*
  emotionMapper.js — 감정 코드를 각 서비스의 검색 기준으로 변환
    영화: TMDB 장르 ID / 음악: iTunes 한글 검색어 / 도서: 카카오 한글 검색어
  참고 TMDB 장르 ID: 코미디 35 · 드라마 18 · 액션 28 · SF 878 · 스릴러 53 · 공포 27 · 다큐 99 · 모험 12
*/

// 감정 → { 영화 장르ID, 음악 검색어, 도서 검색어 } 매핑표
const EMOTION_MAP = {
  happy:     { movieGenreId: 35,  musicTag: '신나는 가요', bookSubject: '유머' },
  sad:       { movieGenreId: 18,  musicTag: '발라드',     bookSubject: '위로' },
  angry:     { movieGenreId: 28,  musicTag: '락',         bookSubject: '마음챙김' },
  surprised: { movieGenreId: 878, musicTag: 'EDM',        bookSubject: '과학' },
  fearful:   { movieGenreId: 53,  musicTag: '뉴에이지',   bookSubject: '심리' },
  disgusted: { movieGenreId: 27,  musicTag: '메탈',       bookSubject: '미스터리' },
  neutral:   { movieGenreId: 99,  musicTag: '카페 음악',  bookSubject: '철학' },
  // 홈 화면에서 직접 고르는 '분위기' 감정 (위 7종에 더해 추가 지원)
  energetic: { movieGenreId: 28,  musicTag: '댄스',       bookSubject: '여행' },
  calm:      { movieGenreId: 18,  musicTag: '감성',       bookSubject: '에세이' },
  inspired:  { movieGenreId: 12,  musicTag: 'OST',        bookSubject: '자기계발' },
  // 감정 분석 화면의 빠른 선택 태그
  peaceful:  { movieGenreId: 18,  musicTag: '재즈',       bookSubject: '시' },
  reflective:{ movieGenreId: 18,  musicTag: '클래식',     bookSubject: '인문학' },
}

// 매핑표에 없는 감정이 들어왔을 때 쓸 안전한 기본값
const FALLBACK = { movieGenreId: 18, musicTag: '가요', bookSubject: '소설' }

// 감정 코드의 검색 기준을 돌려준다 (매핑에 없으면 FALLBACK)
export function getRecommendationKeys(emotion) {
  return EMOTION_MAP[emotion] ?? FALLBACK
}
