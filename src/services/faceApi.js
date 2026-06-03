/*
  faceApi.js — @vladmandic/face-api 라이브러리를 감싸는 함수 모음
  - 컴포넌트(AnalyzePage)가 face-api의 복잡한 사용법을 직접 알 필요 없도록,
    "모델 로드"와 "표정 감지"라는 두 가지 기능만 깔끔한 함수로 노출한다.
  - 이렇게 services 폴더에 분리해 두면 페이지 코드가 단순해진다.
*/

// face-api 라이브러리 전체를 faceapi 라는 이름으로 가져온다
import * as faceapi from '@vladmandic/face-api'

// public/models 폴더 경로 (브라우저에서는 '/'가 public 폴더를 가리킨다)
const MODEL_URL = '/models'

// 모델을 이미 불러왔는지 기억하는 깃발 — 중복 로드를 막기 위함
let modelsLoaded = false

/*
  loadFaceModels — 표정 인식에 필요한 신경망 모델 2개를 내려받아 메모리에 올린다.
    입력: 없음
    반환: Promise<void> (await로 "로딩 끝"을 기다릴 수 있음)

  - tinyFaceDetector: 영상 속에서 "얼굴이 어디 있는지" 찾는 가벼운 모델
  - faceExpressionNet: 찾은 얼굴이 "어떤 표정인지" 점수로 매기는 모델
*/
export async function loadFaceModels() {
  // 이미 로드했다면 다시 하지 않고 바로 끝낸다
  if (modelsLoaded) return

  // loadFromUri(경로)
  //   입력: 모델 파일들이 있는 폴더 경로
  //   반환: Promise — 해당 모델을 다 읽으면 완료됨
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
  await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)

  modelsLoaded = true
}

/*
  detectExpressions — 비디오(웹캠) 화면 한 프레임에서 얼굴을 찾아 표정 점수를 뽑는다.
    입력: videoElement — <video> DOM 요소 (현재 웹캠 영상이 흐르는 화면)
    반환: 7가지 감정 점수 객체 또는 null(얼굴을 못 찾은 경우)
          예) { happy: 0.92, sad: 0.01, angry: 0.0, surprised: 0.03,
                fearful: 0.0, disgusted: 0.0, neutral: 0.04 }
          각 점수는 0~1 사이이고, 7개를 모두 더하면 약 1이 된다.
*/
export async function detectExpressions(videoElement) {
  // detectSingleFace(...): 화면에서 "가장 뚜렷한 얼굴 하나"를 찾는다
  //   입력: 비디오/이미지 요소 + 탐지 옵션
  //   반환: 얼굴 정보 (없으면 undefined)
  // .withFaceExpressions(): 찾은 얼굴에 대해 표정 점수까지 함께 계산하도록 연결
  const result = await faceapi
    .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceExpressions()

  // 얼굴을 못 찾았으면 null을 돌려준다
  if (!result) return null

  // result.expressions 안에 7가지 감정 점수가 들어 있다
  return result.expressions
}

/*
  pickTopExpression — 7가지 점수 중 가장 높은 감정 하나를 골라낸다.
    입력: expressions — detectExpressions가 돌려준 점수 객체
    반환: { emotion: '가장 높은 감정 영문명', score: 그 점수(0~1) }

  - Object.entries(객체): {키:값} 을 [[키,값], ...] 배열로 바꿔준다.
  - reduce: 배열을 돌면서 "지금까지 가장 점수 높은 항목"을 계속 갱신해 하나로 줄인다.
*/
export function pickTopExpression(expressions) {
  const entries = Object.entries(expressions) // 예: [['happy', 0.92], ['sad', 0.01], ...]

  // 첫 항목을 시작값으로 두고, 더 높은 점수가 나오면 교체한다
  const [emotion, score] = entries.reduce((best, current) =>
    current[1] > best[1] ? current : best
  )

  return { emotion, score }
}
