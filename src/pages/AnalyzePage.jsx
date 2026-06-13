import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadFaceModels, detectExpressions, pickTopExpression } from '../services/faceApi'
import MoodPill from '../components/MoodPill'
import { UploadIcon, ScanFaceIcon } from '../components/Icons'
import styles from './AnalyzePage.module.css'

/*
  AnalyzePage — 얼굴 표정으로 감정을 분석하는 화면 (경로: /analyze)
  - 동작 (2단계: 미리보기 → 분석)
    1) 페이지에 들어오면 카메라가 자동으로 켜져 라이브 미리보기를 보여준다.
    2) '분석하기'를 누르면 그 순간의 표정을 face-api로 분석 → 결과 페이지로 이동.
       (얼굴을 못 찾으면 안내만 띄우고 미리보기는 유지 → 바로 재시도 가능)
    3) '사진 업로드' → 업로드한 이미지를 같은 로직으로 분석 → 결과 페이지로 이동.
    4) 하단 무드 태그 → 카메라 없이 그 감정으로 바로 결과 페이지로 이동.
    5) 카메라 권한 거부 시 안내 + '다시 시도' 버튼 표시.
*/

// 카메라 없이 감정을 직접 고르는 빠른 선택 태그 (라벨 + 시스템 코드)
const QUICK_MOODS = [
  { label: '평온', code: 'peaceful' },
  { label: '활기찬', code: 'energetic' },
  { label: '사색적인', code: 'reflective' },
  { label: '우울', code: 'sad' },
]

/*
  waitForVideoReady — 비디오가 첫 프레임을 그릴 준비가 될 때까지 기다린다.
    입력: video(<video> 요소)
    반환: Promise<void>
  - 카메라를 막 켜면 영상이 아직 안 들어와 있어, 바로 분석하면 빈 화면이 잡힌다.
*/
function waitForVideoReady(video) {
  return new Promise((resolve) => {
    // readyState >= 2면 이미 현재 프레임을 그릴 수 있는 상태
    if (video.readyState >= 2) {
      resolve()
      return
    }
    // 아니면 데이터가 로드되는 순간(loadeddata)을 한 번 기다린다
    video.onloadeddata = () => resolve()
  })
}

