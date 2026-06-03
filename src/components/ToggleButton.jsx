import { BookmarkIcon, HeartIcon, TrashIcon } from './Icons'
import styles from './ToggleButton.module.css'

/*
  ToggleButton — 북마크/하트(좋아요) 토글 버튼 (삭제 버튼으로도 재사용)
  - active(켜짐)일 때 아이콘이 채워지고 색이 강조된다.
  - props
      icon   : 'bookmark' | 'heart' | 'trash'  (보여줄 아이콘)
      active : true면 채워진/강조 상태 (기본 false)
      onClick: 클릭 시 실행할 함수
      variant: 'overlay'(이미지 위 흰 동그라미) | 'inline'(테두리 있는 동그라미)
      label  : 접근성용 설명 (aria-label)
*/

// 아이콘 이름 → 실제 아이콘 컴포넌트
const ICONS = { bookmark: BookmarkIcon, heart: HeartIcon, trash: TrashIcon }

function ToggleButton({ icon = 'bookmark', active = false, onClick, variant = 'inline', label }) {
  const Icon = ICONS[icon] ?? BookmarkIcon

  // 상태에 따라 클래스를 조합 (빈 문자열은 걸러낸다)
  const className = [
    styles.btn,
    styles[variant],            // overlay / inline
    active ? styles.active : '',
    icon === 'heart' ? styles.heart : '',  // 하트 활성 색을 따로 주기 위함
    icon === 'trash' ? styles.danger : '',
  ].filter(Boolean).join(' ')

  return (
    <button type="button" className={className} onClick={onClick} aria-pressed={active} aria-label={label}>
      {/* 토글류(bookmark/heart)는 active면 채워서 보여준다.
          휴지통은 채움 개념이 없으므로 filled를 넘기지 않는다(undefined). */}
      <Icon filled={icon === 'trash' ? undefined : active} />
    </button>
  )
}

export default ToggleButton
