import { useEffect, useState } from 'react'
import { fetchPopularMovies } from '../services/tmdb'
import { searchKoreanTracks } from '../services/itunes'
import { fetchBooksByQuery } from '../services/kakaoBooks'
import { normalizeMovies, normalizeItunesTracks, normalizeKakaoBooks } from '../utils/cardAdapter'
import { getFavorites, toggleFavorite } from '../services/favorites'
import { useAuth } from '../context/AuthContext'
import { BookmarkIcon, ClockIcon } from '../components/Icons'
import Spinner from '../components/Spinner'
import DetailLink from '../components/DetailLink'
import LoginNotice from '../components/LoginNotice'
import styles from './PopularPage.module.css'

/*
  PopularPage — '인기 차트' 화면 (경로: /popular)
  - 영화·음악·도서를 하나의 순위로 섞어 보여준다(1위 + 2·3위 + 4위~ 리스트).
  - 진짜 '인기' API가 없어 넓은 검색어로 근사한다(진짜 인기 순위 아님).
*/

// 분류 탭 — 라벨과 실제 item.type 값
const TABS = [
  { label: '전체', value: 'all' },
  { label: '영화', value: 'movie' },
  { label: '음악', value: 'music' },
  { label: '도서', value: 'book' },
]

// 타입(영문) → 한국어 라벨 / 자리표시 그라데이션
const TYPE_LABEL = { movie: '영화', music: '음악', book: '도서' }
const TYPE_GRADIENT = {
  movie: 'linear-gradient(160deg, #2f4538, #6f8f7a)',
  music: 'linear-gradient(160deg, #2a1040, #b14de0)',
  book: 'linear-gradient(160deg, #6b5a3a, #c9a87a)',
}

// 카테고리별로 차트에 넣을 최대 개수
const PER_CATEGORY = 12

// 이미지/그라데이션 배경 스타일
function thumbStyle(item) {
  return item.image
    ? { backgroundImage: `url(${item.image})` }
    : { background: TYPE_GRADIENT[item.type] }
}

// 여러 배열을 번갈아(round-robin) 한 배열로 합친다 (한 종류가 독점하지 않게)
function interleave(lists) {
  const result = []
  const maxLength = Math.max(0, ...lists.map((list) => list.length))
  for (let i = 0; i < maxLength; i++) {
    for (const list of lists) {
      if (list[i]) result.push(list[i])
    }
  }
  return result
}

function PopularPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])             // 섞인 전체 인기 목록
  const [globalError, setGlobalError] = useState(null) // 셋 다 실패했을 때만 채워짐
  const [reloadFlag, setReloadFlag] = useState(0)

  const [activeTab, setActiveTab] = useState('all') // 현재 분류 필터
  const [visibleRows, setVisibleRows] = useState(3)  // 4위부터 몇 줄까지 보여줄지

  // 즐겨찾기 id 목록 (처음 한 번 localStorage에서 읽음)
  const [favoriteIds, setFavoriteIds] = useState(() => getFavorites().map((f) => f.id))

  const { user } = useAuth()
  const [loginNotice, setLoginNotice] = useState(false) // 비로그인 찜 시도 안내

  // 인기 데이터 불러오기 (mount + 다시 시도)
  useEffect(() => {
    let ignore = false

    async function loadPopular() {
      setLoading(true)
      setGlobalError(null)

      // 세 곳을 동시에 요청 (음악·도서는 넓은 검색어로 인기 근사)
      const [movieRes, trackRes, bookRes] = await Promise.allSettled([
        fetchPopularMovies(),
        searchKoreanTracks('가요', PER_CATEGORY),
        fetchBooksByQuery('베스트셀러'),
      ])

      if (ignore) return

      // 성공한 것만 공통 카드로 변환 + 개수 제한
      const movies = movieRes.status === 'fulfilled' ? normalizeMovies(movieRes.value).slice(0, PER_CATEGORY) : []
      const music = trackRes.status === 'fulfilled' ? normalizeItunesTracks(trackRes.value).slice(0, PER_CATEGORY) : []
      const books = bookRes.status === 'fulfilled' ? normalizeKakaoBooks(bookRes.value).slice(0, PER_CATEGORY) : []

      // 세 목록을 번갈아 섞어 하나의 차트로
      setItems(interleave([movies, music, books]))

      // 셋 다 실패했을 때만 전체 에러
      const everyFailed = [movieRes, trackRes, bookRes].every((r) => r.status === 'rejected')
      if (everyFailed) {
        setGlobalError(movieRes.reason?.message ?? '인기 차트를 불러오지 못했습니다.')
      }

      setLoading(false)
    }

    loadPopular()
    return () => {
      ignore = true
    }
  }, [reloadFlag])

  // 탭 변경: 필터를 바꾸고 더보기 줄 수는 처음(3줄)으로 리셋
  function handleTab(value) {
    setActiveTab(value)
    setVisibleRows(3)
  }

  // 보관함 저장/해제 (차트 항목은 이미 공통 카드 형태라 그대로 저장)
  function handleSave(item) {
    // 비로그인 사용자는 찜할 수 없다 → 저장하지 않고 안내만 띄운다
    if (!user) {
      setLoginNotice(true)
      return
    }
    const updated = toggleFavorite(item)
    setFavoriteIds(updated.map((f) => f.id))
  }
  const isSaved = (id) => favoriteIds.includes(id)

  // 현재 탭에 맞춰 거른 목록과 순위별 분할
  const filtered = activeTab === 'all' ? items : items.filter((i) => i.type === activeTab)
  const feature = filtered[0]                        // 1위
  const sideCards = filtered.slice(1, 3)             // 2~3위
  const rankRows = filtered.slice(3, 3 + visibleRows) // 4위~
  const hasMore = filtered.length > 3 + visibleRows

  return (
    <div className={styles.page}>
      {/* 제목 + 부제 */}
      <h1 className={styles.title}>인기 차트</h1>
      <p className={styles.subtitle}>
        지금 다른 사람들이 즐기는 콘텐츠를 확인해 보세요. 영화·음악·도서의 실시간 인기 목록입니다.
      </p>

      {/* 탭 + 업데이트 시각 */}
      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.value}
              className={activeTab === tab.value ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              onClick={() => handleTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className={styles.updated}>
          <ClockIcon /> 방금 업데이트됨
        </span>
      </div>

      {/* 비로그인 사용자가 찜하기를 누르면 뜨는 안내 */}
      <LoginNotice show={loginNotice} />

      {/* 로딩 */}
      {loading && <Spinner label="인기 차트를 불러오는 중…" />}

      {/* 전체 실패 시 에러 박스 */}
      {!loading && globalError && (
        <div className={styles.errorBox}>
          <p className={styles.errorText}>⚠️ {globalError}</p>
          <button className={styles.retryButton} onClick={() => setReloadFlag((n) => n + 1)}>
            다시 시도
          </button>
        </div>
      )}

      {/* 결과 */}
      {!loading && !globalError && (
        <>
          {filtered.length === 0 ? (
            <p className={styles.empty}>해당 분류의 인기 항목이 없어요.</p>
          ) : (
            <>
              {/* ===== 상위 카드 영역 (1위 + 2,3위) ===== */}
              <div className={styles.topGrid}>
                {/* 1위 대형 카드 */}
                {feature && (
                  <article className={styles.feature}>
                    <div className={styles.featureImage} style={thumbStyle(feature)}>
                      <span className={styles.rankBadge}>#1</span>
                      <div className={styles.featureOverlay}>
                        <span className={styles.trending}>지금 인기</span>
                        <h2 className={styles.featureTitle}>{feature.title}</h2>
                        {feature.subtitle && <p className={styles.featureMeta}>{feature.subtitle}</p>}
                      </div>
                    </div>

                    <div className={styles.featureFooter}>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>분류</span>
                        <span className={styles.statValue}>{TYPE_LABEL[feature.type]}</span>
                      </div>
                      {/* 자세히 보기 (링크가 있을 때만) */}
                      <DetailLink href={feature.link} />
                      <button
                        className={isSaved(feature.id) ? `${styles.saveButton} ${styles.saveButtonActive}` : styles.saveButton}
                        onClick={() => handleSave(feature)}
                      >
                        <BookmarkIcon filled={isSaved(feature.id)} />
                        {isSaved(feature.id) ? '저장됨' : '보관함에 저장'}
                      </button>
                    </div>
                  </article>
                )}

                {/* 2,3위 작은 카드들 */}
                <div className={styles.sideList}>
                  {sideCards.map((item, index) => (
                    <article key={item.id} className={styles.sideCard}>
                      <div className={styles.sideThumb} style={thumbStyle(item)}>
                        {/* 0번째 → 2위 */}
                        <span className={styles.sideRank}>{index + 2}</span>
                      </div>
                      <div className={styles.sideBody}>
                        <span className={styles.sideCategory}>{TYPE_LABEL[item.type]}</span>
                        <h3 className={styles.sideTitle}>{item.title}</h3>
                        {item.subtitle && <p className={styles.sideMeta}>{item.subtitle}</p>}
                        {/* 자세히 보기 (링크가 있을 때만) */}
                        <DetailLink href={item.link} />
                      </div>
                      <button
                        className={isSaved(item.id) ? `${styles.addButton} ${styles.addButtonActive}` : styles.addButton}
                        onClick={() => handleSave(item)}
                        aria-label={isSaved(item.id) ? '저장 해제' : '저장'}
                      >
                        {isSaved(item.id) ? '✓' : '+'}
                      </button>
                    </article>
                  ))}
                </div>
              </div>

              {/* ===== 4위~ 순위 리스트 ===== */}
              <div className={styles.rankList}>
                {rankRows.map((item, index) => (
                  <div key={item.id} className={styles.rankRow}>
                    {/* 4위부터 시작하므로 index+4 */}
                    <span className={styles.rankNum}>{String(index + 4).padStart(2, '0')}</span>
                    <span className={styles.rankThumb} style={thumbStyle(item)} />
                    <div className={styles.rankInfo}>
                      <h3 className={styles.rankTitle}>{item.title}</h3>
                      <p className={styles.rankCategory}>
                        {TYPE_LABEL[item.type]}{item.subtitle ? ` • ${item.subtitle}` : ''}
                      </p>
                    </div>
                    {/* 좁은 줄이라 화살표(↗) 아이콘만 — 링크가 있을 때만 보인다 */}
                    <DetailLink href={item.link} iconOnly />
                    <button
                      className={styles.rankBookmark}
                      onClick={() => handleSave(item)}
                      aria-label={isSaved(item.id) ? '저장 해제' : '저장'}
                    >
                      <BookmarkIcon filled={isSaved(item.id)} />
                    </button>
                  </div>
                ))}
              </div>

              {/* 더 보여줄 항목이 남았을 때만 '순위 더 보기' */}
              {hasMore && (
                <div className={styles.bottom}>
                  <button className={styles.moreButton} onClick={() => setVisibleRows((n) => n + 3)}>
                    순위 더 보기
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default PopularPage
