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
  ResultPage — 감정(URL의 ?mood)에 맞춰 영화·음악·책을 추천하는 화면 (경로: /result)
*/
function ResultPage() {
  const [searchParams] = useSearchParams()
  const mood = searchParams.get('mood') ?? 'neutral'
  const confidence = searchParams.get('confidence') // 표정 분석으로 들어왔을 때만 존재

  const [loading, setLoading] = useState(true)
  const [recs, setRecs] = useState({ movies: [], music: [], books: [] })
  const [sectionErrors, setSectionErrors] = useState({ movies: null, music: null, books: null })
  const [globalError, setGlobalError] = useState(null) // 세 카테고리 모두 실패 시
  const [reloadFlag, setReloadFlag] = useState(0)       // '다시 시도'로 재요청
  const [favoriteIds, setFavoriteIds] = useState(() => getFavorites().map((f) => f.id))

  const { user } = useAuth()
  const [loginNotice, setLoginNotice] = useState(false) // 비로그인 찜 시도 안내

  // mood가 바뀌거나 다시 시도할 때마다 추천을 불러온다
  useEffect(() => {
    // ignore: 늦게 온 이전 요청이 최신 화면을 덮어쓰지 않게 막는 플래그
    let ignore = false

    async function loadRecommendations() {
      setLoading(true)
      setGlobalError(null)

      const { movies, music, books, errors } = await getRecommendations(mood)
      if (ignore) return

      setRecs({ movies, music, books })
      setSectionErrors(errors)

      if (isAllFailed(errors)) {
        setGlobalError('추천을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      }

      setLoading(false)
    }

    loadRecommendations()

    return () => {
      ignore = true
    }
  }, [mood, reloadFlag])

  // 카드 북마크 → 즐겨찾기 저장/해제 (비로그인이면 안내만)
  function handleToggleSave(item) {
    if (!user) {
      setLoginNotice(true)
      return
    }
    const updated = toggleFavorite(item)
    setFavoriteIds(updated.map((f) => f.id))
  }

  const isSaved = (id) => favoriteIds.includes(id)

  // 카테고리 하나를 제목 + 내용(에러/빈/카드)으로 그린다
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
