/*
  auth.js — 회원가입·로그인·로그아웃을 localStorage로 처리하는 함수 모음
  ⚠️ 실제 서비스 수준의 보안이 아니다: 데이터가 브라우저에 그대로 저장되고, 비밀번호는
     SHA-256 해시로만 바꿔 둘 뿐 소금값·서버 검증이 없다.
*/

const USERS_KEY = 'moodcurator:users'     // 가입한 사용자 목록
const SESSION_KEY = 'moodcurator:session' // 현재 로그인한 사용자

// 비밀번호 문자열을 SHA-256 해시(16진수 문자열)로 변환
async function hashPassword(password) {
  const data = new TextEncoder().encode(password)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return bufferToHex(buffer)
}

// 바이트 버퍼를 16진수 문자열로 변환 (예: 255 → 'ff')
function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// 저장된 사용자 목록을 읽는다 (각 원소: { email, nickname, passwordHash })
function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// 사용자 목록을 통째로 저장
function saveUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list))
}

// 현재 로그인 사용자를 세션에 저장 (비밀번호 해시는 넣지 않음)
function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

/*
  signUp — 이메일 중복 검사 → 비밀번호 해시 → 사용자 저장 → 자동 로그인.
    반환: Promise<{ ok, error?, user? }>
*/
export async function signUp({ email, password, nickname }) {
  const users = getUsers()

  if (users.some((u) => u.email === email)) {
    return { ok: false, error: '이미 가입된 이메일입니다.' }
  }

  const passwordHash = await hashPassword(password)
  const newUser = { email, nickname, passwordHash }
  saveUsers([...users, newUser])

  // 가입 직후 바로 로그인 상태로
  const sessionUser = { email, nickname }
  setSession(sessionUser)

  return { ok: true, user: sessionUser }
}

/*
  logIn — 이메일로 사용자를 찾고, 입력 비밀번호의 해시를 저장된 해시와 비교.
    반환: Promise<{ ok, error?, user? }>
*/
export async function logIn({ email, password }) {
  const users = getUsers()
  const found = users.find((u) => u.email === email)

  if (!found) {
    return { ok: false, error: '가입되지 않은 이메일입니다.' }
  }

  const passwordHash = await hashPassword(password)
  if (found.passwordHash !== passwordHash) {
    return { ok: false, error: '비밀번호가 일치하지 않습니다.' }
  }

  const sessionUser = { email: found.email, nickname: found.nickname }
  setSession(sessionUser)

  return { ok: true, user: sessionUser }
}

// 현재 세션을 지운다 (로그아웃)
export function logOut() {
  localStorage.removeItem(SESSION_KEY)
}

// 지금 로그인한 사용자를 읽는다 ({ email, nickname } 또는 null)
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
