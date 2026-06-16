/*
  faceApi.js — @vladmandic/face-api 라이브러리를 감싸 '모델 로드'와 '표정 감지'만 노출
*/

import * as faceapi from '@vladmandic/face-api'

const MODEL_URL = '/models' // public/models 폴더
let modelsLoaded = false     // 중복 로드 방지 플래그

// 표정 인식에 필요한 모델 2개(얼굴 탐지 + 표정 분류)를 로드한다
export async function loadFaceModels() {
  if (modelsLoaded) return

  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
  await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)

  modelsLoaded = true
}

/*
  detectExpressions — 영상 한 프레임에서 얼굴을 찾아 7가지 감정 점수를 뽑는다.
    입력: videoElement(<video> 요소)
    반환: { happy, sad, angry, surprised, fearful, disgusted, neutral } 또는 null(얼굴 못 찾음)
*/
export async function detectExpressions(videoElement) {
  const result = await faceapi
    .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceExpressions()

  if (!result) return null
  return result.expressions
}

/*
  pickTopExpression — 7가지 점수 중 가장 높은 감정 하나를 고른다.
    반환: { emotion(영문명), score(0~1) }
*/
export function pickTopExpression(expressions) {
  const entries = Object.entries(expressions)
  const [emotion, score] = entries.reduce((best, current) =>
    current[1] > best[1] ? current : best
  )
  return { emotion, score }
}
