import styles from './TagChip.module.css'

/*
  TagChip — 무드 태그칩 (회색 알약)
  - 시안의 '우울한', '인디' 같은 분위기 태그를 표시한다.
  - props
      label: 태그 글자 (예: "인디")
*/
function TagChip({ label }) {
  return <span className={styles.chip}>{label}</span>
}

export default TagChip
