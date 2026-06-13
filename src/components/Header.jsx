import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Header.module.css'

/*
  Header — 모든 페이지 위쪽에 고정으로 보이는 상단 내비게이션 바
  - 로고 + 메뉴(추천/인기/내 보관함) + 로그인 영역으로 구성된다.
  - 오른쪽 끝은 로그인 상태에 따라 달라진다: 비로그인 → 로그인/회원가입 링크,
    로그인 → 닉네임 + 로그아웃 버튼.
*/
function Header() {
  // useNavigate(): navigate('/경로')로 페이지를 이동시키는 함수 (로그아웃 후 홈으로 보낼 때 사용)
  const navigate = useNavigate()

  // useAuth(): 로그인 상태(user)와 로그아웃 함수를 AuthContext에서 꺼내온다
  const { user, logOut } = useAuth()

  // 로그아웃 버튼 클릭 → 세션 제거 후 홈으로 이동
  const handleLogout = () => {
    logOut()
    navigate('/')
  }

  // 현재 메뉴가 활성 상태인지에 따라 다른 CSS 클래스를 돌려주는 함수
  const navClass = ({ isActive }) =>
    isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* 왼쪽: 로고 (클릭하면 홈으로) */}
        <NavLink to="/" className={styles.logo}>
          MoodCurator
        </NavLink>

        {/* 가운데: 메뉴 */}
        <nav className={styles.nav}>
          <NavLink to="/" className={navClass} end>추천</NavLink>
          <NavLink to="/popular" className={navClass}>인기</NavLink>
          <NavLink to="/library" className={navClass}>내 보관함</NavLink>
        </nav>

        {/* 오른쪽: 로그인 상태에 따른 영역 */}
        <div className={styles.actions}>
          {/* 로그인 상태에 따라 다르게 그린다(조건부 렌더링) */}
          {user ? (
            // 로그인 상태: 닉네임 + 로그아웃 버튼
            <div className={styles.userBox}>
              <span className={styles.nickname}>{user.nickname}님</span>
              <button className={styles.logoutButton} onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          ) : (
            // 비로그인 상태: 로그인 / 회원가입 링크
            <div className={styles.authLinks}>
              <NavLink to="/login" className={styles.loginLink}>로그인</NavLink>
              <NavLink to="/signup" className={styles.signupLink}>회원가입</NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
