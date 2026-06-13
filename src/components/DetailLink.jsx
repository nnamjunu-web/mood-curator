import styles from './DetailLink.module.css'

/*
  DetailLink — '자세히 보기 ↗' 외부 링크 (여러 카드/영역에서 똑같이 재사용)
  - 원래 RecommendationCard에만 있던 링크를, 홈·보관함·인기 차트 등 어디서나
    같은 모양·동작으로 쓰도록 작은 컴포넌트로 분리했다.
  - props
      href     : 이동할 외부 URL (없으면 아무것도 그리지 않음)
      iconOnly : true면 좁은 자리(인기 4위~ 리스트)용으로 '↗' 아이콘만 보여준다 — 선택
*/
function DetailLink({ href, iconOnly = false }) {
  // 흐름 분기: 링크가 없으면(null) 렌더링하지 않는다
  if (!href) return null

  // 카드 본문 클릭 등 부모의 클릭 이벤트로 번지지 않게 전파를 막는다
  const handleClick = (event) => event.stopPropagation()

  return (
    // target="_blank": 새 탭에서 열기 / rel="noreferrer": 원본 주소를 넘기지 않는 보안 설정
    <a
      className={iconOnly ? `${styles.link} ${styles.iconOnly}` : styles.link}
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      aria-label="자세히 보기"
      title="자세히 보기"
    >
      {/* 좁은 자리면 화살표만, 아니면 글자까지 */}
      {iconOnly ? '↗' : '자세히 보기 ↗'}
    </a>
  )
}

export default DetailLink
