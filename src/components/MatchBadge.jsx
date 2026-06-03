import styles from './MatchBadge.module.css'

/*
  MatchBadge — 일치도 배지 (보라 알약 + 작은 이퀄라이저 막대 + 퍼센트)
  - 시안의 "98% ▮▮▮" 모양. 카드 위에 얹어 추천 정확도를 보여준다.
  - props
      value: 일치도 숫자 (예: 98) → "98%"로 표시
*/
function MatchBadge({ value }) {
  return (
    <span className={styles.badge}>
      <span className={styles.percent}>{value}%</span>
      {/* 이퀄라이저처럼 높낮이가 다른 막대 3개 (장식용) */}
      <span className={styles.bars} aria-hidden="true">
        <span className={`${styles.bar} ${styles.bar1}`} />
        <span className={`${styles.bar} ${styles.bar2}`} />
        <span className={`${styles.bar} ${styles.bar3}`} />
      </span>
    </span>
  )
}

export default MatchBadge
