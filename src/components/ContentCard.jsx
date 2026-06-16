import MatchBadge from './MatchBadge'
import TagChip from './TagChip'
import ToggleButton from './ToggleButton'
import DetailLink from './DetailLink'
import styles from './ContentCard.module.css'

/*
  ContentCard — 콘텐츠 한 개를 보여주는 카드 (홈/보관함에서 재사용)
  - 위: 이미지 + 일치도 배지 + 우상단 토글 / 아래: 카테고리·제목·부제·설명·태그
  - 영화면 onPlayTrailer(예고편), 음악이면 onTogglePreview/previewUrl(미리듣기), link면 '자세히 보기'를 표시
*/
function ContentCard({
  gradient,
  image,
  matchRate,
  cornerIcon = null,
  cornerActive = false,
  category,
  categoryIcon,
  title,
  subtitle,
  description,
  tags = [],
  onCornerClick,
  onClick,
  onPlayTrailer,
  previewUrl,
  onTogglePreview,
  isPreviewPlaying = false,
  link,
}) {
  // 우상단 버튼을 눌렀을 때: 카드 본문 클릭(onClick)까지 같이 실행되지 않도록 전파를 막는다
  const handleCornerClick = (event) => {
    event.stopPropagation()
    onCornerClick?.()
  }

  // onClick이 있을 때만 클릭 가능한 모양(커서 손모양)으로 보이게 클래스를 추가
  const cardClass = onClick ? `${styles.card} ${styles.clickable}` : styles.card

  // 실제 이미지가 있으면 사진으로, 없으면 그라데이션으로 채운다
  const thumbStyle = image
    ? { backgroundImage: `url(${image})` }
    : { background: gradient }

  // 음악 미리듣기 버튼 글자 (URL 없음 / 재생 중 / 대기)
  let previewLabel = '미리듣기 없음'
  if (previewUrl) {
    previewLabel = isPreviewPlaying ? '⏸ 정지' : '▶ 미리듣기'
  }

  return (
    <article className={cardClass} onClick={onClick}>
      {/* 이미지 영역 — 사진(image) 우선, 없으면 그라데이션 자리표시 */}
      <div className={styles.thumb} style={thumbStyle}>
        {/* 일치도 배지 (matchRate가 있을 때만) */}
        {matchRate != null && (
          <div className={styles.matchSlot}>
            <MatchBadge value={matchRate} />
          </div>
        )}

        {/* 우상단 토글 버튼 (하트 또는 휴지통) */}
        {cornerIcon && (
          <div className={styles.cornerSlot}>
            <ToggleButton
              icon={cornerIcon}
              variant="overlay"
              active={cornerActive}
              onClick={handleCornerClick}
              label={cornerIcon === 'trash' ? '삭제' : '좋아요'}
            />
          </div>
        )}

        {/* 미리보기 버튼 자리(이미지 하단 가운데). 영화/음악 중 해당 props가 있을 때만 보인다 */}
        {(onPlayTrailer || onTogglePreview) && (
          <div className={styles.previewSlot}>
            {/* 영화: 예고편 보기 → 부모가 모달을 띄운다 */}
            {onPlayTrailer && (
              <button
                type="button"
                className={styles.previewButton}
                onClick={(event) => {
                  event.stopPropagation() // 카드 본문 onClick으로 번지지 않게
                  onPlayTrailer()
                }}
              >
                ▶ 예고편
              </button>
            )}

            {/* 음악: 미리듣기 토글 (URL이 없으면 비활성화) */}
            {onTogglePreview && (
              <button
                type="button"
                className={styles.previewButton}
                disabled={!previewUrl}
                onClick={(event) => {
                  event.stopPropagation()
                  onTogglePreview()
                }}
              >
                {previewLabel}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 본문 영역 */}
      <div className={styles.body}>
        <p className={styles.category}>
          {categoryIcon && <span className={styles.catIcon}>{categoryIcon}</span>}
          {category}
        </p>
        <h3 className={styles.title}>{title}</h3>

        {/* 부제(아티스트 등)는 있을 때만 */}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

        {/* 설명은 있을 때만 */}
        {description && <p className={styles.desc}>{description}</p>}

        {/* 태그들은 있을 때만 (TagChip을 하나씩 그린다) */}
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
          </div>
        )}

        {/* 자세히 보기 링크는 link가 있을 때만 (공통 DetailLink 사용) */}
        {link && (
          <div className={styles.detailRow}>
            <DetailLink href={link} />
          </div>
        )}
      </div>
    </article>
  )
}

export default ContentCard
