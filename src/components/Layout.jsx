import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import styles from './Layout.module.css'

/*
  Layout — 모든 페이지가 공유하는 뼈대(상단바 + 본문 + 푸터)
  - 페이지마다 Header/Footer를 반복해서 쓰지 않으려고 한 곳에 모았다.
*/
function Layout() {
  return (
    <div className={styles.layout}>
      <Header />

      {/* Outlet: react-router에서 "현재 URL에 맞는 페이지"가 끼워지는 자리.
                  예) /popular 이면 여기에 PopularPage가 그려진다.
            입력: 없음
            반환: 현재 경로에 해당하는 자식 라우트 컴포넌트 */}
      <main className={styles.main}>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default Layout
