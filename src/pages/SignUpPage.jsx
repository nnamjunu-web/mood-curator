import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './SignUpPage.module.css'

/*
  SignUpPage — 회원가입 화면 (경로: /signup)
  - 닉네임/이메일/비밀번호/비밀번호 확인을 입력받아 유효성을 검사한 뒤 useAuth().signUp을 호출한다.
  - 가입에 성공하면 services/auth가 자동으로 로그인 상태로 만들어 주므로, 바로 홈으로 보낸다.
*/

// 비밀번호 최소 길이 — 한 곳에서 관리하려고 상수로 뺐다
const MIN_PASSWORD_LENGTH = 6

// 이메일 형식 검사용 정규식(아주 단순한 형태: 공백 없는 a@b.c 모양인지만 본다)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function SignUpPage() {
  // AuthContext에서 회원가입 함수를 꺼내온다
  const { signUp } = useAuth()

  // navigate('/경로')로 페이지 이동
  const navigate = useNavigate()

  // 입력값 상태들
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('') // 비밀번호 확인

  // 에러 메시지 / 제출 중 여부
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 폼 제출 처리
  async function handleSubmit(event) {
    event.preventDefault() // 새로고침 방지
    setError('')

    // 1) 빈 값 검사 — 하나라도 비면 중단
    if (!nickname.trim() || !email.trim() || !password || !passwordConfirm) {
      setError('모든 항목을 입력해 주세요.')
      return
    }
    // 2) 이메일 형식 검사 — test()는 정규식과 맞으면 true를 돌려준다
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('이메일 형식이 올바르지 않습니다.')
      return
    }
    // 3) 비밀번호 길이 검사
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`)
      return
    }
    // 4) 비밀번호 확인 일치 검사
    if (password !== passwordConfirm) {
      setError('비밀번호가 서로 일치하지 않습니다.')
      return
    }

    // 5) 가입 요청 (해시·중복검사는 비동기라 await)
    setSubmitting(true)
    const result = await signUp({
      email: email.trim(),
      password,
      nickname: nickname.trim(),
    })
    setSubmitting(false)

    // 6) 흐름 분기: 실패(예: 이메일 중복) 시 에러 표시, 성공 시 홈으로 이동
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>회원가입</h1>
        <p className={styles.subtitle}>나만의 감정 보관함을 시작해 보세요</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>닉네임</span>
            <input
              type="text"
              className={styles.input}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="화면에 표시될 이름"
              autoComplete="nickname"
            />
          </label>

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
              placeholder={`${MIN_PASSWORD_LENGTH}자 이상`}
              autoComplete="new-password"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>비밀번호 확인</span>
            <input
              type="password"
              className={styles.input}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호를 한 번 더 입력"
              autoComplete="new-password"
            />
          </label>

          {/* 에러가 있을 때만 표시 */}
          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? '가입 중...' : '회원가입'}
          </button>
        </form>

        {/* 이미 계정이 있으면 로그인으로 안내 */}
        <p className={styles.switch}>
          이미 계정이 있으신가요? <Link to="/login" className={styles.switchLink}>로그인</Link>
        </p>
      </div>
    </div>
  )
}

export default SignUpPage
