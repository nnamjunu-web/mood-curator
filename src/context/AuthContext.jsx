import { createContext, useContext, useState } from 'react'
import {
  getCurrentUser,
  signUp as authSignUp,
  logIn as authLogIn,
  logOut as authLogOut,
} from '../services/auth'

/*
  AuthContext — 로그인 상태(user)를 앱 전체에서 공유한다.
  - 실제 저장/검증은 services/auth.js가 하고, 여기서는 그 결과를 화면 상태에 반영한다.
*/

const AuthContext = createContext(null)

// 로그인 상태와 인증 함수를 자식들에게 공급하는 컴포넌트
export function AuthProvider({ children }) {
  // 초기값을 함수로 줘 처음 한 번만 세션을 복원한다 (새로고침 유지)
  const [user, setUser] = useState(() => getCurrentUser())

  // 회원가입 후 성공하면 user 상태도 갱신 → 헤더 등이 자동으로 다시 그려짐
  async function signUp(form) {
    const result = await authSignUp(form)
    if (result.ok) setUser(result.user)
    return result
  }

  async function logIn(form) {
    const result = await authLogIn(form)
    if (result.ok) setUser(result.user)
    return result
  }

  function logOut() {
    authLogOut()
    setUser(null)
  }

  const value = { user, signUp, logIn, logOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 어디서든 로그인 상태/함수를 꺼내 쓰는 훅 (Provider 밖이면 에러)
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.')
  }
  return context
}
