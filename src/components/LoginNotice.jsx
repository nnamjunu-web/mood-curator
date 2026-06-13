import styles from './LoginNotice.module.css'

/*
  LoginNotice — 비로그인 사용자가 '찜하기'처럼 로그인이 필요한 동작을 시도했을 때 보여주는 안내 줄.
  - 홈·결과·인기 페이지가 똑같은 모양으로 쓰도록 작은 컴포넌트로 분리했다.
  - props
      show : 안내를 보일지 여부. false면 아무것도 그리지 않는다(null 반환).
*/
function LoginNotice({ show }) {
  // 보일 필요가 없으면 렌더링하지 않는다
  if (!show) return null

  // role="status": 스크린리더가 "새로 뜬 안내"임을 읽어주도록 하는 접근성 속성
  return (
    <p className={styles.notice} role="status">
      🔒 찜하려면 로그인이 필요해요.
    </p>
  )
}

export default LoginNotice
