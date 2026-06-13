import { createContext, useContext, useState } from 'react'
import {
  getCurrentUser,
  signUp as authSignUp,
  logIn as authLogIn,
  logOut as authLogOut,
} from '../services/auth'

/*
  AuthContext — 로그인 상태(현재 사용자)를 앱 전체에서 공유하기 위한 "전역 보관소"
  - 헤더, 보관함 가드, 로그인/회원가입 페이지가 모두 같은 로그인 상태를 봐야 한다.
    이걸 props로 일일이 내려주면 번거로우니, Context로 어디서든 꺼내 쓰게 한다.
  - 실제 저장/검증 로직은 services/auth.js가 하고, 여기서는 그 결과를 화면 상태(state)에
    반영해 "값이 바뀌면 화면이 자동으로 다시 그려지게" 하는 역할만 맡는다.

  ● Context 란?
    - 멀리 떨어진 컴포넌트끼리 값을 공유하는 React 기능.
    - createContext로 "통로"를 만들고, <Provider value={...}>로 값을 흘려보내면,
      그 안쪽 어떤 컴포넌트든 useContext로 값을 꺼내 쓸 수 있다.
*/

// createContext(기본값)
//   입력: Provider 없이 쓰일 때의 기본값(여기선 null)
//   반환: { Provider } 를 가진 Context 객체
const AuthContext = createContext(null)

/*
  AuthProvider — 로그인 상태와 그걸 바꾸는 함수들을 자식들에게 공급하는 컴포넌트
    입력: children(이 Provider로 감쌀 하위 컴포넌트들)
    반환: Context 값을 흘려보내는 Provider 엘리먼트
*/
export function AuthProvider({ children }) {
  // useState: 컴포넌트 안에서 값이 바뀌면 화면을 자동으로 다시 그려주는 저장소
  //   초기값을 함수로 주면(=lazy init) 처음 한 번만 실행된다 → 새로고침 시 세션을 복원
  const [user, setUser] = useState(() => getCurrentUser())

  // 회원가입: services/auth의 signUp을 호출하고, 성공하면 화면 상태(user)도 갱신
  async function signUp(form) {
    const result = await authSignUp(form)
    if (result.ok) setUser(result.user) // 성공 시 로그인 상태로 전환 → 헤더 등 자동 갱신
    return result // { ok, error? } 를 그대로 화면에 돌려줘 에러 메시지 처리에 쓰게 한다
  }

  // 로그인: 성공하면 user 상태를 갱신
  async function logIn(form) {
    const result = await authLogIn(form)
    if (result.ok) setUser(result.user)
    return result
  }

  // 로그아웃: 세션을 지우고 user를 null로 → 화면이 비로그인 상태로 다시 그려짐
  function logOut() {
    authLogOut()
    setUser(null)
  }

  // 자식들에게 공급할 값 묶음
  const value = { user, signUp, logIn, logOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/*
  useAuth — 어떤 컴포넌트에서든 로그인 상태/함수를 꺼내 쓰는 사용자 정의 훅
    입력: 없음
    반환: { user, signUp, logIn, logOut }
*/
// 아래 규칙은 "한 파일이 컴포넌트만 export할 때 Fast Refresh가 잘 된다"고 권하지만,
// Provider와 useAuth를 한 곳에 두는 편이 읽기 쉬워 이 파일에서만 규칙을 끈다(개발 편의 기능일 뿐 동작엔 영향 없음).
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  // useContext(Context)
  //   입력: 꺼내올 Context 객체
  //   반환: 가장 가까운 Provider가 흘려보낸 value
  const context = useContext(AuthContext)

  // Provider 밖에서 잘못 쓰면 바로 알 수 있게 오류를 던진다
  if (context === null) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.')
  }
  return context
}
