import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import styles from './Layout.module.css'

// Layout — 모든 페이지가 공유하는 틀(상단바 + 본문 + 푸터)
function Layout() {
  return (
    <div className={styles.layout}>
      <Header />

      {/* Outlet: 현재 URL에 맞는 페이지가 끼워지는 자리 */}
      <main className={styles.main}>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default Layout
