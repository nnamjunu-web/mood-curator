import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Header.module.css'

/*
  Header — 상단 내비게이션 바 (로고 + 메뉴 + 로그인 영역)
  - 오른쪽은 로그인 상태에 따라 '로그인/회원가입' 또는 '닉네임 + 로그아웃'으로 바뀐다.
*/
function Header() {
  const navigate = useNavigate()
  const { user, logOut } = useAuth()

  // 로그아웃 후 홈으로 이동
  const handleLogout = () => {
    logOut()
    navigate('/')
  }

  // 활성 메뉴에 강조 클래스를 붙인다
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
