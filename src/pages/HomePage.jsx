import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MoodPill from '../components/MoodPill'
import ContentCard from '../components/ContentCard'
import Spinner from '../components/Spinner'
import TrailerModal from '../components/TrailerModal'
import { BookmarkIcon } from '../components/Icons'
import { getFavorites, toggleFavorite } from '../services/favorites'
import { getRecommendations, isAllFailed } from '../services/recommendations'
import { fetchMovieTrailer } from '../services/tmdb'
import { getMoodLabel } from '../utils/moodMapper'
import styles from './HomePage.module.css'

/*
  HomePage — '추천' 메인 화면 (경로: /)
  - 위쪽: 감정을 골라 '추천 받기'를 누르는 히어로
  - 아래쪽: 추천 받기 전에는 '감정 선택 안내'(빈 상태)를 보여주고,
    '추천 받기'를 누르면 같은 자리에 실제 추천을 채운다(페이지 이동 없음).
  - 오른쪽: '나중에 볼 목록' 사이드바
*/

// 감정 선택 알약 (이모지 + 한국어 라벨 + 시스템 코드)
const MOODS = [
  { icon: '😊', label: '행복', code: 'happy' },
  { icon: '☁️', label: '우울', code: 'sad' },
  { icon: '⚡', label: '활기찬', code: 'energetic' },
  { icon: '🌿', label: '차분함', code: 'calm' },
  { icon: '💡', label: '영감', code: 'inspired' },
]

// 추천 탭(실제 결과) 라벨 → recs 객체의 키
const REC_TABS = ['영화', '음악', '도서']
const TAB_TO_KEY = { 영화: 'movies', 음악: 'music', 도서: 'books' }

// 타입(영문) → 라벨 / 카테고리 아이콘 / 자리표시 그라데이션
const TYPE_LABEL = { movie: '영화', music: '음악', book: '도서' }
const TYPE_ICON = { movie: '🎬', music: '🎵', book: '📖' }
const TYPE_GRADIENT = {
  movie: 'linear-gradient(135deg, #6f8f7a, #cfe0d6)',
  music: 'linear-gradient(135deg, #2a3550, #5a6a8a)',
  book: 'linear-gradient(135deg, #6b5a3a, #c9a87a)',
}

