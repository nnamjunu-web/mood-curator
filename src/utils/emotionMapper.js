/*
  emotionMapper.js — 감정(영문 코드)을 각 서비스가 이해하는 검색 기준으로 변환
    - 영화: TMDB 장르 ID(숫자)
    - 음악: iTunes 한국 스토어 '한글 검색어'(문자열)
    - 도서: 카카오 책검색 '한글 검색어'(문자열)

  ※ musicTag·bookSubject는 예전엔 영어(Last.fm 태그 / Open Library 주제명)였지만,
    추천을 한국 음악·한글 도서로 받기 위해 각각 'iTunes 한글 검색어' / '카카오 한글 검색어'로 바꿨다.
    (필드명은 호출부 변경을 줄이려고 그대로 두되, 값은 한글 키워드다.)

  ※ 아래 EMOTION_MAP은 "기본값"입니다. 매핑을 바꾸려면 이 표만 고치면 됩니다.

  참고 — 자주 쓰는 TMDB 장르 ID:
    코미디 35 · 드라마 18 · 액션 28 · SF 878 · 스릴러 53 · 공포 27
    다큐 99 · 로맨스 10749 · 애니메이션 16 · 판타지 14 · 음악 10402
*/

// 감정 → { 영화 장르ID, 음악 한글 검색어, 도서 한글 검색어 } 매핑표 (기본값)
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

/*
  getRecommendationKeys — 감정 하나에 대한 세 서비스의 검색 기준을 한 번에 돌려준다.
    입력: emotion(영문 감정 코드, 예: 'happy')
    반환: { movieGenreId, musicTag, bookSubject }
*/
export function getRecommendationKeys(emotion) {
  // 매핑표에 있으면 그 값을, 없으면 FALLBACK을 돌려준다
  return EMOTION_MAP[emotion] ?? FALLBACK
}
