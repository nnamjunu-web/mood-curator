/*
  auth.js — 회원가입·로그인·로그아웃을 브라우저 저장소(localStorage)로 처리하는 함수 모음
  - 이 프로젝트는 서버/DB가 없으므로, 사용자 정보와 로그인 세션을 모두 브라우저에 직접 저장한다.

  ───────────────────────────────────────────────────────────────
  ⚠️ 보안 경고 (반드시 읽을 것)
    - 이 인증은 "학습용 흉내내기"이지 실제 서비스 수준의 보안이 아니다.
    - 모든 데이터가 사용자 브라우저 안에 그대로 들어 있어, 개발자 도구로 누구나 들여다볼 수 있다.
    - 비밀번호를 평문으로 두지 않으려고 SHA-256 해시로 바꿔 저장하지만,
      이것만으로는 실제 서비스에 쓸 수 없다(소금값·반복 해시·서버 검증 등이 전혀 없음).
    - 진짜 로그인은 서버에서 검증하고 HTTPS/세션·토큰으로 보호해야 한다.
  ───────────────────────────────────────────────────────────────
*/

// 저장 열쇠(key) — 기존 컨벤션(moodcurator:...)에 맞춰 접두어를 붙였다
const USERS_KEY = 'moodcurator:users'     // 가입한 사용자 목록(배열)
const SESSION_KEY = 'moodcurator:session' // 현재 로그인한 사용자(객체)

/*
  hashPassword — 비밀번호 문자열을 SHA-256 해시(16진수 문자열)로 바꾼다.
    입력: password(평문 비밀번호 문자열)
    반환: Promise<string> — 64자리 16진수 해시 문자열
    ※ 같은 비밀번호는 항상 같은 해시가 되므로, 로그인 시 저장된 해시와 비교만 하면 된다.
*/
async function hashPassword(password) {
  // TextEncoder: 문자열을 바이트(Uint8Array)로 바꿔주는 브라우저 내장 도구
  //   .encode(문자열) → 입력: 문자열 / 반환: Uint8Array(바이트 배열)
  const data = new TextEncoder().encode(password)

  // crypto.subtle.digest(알고리즘, 데이터)
  //   입력: 'SHA-256' 같은 알고리즘 이름 + 바이트 데이터
  //   반환: Promise<ArrayBuffer> — 해시 결과가 담긴 바이트 버퍼
  const buffer = await crypto.subtle.digest('SHA-256', data)

  // 해시 결과(바이트 묶음)를 비교·저장하기 쉬운 16진수 문자열로 변환해 돌려준다
  return bufferToHex(buffer)
}

/*
  bufferToHex — 바이트 버퍼를 사람이 읽는 16진수 문자열로 바꾼다(내부 전용).
    입력: buffer(ArrayBuffer — 해시 결과 같은 바이트 묶음)
    반환: 16진수 문자열 (예: 바이트 값 255 → 'ff')
*/
function bufferToHex(buffer) {
  // Uint8Array: ArrayBuffer를 바이트 단위로 다루게 감싸는 배열
  const bytes = new Uint8Array(buffer)
  // 각 바이트를 2자리 16진수 문자로 바꿔(예: 255 → 'ff') 한 줄로 이어 붙인다
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/*
  getUsers — 저장된 사용자 목록(배열)을 읽는다(내부 전용).
    입력: 없음
    반환: 사용자 배열 (없으면 빈 배열). 각 원소: { email, nickname, passwordHash }
*/
function getUsers() {
  // try/catch: 저장값이 깨져 JSON.parse가 실패해도 앱이 멈추지 않게 보호
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/*
  saveUsers — 사용자 목록을 통째로 저장한다(내부 전용).
    입력: list(사용자 배열)
    반환: 없음
*/
function saveUsers(list) {
  // localStorage는 문자열만 저장하므로 JSON 문자열로 바꿔서 저장
  localStorage.setItem(USERS_KEY, JSON.stringify(list))
}

/*
  setSession — 현재 로그인한 사용자를 세션에 저장한다(내부 전용).
    입력: user({ email, nickname }) — 비밀번호 해시는 세션에 넣지 않는다(불필요)
    반환: 없음
*/
function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

/*
  signUp — 회원가입: 이메일 중복 검사 → 비밀번호 해시 → 사용자 저장 → 자동 로그인.
    입력: { email, password, nickname }
    반환: Promise<{ ok: boolean, error?: string, user?: { email, nickname } }>
          (화면에서 ok/에러를 보고 메시지를 띄울 수 있도록 일관된 형태로 돌려준다)
*/
export async function signUp({ email, password, nickname }) {
  const users = getUsers()

  // 흐름 분기: 같은 이메일이 이미 있으면 가입 거부
  // some: 배열에 조건을 만족하는 원소가 하나라도 있으면 true
  if (users.some((u) => u.email === email)) {
    return { ok: false, error: '이미 가입된 이메일입니다.' }
  }

  // 비밀번호를 해시로 바꾼다(평문 저장 금지) — await: 해시가 끝날 때까지 기다림
  const passwordHash = await hashPassword(password)

  // 새 사용자 객체를 만들어 목록 맨 뒤에 추가하고 저장
  const newUser = { email, nickname, passwordHash }
  saveUsers([...users, newUser])

  // 가입 직후 바로 로그인 상태로 만든다(세션에 저장)
  const sessionUser = { email, nickname }
  setSession(sessionUser)

  return { ok: true, user: sessionUser }
}

/*
  logIn — 로그인: 이메일로 사용자를 찾고, 입력 비밀번호의 해시를 저장된 해시와 비교.
    입력: { email, password }
    반환: Promise<{ ok: boolean, error?: string, user?: { email, nickname } }>
*/
export async function logIn({ email, password }) {
  const users = getUsers()

  // find: 조건을 만족하는 첫 원소를 돌려준다(없으면 undefined)
  const found = users.find((u) => u.email === email)

  // 흐름 분기 ①: 가입되지 않은 이메일
  if (!found) {
    return { ok: false, error: '가입되지 않은 이메일입니다.' }
  }

  // 입력 비밀번호를 같은 방식으로 해시해서 저장된 해시와 비교
  const passwordHash = await hashPassword(password)

  // 흐름 분기 ②: 비밀번호 해시가 다르면 로그인 실패
  if (found.passwordHash !== passwordHash) {
    return { ok: false, error: '비밀번호가 일치하지 않습니다.' }
  }

  // 성공: 세션에 저장하고(=로그인 상태) 사용자 정보를 돌려준다
  const sessionUser = { email: found.email, nickname: found.nickname }
  setSession(sessionUser)

  return { ok: true, user: sessionUser }
}

/*
  logOut — 로그아웃: 현재 세션을 지운다.
    입력: 없음
    반환: 없음
*/
export function logOut() {
  localStorage.removeItem(SESSION_KEY)
}

/*
  getCurrentUser — 지금 로그인한 사용자를 읽는다.
    입력: 없음
    반환: { email, nickname } 또는 null(로그인 안 됨)
*/
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
