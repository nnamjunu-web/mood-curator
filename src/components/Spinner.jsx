import styles from './Spinner.module.css'

/*
  Spinner — 데이터를 불러오는 동안 보여주는 빙글빙글 도는 로딩 표시
  - props
      label: 스피너 아래 보여줄 안내 문구 (선택)
*/
function Spinner({ label }) {
  return (
    <div className={styles.wrap}>
      {/* 실제 회전 애니메이션은 CSS(@keyframes)에서 처리한다 */}
      <span className={styles.spinner} />
      {label && <p className={styles.label}>{label}</p>}
    </div>
  )
}

export default Spinner