/*
  loadImage — 이미지 URL을 <img> 요소로 만들어 로드가 끝나면 돌려준다.
    입력: src(이미지 주소)
    반환: Promise<HTMLImageElement>
*/
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function AnalyzePage() {
  // useNavigate(): navigate('/경로')로 페이지를 이동시키는 함수
  const navigate = useNavigate()

  // 웹캠 영상을 보여줄 <video>, 끌 때 정리할 스트림, 숨겨진 파일 input을 가리킴
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)
  const startingRef = useRef(false) // 카메라를 켜는 중인지 (중복 요청 방지용 깃발)

  const [modelsReady, setModelsReady] = useState(false) // 모델 로딩 완료 여부
  const [cameraOn, setCameraOn] = useState(false)       // 카메라 켜짐 여부
  const [cameraError, setCameraError] = useState(null)  // 카메라 권한/오류 메시지
  const [analyzing, setAnalyzing] = useState(false)     // 분석 진행 중 여부
  const [notice, setNotice] = useState(null)            // 얼굴 미인식 등 알림

  // 화면이 처음 뜰 때: 모델을 미리 불러오고, 카메라를 자동으로 켜 라이브 미리보기를 시작한다.
  // (분석은 '분석하기'를 눌러야 일어난다. '다시 분석하기'로 재진입해도 이 effect가 다시 돌아 미리보기가 보인다.)
  useEffect(() => {
    loadFaceModels()
      .then(() => setModelsReady(true))
      .catch((error) => console.error(error))

    // 진입 즉시 카메라 켜기 → 미리보기
    startCamera()

    // 페이지를 떠날 때 카메라 정리
    return () => stopCamera()
  }, [])

  /*
    startCamera — 카메라 권한을 요청하고 영상을 <video>에 연결.
      반환: Promise<boolean> — 성공하면 true, 실패(거부 등)하면 false
  */
  async function startCamera() {
    // 이미 켜져 있거나(스트림 보유) 켜는 중이면 다시 요청하지 않는다 — 중복 권한 요청 방지
    // (특히 개발 모드 StrictMode에서 effect가 두 번 실행돼도 카메라를 한 번만 켜도록)
    if (streamRef.current || startingRef.current) {
      if (streamRef.current) setCameraOn(true)
      return true
    }
    startingRef.current = true
    try {
      // navigator.mediaDevices.getUserMedia({ video: true })
      //   입력: 장치 옵션(비디오만) / 반환: Promise<MediaStream>
      //   권한을 거부하면 에러를 던진다.
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraOn(true)
      setCameraError(null)
      return true
    } catch (error) {
      // 권한 거부와 그 외 오류를 구분해 안내
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraError('카메라 사용 권한이 거부되었습니다. 브라우저 주소창의 카메라 아이콘에서 권한을 허용한 뒤 다시 시도해 주세요.')
      } else if (error.name === 'NotFoundError') {
        setCameraError('연결된 카메라를 찾을 수 없습니다. 사진 업로드를 이용해 주세요.')
      } else {
        setCameraError('카메라를 켜는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      }
      setCameraOn(false)
      return false
    } finally {
      // 성공/실패와 무관하게 '켜는 중' 깃발을 내린다
      startingRef.current = false
    }
  }

  // 켜진 웹캠 스트림을 멈춰 카메라를 끈다
  function stopCamera() {
    const stream = streamRef.current
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  // 분석된 감정 + 신뢰도를 들고 결과 페이지로 이동
  function goToResult(emotion, score) {
    stopCamera()
    navigate(`/result?mood=${emotion}&confidence=${score.toFixed(2)}`)
  }

  /*
    handleAnalyze — '분석하기': 지금 미리보기 중인 화면에서 표정을 분석한다.
    - 카메라는 진입 시 이미 켜져 있으므로 여기서는 '분석'만 담당한다(켜기/이동과 분리).
  */
  async function handleAnalyze() {
    // 모델·카메라가 준비됐고 분석 중이 아닐 때만 진행
    if (!modelsReady || !cameraOn || analyzing) return
    setNotice(null)
    setAnalyzing(true)

    const video = videoRef.current
    await waitForVideoReady(video)              // 영상이 준비될 때까지 대기
    await new Promise((r) => setTimeout(r, 300)) // 노출 안정화를 위한 짧은 여유

    // 현재 프레임에서 7가지 감정 점수를 뽑는다
    const expressions = await detectExpressions(video)
    if (!expressions) {
      setNotice('얼굴을 인식하지 못했어요. 화면 중앙에 얼굴을 맞추고 다시 시도해 주세요.')
      setAnalyzing(false)
      return // 카메라는 끄지 않는다 → 미리보기 유지된 채 바로 다시 시도 가능
    }

    // 가장 점수 높은 감정 + 신뢰도로 결과 페이지 이동
    const top = pickTopExpression(expressions)
    goToResult(top.emotion, top.score)
  }

  // '사진 업로드' 버튼 → 숨겨진 파일 선택창 열기
  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  /*
    handleFileChange — 업로드한 이미지를 같은 face-api 로직으로 분석.
  */
  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file || !modelsReady) return

    setNotice(null)
    setAnalyzing(true)

    // URL.createObjectURL(파일): 파일을 가리키는 임시 주소를 만든다
    //   반환: 'blob:...' 형태의 문자열. 다 쓰면 revokeObjectURL로 해제해야 한다.
    const url = URL.createObjectURL(file)
    try {
      const img = await loadImage(url)
      const expressions = await detectExpressions(img)
      if (!expressions) {
        setNotice('업로드한 사진에서 얼굴을 찾지 못했어요. 다른 사진으로 시도해 주세요.')
        setAnalyzing(false)
        return
      }
      const top = pickTopExpression(expressions)
      goToResult(top.emotion, top.score)
    } catch {
      setNotice('이미지를 처리하지 못했어요. 다른 사진으로 시도해 주세요.')
      setAnalyzing(false)
    } finally {
      URL.revokeObjectURL(url)   // 임시 주소 해제(메모리 정리)
      event.target.value = ''    // 같은 파일을 다시 선택해도 동작하도록 초기화
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>오늘 당신의 기분은 어떤가요?</h1>
      <p className={styles.subtitle}>프레임 중앙에 얼굴을 맞추고 현재의 감정을 표현해 주세요.</p>

      {/* 카메라 프레임 (모서리 브래킷 + 점선 테두리) */}
      <div className={styles.camera}>
        <div className={styles.frame}>
          {/* 네 모서리 브래킷 */}
          <span className={`${styles.bracket} ${styles.tl}`} />
          <span className={`${styles.bracket} ${styles.tr}`} />
          <span className={`${styles.bracket} ${styles.bl}`} />
          <span className={`${styles.bracket} ${styles.br}`} />

          {/* 웹캠 영상 (켜졌을 때만 표시) */}
          <video
            ref={videoRef}
            className={styles.video}
            autoPlay
            muted
            playsInline
            style={{ display: cameraOn ? 'block' : 'none' }}
          />

          {/* 카메라 꺼짐 + 오류 없음 → 상태 알약 (자동 켜기라 대개 잠깐만 보인다) */}
          {!cameraOn && !cameraError && (
            <span className={styles.statusPill}>
              <span className={styles.dot} />
              {analyzing ? '분석 중…' : modelsReady ? '카메라를 켜는 중…' : '모델을 불러오는 중…'}
            </span>
          )}

          {/* 권한 거부 등 오류 → 안내 박스 + 다시 시도 */}
          {cameraError && (
            <div className={styles.errorBox}>
              <div className={styles.errorText}>
                <p>⚠️ {cameraError}</p>
                <button className={styles.retryButton} onClick={startCamera}>
                  카메라 다시 시도
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 분석 / 업로드 버튼 */}
      <div className={styles.actions}>
        <button
          className={styles.primaryButton}
          onClick={handleAnalyze}
          disabled={!modelsReady || !cameraOn || analyzing}
        >
          <ScanFaceIcon /> {analyzing ? '분석 중…' : '분석하기'}
        </button>
        <button
          className={styles.secondaryButton}
          onClick={handleUploadClick}
          disabled={!modelsReady || analyzing}
        >
          <UploadIcon /> 사진 업로드
        </button>
        {/* 실제 파일 선택창은 숨겨두고 버튼으로 연다 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />
      </div>

      {/* 얼굴 미인식 등 알림 */}
      {notice && <p className={styles.notice}>{notice}</p>}

      {/* 카메라 없이 감정을 직접 고르는 빠른 선택 */}
      <div className={styles.quickMoods}>
        {QUICK_MOODS.map((mood) => (
          <MoodPill
            key={mood.code}
            label={mood.label}
            onClick={() => navigate(`/result?mood=${mood.code}`)}
          />
        ))}
      </div>
    </div>
  )
}

export default AnalyzePage
