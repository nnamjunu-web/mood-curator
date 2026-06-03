import styles from './Footer.module.css'

/*
  Footer — 모든 페이지 맨 아래에 보이는 푸터
  - 로고/저작권 문구 + 정책 링크들로 구성된다.
*/
function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* 왼쪽: 로고와 저작권 */}
        <div>
          <p className={styles.logo}>MoodCurator</p>
          <p className={styles.copy}>
            © 2026 MoodCurator. 감성 큐레이션을 위한 당신의 디지털 안식처.
          </p>
        </div>

        {/* 오른쪽: 정책/문의 링크 */}
        <nav className={styles.links}>
          <a href="#">이용약관</a>
          <a href="#">개인정보처리방침</a>
          <a href="#">고객센터</a>
          <a href="#">문의하기</a>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
