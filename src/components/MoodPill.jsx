import styles from './MoodPill.module.css'

/*
  MoodPill — 감정을 고르는 알약 모양 버튼 (예: 😊 행복)
  - 홈/분석 페이지에서 여러 번 재사용한다.
  - props
      icon : 앞에 붙는 아이콘(이모지나 SVG). 없어도 됨
      label: 버튼에 보일 글자 (예: "행복")
      variant: 'default'(테두리만) | 'soft'(연보라 배경) — 디자인 변형
      onClick : 클릭 시 실행할 함수 — 선택(안 넘기면 클릭해도 아무 일 없음)
      selected: true면 '선택됨' 상태로 진하게 강조 — 선택(기본 false)
*/
function MoodPill({ icon, label, variant = 'default', onClick, selected = false }) {
  // 기본 클래스 + variant/선택 상태에 따른 추가 클래스를 합친다
  // filter(Boolean): 빈 문자열을 걸러내 클래스 사이에 깔끔하게 공백 하나만 남긴다
  const className = [
    styles.pill,
    variant === 'soft' ? styles.soft : '',
    selected ? styles.selected : '',
  ].filter(Boolean).join(' ')

  return (
    <button className={className} type="button" onClick={onClick} aria-pressed={selected}>
      {/* icon이 넘어왔을 때만 아이콘 자리를 그린다 */}
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{label}</span>
    </button>
  )
}

export default MoodPill
