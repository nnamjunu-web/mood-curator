import ToggleButton from './ToggleButton'
import styles from './RecommendationCard.module.css'

/*
  RecommendationCard — 추천 항목(영화/음악/책) 한 개를 보여주는 카드
  - cardAdapter가 만든 "공통 카드 형태" 객체를 그대로 받아서 그린다.
  - 즐겨찾기(북마크) 버튼을 누르면 부모가 넘겨준 onToggleSave가 실행된다.
  - props
      item        : 공통 카드 객체 { id, type, title, subtitle, description, image, link }
      isSaved     : 이 항목이 즐겨찾기에 저장돼 있는지(true면 북마크가 채워짐)
      onToggleSave: 북마크 클릭 시 실행할 함수 (item을 인자로 받음)
*/

// 타입(영문) → 화면에 보일 한국어 배지 라벨
const TYPE_LABEL = { movie: '영화', music: '음악', book: '도서' }

// 이미지가 없을 때 쓸 타입별 그라데이션 (자리표시용)
const TYPE_GRADIENT = {
  movie: 'linear-gradient(160deg, #2f4538, #6f8f7a)',
  music: 'linear-gradient(160deg, #2a1040, #b14de0)',
  book: 'linear-gradient(160deg, #6b5a3a, #c9a87a)',
}

function RecommendationCard({ item, isSaved, onToggleSave }) {
  const { type, title, subtitle, description, image, link } = item

  // 이미지가 있으면 배경 이미지로, 없으면 타입별 그라데이션으로 채운다
  const thumbStyle = image
    ? { backgroundImage: `url(${image})` }
    : { background: TYPE_GRADIENT[type] }

  return (
    <article className={styles.card}>
      {/* 포스터/표지 영역 + 타입 배지 */}
      <div className={styles.thumb} style={thumbStyle}>
        <span className={styles.badge}>{TYPE_LABEL[type]}</span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        {/* 부제는 있을 때만 */}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {/* 설명은 있을 때만 */}
        {description && <p className={styles.desc}>{description}</p>}

        {/* 하단: 자세히 보기 링크 + 즐겨찾기 버튼 */}
        <div className={styles.bottomRow}>
          {link ? (
            // target="_blank": 새 탭에서 열기 / rel="noreferrer": 보안상 권장 설정
            <a className={styles.link} href={link} target="_blank" rel="noreferrer">
              자세히 보기 ↗
            </a>
          ) : (
            <span /> /* 링크가 없을 때 자리만 차지해 버튼을 오른쪽으로 밀어줌 */
          )}

          <ToggleButton
            icon="bookmark"
            variant="inline"
            active={isSaved}
            onClick={() => onToggleSave(item)}
            label={isSaved ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          />
        </div>
      </div>
    </article>
  )
}

export default RecommendationCard
