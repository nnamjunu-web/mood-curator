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
  const { logIn } = useAuth()
  const navigate = useNavigate()

  // ProtectedRoute가 넣어준 원래 목적지(없으면 홈)
  const location = useLocation()
  const from = location.state?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false) // 중복 제출 방지

  async function handleSubmit(event) {
    event.preventDefault() // 폼 전송에 의한 새로고침 방지
    setError('')

    // 빈 값 검사
    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 모두 입력해 주세요.')
      return
    }

    setSubmitting(true)
    const result = await logIn({ email: email.trim(), password })
    setSubmitting(false)

    // 실패면 에러, 성공이면 원래 가려던 곳으로 이동
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>로그인</h1>
        <p className={styles.subtitle}>감정에 맞는 콘텐츠를 다시 만나보세요</p>

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

          {error && <p className={styles.error}>{error}</p>}

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
