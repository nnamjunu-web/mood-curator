import { NavLink, useLocation, useSearchParams } from 'react-router-dom'
import { BellIcon, SearchIcon } from './Icons'
import styles from './Header.module.css'

/*
  Header — 모든 페이지 위쪽에 고정으로 보이는 상단 내비게이션 바
  - 로고 + 메뉴(추천/인기/내 보관함) + (보관함에서만) 검색창 + 알림/프로필로 구성된다.
  - 검색어는 URL의 ?q= 에 저장한다. 이렇게 하면 보관함 페이지가 같은 URL을 읽어
    별도의 전역 상태 없이도 검색 결과를 필터링할 수 있다.
*/
function Header() {
  // useLocation(): 현재 주소 정보를 돌려준다 (pathname으로 어떤 페이지인지 확인)
  const location = useLocation()

  // useSearchParams(): URL의 쿼리(?q=..)를 읽고 쓰는 react-router 훅
  const [searchParams, setSearchParams] = useSearchParams()

  // 검색창은 '내 보관함'(/library)에서만 보여준다
  const showSearch = location.pathname === '/library'
  const query = searchParams.get('q') ?? ''

  // 입력할 때마다 URL의 q 값을 갱신 (replace: true → 뒤로가기 기록이 쌓이지 않게)
  const handleSearch = (event) => {
    const value = event.target.value
    const next = new URLSearchParams(searchParams)
    if (value) next.set('q', value)
    else next.delete('q')
    setSearchParams(next, { replace: true })
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

        {/* 오른쪽: (보관함에서만) 검색창 + 알림 종 + 프로필 동그라미 */}
        <div className={styles.actions}>
          {showSearch && (
            <div className={styles.search}>
              <SearchIcon />
              <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="감정 검색..."
                aria-label="감정 태그 검색"
              />
            </div>
          )}
          <button className={styles.iconButton} aria-label="알림">
            <BellIcon />
          </button>
          <div className={styles.avatar} aria-label="프로필" />
        </div>
      </div>
    </header>
  )
}

export default Header
