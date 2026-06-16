/*
  moodMapper.js — 감정 코드를 화면 표시용 한국어 레이블/이모지로 변환
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

// 감정 코드 → 한국어 레이블 (없으면 입력값 그대로)
export function getMoodLabel(emotion) {
  return LABEL_MAP[emotion] ?? emotion
}

// 감정 코드 → 이모지 (없으면 물음표)
export function getMoodEmoji(emotion) {
  return EMOJI_MAP[emotion] ?? '❓'
}
