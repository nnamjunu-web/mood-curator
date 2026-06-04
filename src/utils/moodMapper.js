/*
  moodMapper.js — 감정 영문 코드를 한국어 레이블/이모지로 바꾸는 변환 로직
  - face-api가 돌려주는 7가지 감정(영문)을 화면에 보여줄 한국어로 매핑한다.
  - 변환 규칙을 이 한 파일에 모아두면, 표현을 바꿀 때 여기만 고치면 된다.
*/

// 영문 감정 → 한국어 레이블
const LABEL_MAP = {
  happy: '행복',
  sad: '슬픔',
  angry: '화남',
  surprised: '놀람',
  fearful: '두려움',
  disgusted: '역겨움',
  neutral: '무덤덤',
  // 홈 화면에서 직접 고르는 '분위기' 감정 (얼굴 인식 7종과 별개로 추가 지원)
  energetic: '활기찬',
  calm: '차분함',
  inspired: '영감',
  peaceful: '평온',
  reflective: '사색적인',
}

// 영문 감정 → 이모지
const EMOJI_MAP = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  surprised: '😲',
  fearful: '😨',
  disgusted: '🤢',
  neutral: '😐',
  // 분위기 감정 이모지 (홈 화면 알약과 동일)
  energetic: '⚡',
  calm: '🌿',
  inspired: '💡',
  peaceful: '😌',
  reflective: '🤔',
}

/*
  getMoodLabel — 감정 코드를 한국어 레이블로 바꾼다.
    입력: emotion(영문 코드, 예: 'happy')
    반환: 한국어 문자열(예: '행복'). 없는 코드면 입력값을 그대로 돌려줌
*/
export function getMoodLabel(emotion) {
  return LABEL_MAP[emotion] ?? emotion
}

/*
  getMoodEmoji — 감정 코드를 이모지로 바꾼다.
    입력: emotion(영문 코드)
    반환: 이모지 문자열. 없는 코드면 물음표
*/
export function getMoodEmoji(emotion) {
  return EMOJI_MAP[emotion] ?? '❓'
}
