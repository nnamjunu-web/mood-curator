import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

/*
  LoginPage — 로그인 화면 (경로: /login)
  - 이메일/비밀번호를 입력받아 useAuth().logIn으로 검증한다.
  - 보관함처럼 로그인이 필요한 페이지에서 튕겨온 경우, 로그인 후 원래 가려던 곳으로 돌려보낸다.
*/
function LoginPage() {
  // useAuth(): AuthContext에서 로그인 함수/상태를 꺼내오는 사용자 정의 훅
  const { logIn } = useAuth()

  // useNavigate(): navigate('/경로')로 페이지를 이동시키는 함수를 돌려준다
  const navigate = useNavigate()

  // useLocation(): 현재 주소 정보. ProtectedRoute가 넣어준 state.from(원래 목적지)을 읽는다
  const location = useLocation()
  const from = location.state?.from ?? '/' // 튕겨온 곳이 없으면 홈으로

  // 입력값 상태 — 값이 바뀌면 화면을 다시 그려 입력 내용이 반영된다
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // 에러 메시지 / 제출 중 여부(중복 클릭 방지)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 폼 제출 처리 — async: 내부에서 logIn(비동기)을 await로 기다린다
  async function handleSubmit(event) {
    // 기본 동작(폼 전송으로 인한 새로고침)을 막아 React가 직접 처리하게 한다
    event.preventDefault()
    setError('')

    // 1) 빈 값 검사 — 둘 중 하나라도 비면 중단
    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 모두 입력해 주세요.')
      return
    }

    // 2) 검증 요청 (해시 비교는 비동기라 await 필요)
    setSubmitting(true)
    const result = await logIn({ email: email.trim(), password })
    setSubmitting(false)

    // 3) 흐름 분기: 실패하면 에러 표시, 성공하면 원래 가려던 곳으로 이동
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(from, { replace: true }) // replace: 뒤로가기로 로그인 화면에 다시 오지 않게
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>로그인</h1>
        <p className={styles.subtitle}>감정에 맞는 콘텐츠를 다시 만나보세요</p>

        {/* onSubmit: 폼 안에서 엔터를 치거나 제출 버튼을 누르면 실행 */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>이메일</span>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>비밀번호</span>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              autoComplete="current-password"
            />
          </label>

          {/* 에러가 있을 때만 빨간 안내문을 보여준다(조건부 렌더링) */}
          {error && <p className={styles.error}>{error}</p>}

          {/* 제출 중에는 버튼을 비활성화해 중복 요청을 막는다 */}
          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 아직 계정이 없으면 회원가입으로 안내 */}
        <p className={styles.switch}>
          아직 계정이 없으신가요? <Link to="/signup" className={styles.switchLink}>회원가입</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
