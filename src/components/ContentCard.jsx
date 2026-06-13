import MatchBadge from './MatchBadge'
import TagChip from './TagChip'
import ToggleButton from './ToggleButton'
import DetailLink from './DetailLink'
import styles from './ContentCard.module.css'

/*
  ContentCard — 콘텐츠 한 개를 보여주는 카드 (홈/보관함에서 재사용)
  - 위쪽: 이미지(자리표시 그라데이션) + 일치도 배지(MatchBadge) + 우상단 토글(ToggleButton)
  - 아래쪽: 카테고리 / 제목 / 부제 / 설명 / 태그(TagChip)
  - 공통 프리미티브(MatchBadge·TagChip·ToggleButton)를 조립해 만든 카드다.
  - props
      gradient   : 이미지 자리에 채울 CSS 그라데이션 문자열
      matchRate  : 일치도 숫자(예: 98). 있으면 MatchBadge로 표시
      cornerIcon : 'heart' | 'trash' | null  (우상단 버튼 종류)
      cornerActive : 우상단 버튼이 켜진 상태인지 (하트 채움 등) — 선택
      category   : 분류 텍스트 (예: "드라마 • 힐링", "음악")
      categoryIcon : 분류 앞 작은 아이콘 (선택)
      title      : 제목
      subtitle   : 부제 (예: 아티스트명, 감독명) — 선택
      description: 설명 문구 — 선택
      tags       : 태그 문자열 배열 — 선택
      onCornerClick : 우상단 버튼 클릭 시 실행할 함수 — 선택
      onClick    : 카드 본문 클릭 시 실행할 함수 — 선택
      onPlayTrailer  : (영화) '예고편 보기' 클릭 시 실행할 함수 — 선택. 주면 예고편 버튼이 보인다
      previewUrl     : (음악) 30초 미리듣기 URL — 선택. null이면 버튼이 비활성화된다
      onTogglePreview: (음악) 미리듣기 재생/정지 토글 함수 — 선택. 주면 미리듣기 버튼이 보인다
      isPreviewPlaying: (음악) 지금 이 카드가 재생 중인지 — 버튼 라벨(▶/⏸)에 사용
      link       : 외부 상세 페이지 URL — 선택. 있으면 본문 하단에 '자세히 보기' 링크를 보여준다
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

  // 음악 미리듣기 버튼에 보일 글자 (URL 없음 / 재생 중 / 대기)
  //   - 중첩 삼항연산자 대신 if로 풀어 읽기 쉽게 했다(동작은 동일).
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
