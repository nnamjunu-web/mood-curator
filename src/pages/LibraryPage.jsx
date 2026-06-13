import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFavorites, removeFavorite } from '../services/favorites'
import ContentCard from '../components/ContentCard'
import styles from './LibraryPage.module.css'

/*
  LibraryPage — '내 보관함' 화면 (경로: /library)
  - localStorage에 저장한 즐겨찾기를 카드로 보여준다.
  - 분류 필터 + 삭제를 지원한다. (목록은 최신 저장이 앞으로 오는 저장 순서 그대로)
*/

// 분류 필터 — 라벨과 실제 item.type 값
const FILTERS = [
  { label: '전체', value: 'all' },
  { label: '영화', value: 'movie' },
  { label: '음악', value: 'music' },
  { label: '도서', value: 'book' },
]

// 타입(영문) → 한국어 라벨 / 카테고리 아이콘 / 자리표시 그라데이션
const TYPE_LABEL = { movie: '영화', music: '음악', book: '도서' }
const TYPE_ICON = { movie: '🎬', music: '🎵', book: '📖' }
const TYPE_GRADIENT = {
  movie: 'linear-gradient(160deg, #2f4538, #6f8f7a)',
  music: 'linear-gradient(160deg, #2a1040, #b14de0)',
  book: 'linear-gradient(160deg, #6b5a3a, #c9a87a)',
}

function LibraryPage() {
  // useNavigate(): navigate('/경로')로 페이지를 이동시키는 함수
  const navigate = useNavigate()

  // 즐겨찾기 목록 — 처음 한 번 localStorage에서 읽어 초기값으로 둔다
  const [favorites, setFavorites] = useState(() => getFavorites())

  // 현재 선택된 분류 필터
  const [filter, setFilter] = useState('all')

  // 휴지통 클릭 → 즐겨찾기에서 삭제 후 화면 갱신
  function handleRemove(item) {
    const updated = removeFavorite(item.id)
    setFavorites(updated)
  }

  // 분류 필터만 적용해 화면에 보일 목록을 만든다 (저장된 순서 = 최근 저장이 앞)
  const visible = filter === 'all' ? favorites : favorites.filter((f) => f.type === filter)

  return (
    <div className={styles.page}>
      {/* 제목 영역 */}
      <h1 className={styles.title}>내 보관함</h1>
      <p className={styles.subtitle}>당신의 감정이 담긴 안식처</p>

      {/* 즐겨찾기가 하나도 없을 때 */}
      {favorites.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>아직 저장한 항목이 없어요.<br />감정을 분석하고 마음에 드는 콘텐츠를 저장해 보세요.</p>
          <button className={styles.emptyButton} onClick={() => navigate('/analyze')}>
            감정 분석하러 가기
          </button>
        </div>
      ) : (
        <>
          {/* 분류 필터 줄 */}
          <div className={styles.toolbar}>
            <div className={styles.filters}>
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  className={filter === item.value ? `${styles.filter} ${styles.filterActive}` : styles.filter}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 카드 그리드 */}
          <div className={styles.grid}>
            {/* 필터/검색 결과가 비었을 때 */}
            {visible.length === 0 && (
              <p className={styles.filteredEmpty}>조건에 맞는 항목이 없어요.</p>
            )}

            {visible.map((item) => (
              <ContentCard
                key={item.id}
                image={item.image}
                gradient={TYPE_GRADIENT[item.type] ?? 'linear-gradient(160deg, #6b6fb0, #b7a9e0)'}
                matchRate={item.matchRate}
                categoryIcon={TYPE_ICON[item.type]}
                category={TYPE_LABEL[item.type] ?? item.type}
                title={item.title}
                subtitle={item.subtitle}
                tags={item.tags ?? []}
                cornerIcon="trash"
                onCornerClick={() => handleRemove(item)}
                link={item.link} // 외부 상세 페이지 '자세히 보기' 링크
              />
            ))}

            {/* 점선 '추가' 카드 → 홈으로 이동 */}
            <button className={styles.addCard} onClick={() => navigate('/')}>
              <span className={styles.plus}>+</span>
              <span>더 많은 감정 찾기</span>
            </button>
          </div>
        </>
      )}

      {/* 하단 버튼 → 추천 홈으로 이동 */}
      <div className={styles.bottom}>
        <button className={styles.exploreButton} onClick={() => navigate('/')}>
          더 많은 큐레이션 탐색하기
        </button>
      </div>
    </div>
  )
}

export default LibraryPage