function HomePage() {
  const navigate = useNavigate()

  // 추천 결과 영역으로 스크롤하기 위해 콘텐츠 영역을 가리킨다
  const contentRef = useRef(null)

  const [selectedMood, setSelectedMood] = useState(null) // 선택한 감정 코드
  const [activeTab, setActiveTab] = useState('영화')       // 추천 모드의 현재 탭

  // 추천 상태: recs가 null이면 '빈 상태(안내)', 객체면 '추천' 모드
  const [recs, setRecs] = useState(null)             // { movies, music, books, errors }
  const [recsMood, setRecsMood] = useState(null)     // 결과의 기준이 된 감정
  const [loadingRecs, setLoadingRecs] = useState(false)

  // 즐겨찾기 전체 목록 — 하트 토글 시 갱신되어 카드/사이드바에 함께 반영
  const [favorites, setFavorites] = useState(() => getFavorites())
  const favoriteIds = favorites.map((f) => f.id)
  const savedItems = favorites.slice(0, 3)

  // ── 음악 미리듣기 상태 ──────────────────────────────
  // audioRef: 화면에 다시 그려도 유지돼야 하는 '오디오 재생기'를 담아둔다(useRef는 값이 바뀌어도 리렌더 안 함)
  const audioRef = useRef(null)
  // 지금 재생 중인 카드의 id (없으면 null) — 카드 버튼이 ▶/⏸ 중 무엇을 보일지 결정
  const [playingId, setPlayingId] = useState(null)

  // ── 영화 예고편(모달) 상태 ─────────────────────────
  // status: 'closed' | 'loading' | 'ready' | 'empty'
  const [trailer, setTrailer] = useState({ status: 'closed', videoKey: null, title: '' })

  // useEffect: 컴포넌트가 처음 화면에 나타난 직후 오디오 재생기를 한 번 만들어 둔다
  useEffect(() => {
    // new Audio(): 입력=없음(또는 URL) / 반환=오디오를 재생/정지할 수 있는 객체
    const audio = new Audio()
    audioRef.current = audio
    // 곡이 끝까지 재생되면 '재생 중' 표시를 끈다
    const handleEnded = () => setPlayingId(null)
    audio.addEventListener('ended', handleEnded)
    // 정리: 페이지를 떠날 때(언마운트) 재생을 멈추고 리스너를 제거한다
    return () => {
      audio.pause()
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // 음악 카드의 미리듣기 버튼: 같은 곡이면 정지, 다른 곡이면 이전 곡을 멈추고 새로 재생
  function handleTogglePreview(item) {
    const audio = audioRef.current
    if (!audio) return

    // 이미 이 곡이 재생 중이면 정지
    if (playingId === item.id) {
      audio.pause()
      setPlayingId(null)
      return
    }
    // 미리듣기 URL이 없으면 아무것도 하지 않음(버튼은 비활성이지만 안전장치)
    if (!item.previewUrl) return

    // 다른 곡 재생: src를 바꿔 재생하면 이전 곡은 자동으로 끊긴다(=한 번에 하나만)
    audio.src = item.previewUrl
    audio.play()
    setPlayingId(item.id)
  }

  // 영화 카드의 '예고편 보기' 버튼: 그 순간에만 TMDB에서 예고편을 불러온다(지연 로딩)
  async function handleOpenTrailer(item) {
    // 예고편을 열 때 재생 중인 미리듣기가 있으면 멈춰 소리가 겹치지 않게 한다
    audioRef.current?.pause()
    setPlayingId(null)

    // 먼저 '불러오는 중' 모달을 띄운다
    setTrailer({ status: 'loading', videoKey: null, title: item.title })
    try {
      const videoKey = await fetchMovieTrailer(item.previewId)
      // key가 있으면 'ready', 없으면 'empty'(예고편 없음)
      setTrailer({
        status: videoKey ? 'ready' : 'empty',
        videoKey,
        title: item.title,
      })
    } catch {
      // 호출 실패도 '예고편 없음'으로 부드럽게 처리
      setTrailer({ status: 'empty', videoKey: null, title: item.title })
    }
  }

  // 모달 닫기
  function handleCloseTrailer() {
    setTrailer({ status: 'closed', videoKey: null, title: '' })
  }

  const isRecommendMode = recs !== null

  /*
    loadRecommendations — 주어진 감정으로 추천을 가져와 아래 영역에 채운다.
  */
  async function loadRecommendations(mood) {
    setRecsMood(mood)
    setLoadingRecs(true)
    const result = await getRecommendations(mood) // 공통 서비스 재사용
    setRecs(result)
    setActiveTab('영화')        // 추천 모드의 기본 탭
    setLoadingRecs(false)
    // 결과가 보이도록 콘텐츠 영역으로 부드럽게 스크롤
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // '추천 받기': 선택한 감정으로 인라인 추천 (감정 선택 전엔 버튼 비활성)
  function handleRecommend() {
    if (!selectedMood) return
    loadRecommendations(selectedMood)
  }

  // 즐겨찾기 저장/해제 (이미 공통 형태인 항목을 받는다)
  const handleSaveFavorite = (favItem) => {
    const updated = toggleFavorite(favItem)
    setFavorites(updated)
  }

  const isSaved = (id) => favoriteIds.includes(id)

  // 사이드바 썸네일 스타일
  const thumbStyle = (item) =>
    item.image
      ? { backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { background: TYPE_GRADIENT[item.type] ?? 'linear-gradient(135deg, #b7a9e0, #8fae9e)' }

  // 추천 모드에서 현재 탭의 결과/에러
  const recKey = TAB_TO_KEY[activeTab] ?? 'movies'
  const recList = isRecommendMode ? recs[recKey] : []
  const recTabError = isRecommendMode ? recs.errors[recKey] : null
  const recAllFailed = isRecommendMode && isAllFailed(recs.errors)

  // 콘텐츠 영역 본문을 상황에 맞게 그린다
  function renderContentBody() {
    // 로딩 중
    if (loadingRecs) {
      return <Spinner label="추천을 불러오는 중…" />
    }

    // 아직 추천 전 → 감정 선택 안내(빈 상태)
    if (!isRecommendMode) {
      return (
        <div className={styles.empty}>
          <div className={styles.emptyIcons}>🎬🎵📚</div>
          <h2 className={styles.emptyTitle}>오늘의 감정을 골라보세요</h2>
          <p className={styles.emptyText}>
            {selectedMood
              ? `'${getMoodLabel(selectedMood)}'(으)로 추천 받을 준비가 됐어요. 위의 '추천 받기'를 눌러보세요.`
              : "위에서 기분을 선택하고 '추천 받기'를 누르면 어울리는 영화·음악·책을 모아드려요."}
          </p>
        </div>
      )
    }

    // 추천 모드 + 셋 다 실패 → 영역 전체 에러 + 다시 시도
    if (recAllFailed) {
      return (
        <div className={styles.areaError}>
          <p className={styles.areaErrorText}>⚠️ 추천을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>
          <button className={styles.retryButton} onClick={() => loadRecommendations(recsMood)}>
            다시 시도
          </button>
        </div>
      )
    }

    // 추천 모드 → 현재 탭의 실제 결과 카드
    if (recTabError) {
      return <p className={styles.areaMessage}>{recTabError}</p>
    }
    if (recList.length === 0) {
      return <p className={styles.areaMessage}>이 카테고리의 추천이 없어요.</p>
    }
    return (
      <div className={styles.cardGrid}>
        {recList.map((item) => (
          <ContentCard
            key={item.id}
            image={item.image}
            gradient={TYPE_GRADIENT[item.type]}
            categoryIcon={TYPE_ICON[item.type]}
            category={TYPE_LABEL[item.type] ?? item.type}
            title={item.title}
            subtitle={item.subtitle}
            description={item.description}
            cornerIcon="heart"
            cornerActive={isSaved(item.id)}
            onCornerClick={() => handleSaveFavorite(item)}
            link={item.link} // 외부 상세 페이지 '자세히 보기' 링크
            // 영화일 때만 예고편 버튼, 음악일 때만 미리듣기 버튼을 넘긴다
            //   (도서는 둘 다 넘기지 않으므로 버튼이 안 보인다)
            onPlayTrailer={item.type === 'movie' ? () => handleOpenTrailer(item) : undefined}
            previewUrl={item.type === 'music' ? item.previewUrl : undefined}
            onTogglePreview={item.type === 'music' ? () => handleTogglePreview(item) : undefined}
            isPreviewPlaying={playingId === item.id}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* ===== 히어로: 감정 선택 영역 ===== */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>오늘 당신의 기분은 어떤가요?</h1>

        {/* 감정 알약들 — 클릭하면 선택 상태로 강조 */}
        <div className={styles.moods}>
          {MOODS.map((mood) => (
            <MoodPill
              key={mood.code}
              icon={mood.icon}
              label={mood.label}
              selected={selectedMood === mood.code}
              onClick={() => setSelectedMood(mood.code)}
            />
          ))}
        </div>

        {/* 추천 받기: 감정을 골라야 활성화됨 (이동하지 않고 아래에 결과를 채움) */}
        <div className={styles.heroButtons}>
          <button
            className={selectedMood ? `${styles.ghostButton} ${styles.ghostButtonActive}` : styles.ghostButton}
            onClick={handleRecommend}
            disabled={!selectedMood}
          >
            추천 받기
          </button>
        </div>

        {/* '내 감정 추천'은 얼굴 분석(카메라) 페이지로 이동 */}
        <Link to="/analyze" className={styles.softButton}>
          😊 내 감정 추천
        </Link>
      </section>

      {/* ===== 콘텐츠 영역: 왼쪽 목록 + 오른쪽 사이드바 ===== */}
      <section className={styles.content} ref={contentRef}>
        <div className={styles.main}>
          {/* 추천 모드면 '<감정>' 추천 제목 표시 */}
          {(loadingRecs || isRecommendMode) && (
            <h2 className={styles.recTitle}>'{getMoodLabel(recsMood)}' 추천</h2>
          )}

          {/* 탭은 추천 모드에서만 노출 (빈 상태에선 숨김) */}
          {isRecommendMode && !loadingRecs && (
            <div className={styles.tabs}>
              {REC_TABS.map((tab) => (
                <button
                  key={tab}
                  className={tab === activeTab ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {renderContentBody()}
        </div>

        {/* 오른쪽: 나중에 볼 목록 (실제 즐겨찾기) */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHead}>
            <h3>나중에 볼 목록</h3>
            <BookmarkIcon />
          </div>

          {savedItems.length === 0 ? (
            <p className={styles.savedEmpty}>아직 저장한 항목이 없어요.</p>
          ) : (
            <ul className={styles.savedList}>
              {savedItems.map((item) => (
                <li key={item.id} className={styles.savedItem}>
                  <span className={styles.savedThumb} style={thumbStyle(item)} />
                  <span>
                    <span className={styles.savedType}>{TYPE_LABEL[item.type] ?? item.type}</span>
                    <span className={styles.savedTitle}>{item.title}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <button className={styles.sidebarButton} onClick={() => navigate('/library')}>
            전체 보관함 보기
          </button>
        </aside>
      </section>

      {/* 예고편 모달 — 닫힘 상태가 아닐 때만 화면에 띄운다 */}
      {trailer.status !== 'closed' && (
        <TrailerModal
          status={trailer.status}
          videoKey={trailer.videoKey}
          title={trailer.title}
          onClose={handleCloseTrailer}
        />
      )}
    </div>
  )
}

export default HomePage
