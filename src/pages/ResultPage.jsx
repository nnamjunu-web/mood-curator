import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getMoodLabel, getMoodEmoji } from '../utils/moodMapper'
import { getRecommendations, isAllFailed } from '../services/recommendations'
import { getFavorites, toggleFavorite } from '../services/favorites'
import { useAuth } from '../context/AuthContext'
import RecommendationCard from '../components/RecommendationCard'
import LoginNotice from '../components/LoginNotice'
import Spinner from '../components/Spinner'
import styles from './ResultPage.module.css'

/*
  ResultPage — 감정에 맞춰 영화·음악·책을 추천하는 화면 (경로: /result?mood=감정)
  - 동작 순서
    1) 주소(URL)의 ?mood=행복 같은 값에서 감정을 읽는다.
    2) 감정을 매핑 함수에 넣어 영화/음악/도서 검색 기준을 얻는다.
    3) 세 API를 "동시에" 호출한다(Promise.allSettled). 로딩 중엔 스피너 표시.
    4) 성공한 카테고리는 카드로 보여주고, 실패한 카테고리만 그 자리에 안내 문구를 띄운다.
       (세 개가 모두 실패했을 때만 화면 전체 에러 박스를 보여준다)
    5) 카드의 북마크를 누르면 localStorage에 즐겨찾기로 저장/해제한다.
*/
function ResultPage() {
  // useSearchParams: 주소의 쿼리스트링(?key=value)을 읽는 react-router 훅
  //   반환: [searchParams 객체, 바꾸는 함수]. .get('이름')으로 값을 읽는다.
  const [searchParams] = useSearchParams()
  const mood = searchParams.get('mood') ?? 'neutral' // 값이 없으면 '무덤덤'을 기본값으로
  // 분석 신뢰도(0~1) — 표정/사진 분석으로 들어왔을 때만 존재한다
  const confidence = searchParams.get('confidence')

  const [loading, setLoading] = useState(true)

  // 카테고리별 추천 결과 (성공한 것만 채워짐)
  const [recs, setRecs] = useState({ movies: [], music: [], books: [] })

  // 카테고리별 에러 메시지 (실패한 것만 문구가 들어가고, 성공이면 null)
  const [sectionErrors, setSectionErrors] = useState({ movies: null, music: null, books: null })

  // 세 카테고리가 모두 실패했을 때만 채워지는 전체 에러 메시지
  const [globalError, setGlobalError] = useState(null)

  // 에러 후 '다시 시도'를 누르면 이 숫자를 바꿔 useEffect를 재실행시킨다
  const [reloadFlag, setReloadFlag] = useState(0)

  // 즐겨찾기된 항목들의 id 목록 — 처음엔 localStorage에서 불러온다.
  //   useState(() => ...): 함수를 넣으면 "맨 처음 한 번"만 실행해 초기값을 만든다(지연 초기화)
  const [favoriteIds, setFavoriteIds] = useState(() => getFavorites().map((f) => f.id))

  // useAuth(): 로그인 상태(user)를 읽는다 (null이면 비로그인)
  const { user } = useAuth()
  // 비로그인 사용자가 찜하기를 시도했을 때 띄울 안내 표시 여부
  const [loginNotice, setLoginNotice] = useState(false)

  // mood가 바뀌거나 다시 시도할 때마다 추천 데이터를 불러온다
  useEffect(() => {
    // ignore: 이 효과가 끝나기 전에 mood가 또 바뀌면, 이전 요청 결과는 버리기 위한 깃발
    //         (오래된 응답이 최신 화면을 덮어쓰는 문제를 막는다)
    let ignore = false

    async function loadRecommendations() {
      setLoading(true)
      setGlobalError(null)

      // 공통 서비스로 추천 가져오기 (감정→매핑→동시호출→정규화+부분실패)
      const { movies, music, books, errors } = await getRecommendations(mood)

      // 효과가 이미 무효화됐으면(컴포넌트가 사라졌거나 mood 변경) 결과 반영 안 함
      if (ignore) return

      setRecs({ movies, music, books })
      setSectionErrors(errors)

      // 세 개가 모두 실패했을 때만 전체 에러 박스를 띄운다
      if (isAllFailed(errors)) {
        setGlobalError('추천을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      }

      setLoading(false)
    }

    loadRecommendations()

    // 정리 함수: 다음 효과 실행 전(또는 화면을 떠날 때) 이전 요청을 무효화
    return () => {
      ignore = true
    }
  }, [mood, reloadFlag])

  /*
    handleToggleSave — 카드의 북마크를 눌렀을 때 즐겨찾기 저장/해제
      입력: item(공통 카드 객체)
  */
  function handleToggleSave(item) {
    // 비로그인 사용자는 찜할 수 없다 → 저장하지 않고 안내만 띄운다
    if (!user) {
      setLoginNotice(true)
      return
    }
    const updated = toggleFavorite(item) // localStorage 갱신 + 새 목록 반환
    setFavoriteIds(updated.map((f) => f.id)) // 화면도 함께 갱신
  }

  // 특정 id가 즐겨찾기에 있는지 확인하는 도우미
  const isSaved = (id) => favoriteIds.includes(id)

  /*
    renderSection — 카테고리(영화/음악/도서) 하나를 제목 + 내용으로 그린다.
    - 컴포넌트가 아니라 일반 함수로 만들어, 위에서 만든 isSaved/handleToggleSave를
      그대로 쓰면서 반복 코드를 줄인다.
      입력: title(섹션 제목), items(카드 배열), errorMessage(이 섹션의 에러 문구 또는 null)
  */
  function renderSection(title, items, errorMessage) {
    return (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{title}</h2>

        {/* 우선순위: 에러 → 빈 결과 → 카드 그리드 */}
        {errorMessage ? (
          <p className={styles.sectionError}>⚠️ {errorMessage}</p>
        ) : items.length === 0 ? (
          <p className={styles.empty}>추천 결과가 없습니다.</p>
        ) : (
          <div className={styles.grid}>
            {items.map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                isSaved={isSaved(item.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <div className={styles.page}>
      {/* ===== 상단 감정 요약 ===== */}
      <section className={styles.summary}>
        <div className={styles.circle}>
          <span className={styles.emoji}>{getMoodEmoji(mood)}</span>
        </div>
        <h1 className={styles.headline}>
          분석 결과, 당신은 지금 <span className={styles.highlight}>'{getMoodLabel(mood)}'</span>을(를) 느끼고 계시네요.
        </h1>
        {/* 표정/사진 분석으로 들어왔을 때만 신뢰도를 보여준다 */}
        {confidence && (
          <p className={styles.confidence}>표정 신뢰도 {Math.round(Number(confidence) * 100)}%</p>
        )}
        <p className={styles.desc}>이 감정에 어울리는 영화·음악·책을 모아왔어요.</p>
      </section>

      {/* 비로그인 사용자가 찜하기를 누르면 뜨는 안내 */}
      <LoginNotice show={loginNotice} />

      {/* ===== 본문: 로딩 / 전체 에러 / 결과 세 가지 중 하나 ===== */}
      {loading && <Spinner label="추천 콘텐츠를 불러오는 중…" />}

      {/* 로딩이 끝났고 세 개 모두 실패했으면 전체 에러 박스 */}
      {!loading && globalError && (
        <div className={styles.errorBox}>
          <p className={styles.errorText}>⚠️ {globalError}</p>
          <button className={styles.retryButton} onClick={() => setReloadFlag((n) => n + 1)}>
            다시 시도
          </button>
        </div>
      )}

      {/* 로딩이 끝났고 전체 실패가 아니면 카테고리별로 표시
          (일부 실패한 섹션은 renderSection 안에서 안내 문구가 나온다) */}
      {!loading && !globalError && (
        <>
          {renderSection('🎬 영화', recs.movies, sectionErrors.movies)}
          {renderSection('🎵 음악', recs.music, sectionErrors.music)}
          {renderSection('📚 도서', recs.books, sectionErrors.books)}
        </>
      )}

      {/* 하단: 다시 분석하러 가기 */}
      <div className={styles.footerActions}>
        <Link to="/analyze" className={styles.outlineButton}>↻ 다시 분석하기</Link>
      </div>
    </div>
  )
}

export default ResultPage
