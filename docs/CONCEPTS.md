# 개념 용어집 (CONCEPTS)

> 이 프로젝트에 나오는 핵심 개념을 짧게 설명하고, **코드 어디서 쓰이는지** 링크로 연결했습니다.
> 코드를 읽다 막히면 여기서 개념을 확인하고 해당 파일을 열어보세요. 전체 흐름은 [LEARNING.md](./LEARNING.md) 참고.

---

## 비동기 (Asynchronous)

### Promise(약속)
시간이 걸리는 작업의 "미래의 결과"를 담는 상자. 나중에 **성공(값)** 또는 **실패(에러)** 가 된다.
→ 설명·예시: [src/services/http.js](../src/services/http.js)

### async / await
- `async`: 함수를 "항상 Promise를 반환하는 함수"로 만든다.
- `await`: Promise가 끝날 때까지 그 줄에서 기다렸다가 결과 값을 꺼낸다. 비동기 코드를 위→아래로 읽게 해준다.
→ 거의 모든 [services/](../src/services/) 파일에서 사용. 기본형은 [http.js](../src/services/http.js).

### fetch(url)
브라우저 내장 네트워크 요청 함수. `Promise<Response>`를 반환하고, `response.ok`로 성공 여부를, `response.json()`으로 본문을 객체로 바꾼다.
→ [src/services/http.js](../src/services/http.js)의 `fetchJson`

### Promise.all vs Promise.allSettled
- `Promise.all([...])`: 여러 작업을 동시에 하되 **하나라도 실패하면 전체 실패**.
- `Promise.allSettled([...])`: 전부 끝날 때까지 기다리고 **각각의 성공/실패를 따로** 알려줌(절대 reject되지 않음). → 일부만 실패해도 나머지를 살릴 수 있다.
→ [src/services/recommendations.js](../src/services/recommendations.js) (영화·음악·도서 동시 호출)

---

## React 기본

### 컴포넌트 & props
컴포넌트는 화면 조각을 그리는 함수. **props**는 부모가 자식에게 넘기는 입력값(읽기 전용).
→ 예: [src/components/MatchBadge.jsx](../src/components/MatchBadge.jsx), [TagChip.jsx](../src/components/TagChip.jsx)

### useState
컴포넌트 안에서 값이 바뀌면 화면을 자동으로 다시 그려주는 저장소. `[값, 바꾸는함수]` 형태.
→ [src/pages/HomePage.jsx](../src/pages/HomePage.jsx), [LibraryPage.jsx](../src/pages/LibraryPage.jsx)

### useEffect
컴포넌트가 화면에 나타난 직후(또는 특정 값이 바뀔 때) 실행할 코드를 등록. 데이터 로딩에 자주 쓴다. 정리(cleanup) 함수로 뒷정리도 한다.
→ [src/pages/PopularPage.jsx](../src/pages/PopularPage.jsx), [ResultPage.jsx](../src/pages/ResultPage.jsx), [AnalyzePage.jsx](../src/pages/AnalyzePage.jsx)

### useRef
화면을 다시 그리지 않으면서 값을 계속 붙잡아 두는 상자(`.current`). DOM 요소나 스트림, 오디오 재생기를 가리킬 때 사용.
→ [src/pages/AnalyzePage.jsx](../src/pages/AnalyzePage.jsx) (`<video>`, 카메라 스트림), [HomePage.jsx](../src/pages/HomePage.jsx) (미리듣기용 `Audio` 객체)

### 조건부 렌더링
`조건 && <JSX/>` 또는 삼항연산자로 상황에 따라 다른 화면을 그리는 것.
→ [src/pages/ResultPage.jsx](../src/pages/ResultPage.jsx) (로딩/에러/결과 분기)

### 리스트 렌더링 (map + key)
배열을 `.map()`으로 돌며 여러 개의 컴포넌트를 그린다. 각 항목엔 고유한 `key`가 필요(React가 변경을 효율적으로 추적).
→ [src/pages/HomePage.jsx](../src/pages/HomePage.jsx) (카드 목록), 거의 모든 목록 화면

### Context API & 커스텀 훅
- **Context**: 멀리 떨어진 컴포넌트끼리 값을 공유하는 통로. `createContext`로 통로를 만들고 `<Provider value={…}>`로 값을 흘려보내면, 안쪽 어디서든 `useContext`로 꺼내 쓴다. → 로그인 상태를 헤더·페이지·가드가 함께 보도록 사용.
- **커스텀 훅**: `useXxx` 이름의 내 함수로 로직을 재사용 가능하게 묶은 것. 예: `useAuth()`가 `useContext`를 감싸 어디서든 `{ user, logIn, logOut }`을 꺼내게 한다.
→ [src/context/AuthContext.jsx](../src/context/AuthContext.jsx)

---

## 라우팅 (react-router-dom)

- `BrowserRouter` / `Routes` / `Route`: "이 URL이면 이 컴포넌트" 규칙. → [src/App.jsx](../src/App.jsx)
- `<Outlet/>`: 공통 레이아웃 안에서 현재 페이지가 끼워지는 자리. → [src/components/Layout.jsx](../src/components/Layout.jsx)
- `Link` / `NavLink`: 페이지 이동 링크(`NavLink`는 활성 메뉴 표시). → [src/components/Header.jsx](../src/components/Header.jsx)
- `useNavigate()`: 코드에서 `navigate('/경로')`로 이동. → [src/pages/LibraryPage.jsx](../src/pages/LibraryPage.jsx), [Header.jsx](../src/components/Header.jsx)
- `useSearchParams()`: URL 쿼리(`?mood=happy`) 읽기/쓰기. → [src/pages/ResultPage.jsx](../src/pages/ResultPage.jsx)
- `useLocation()`: 현재 주소 정보. 로그인 후 "원래 가려던 곳"으로 돌아갈 때도 쓴다. → [src/pages/LoginPage.jsx](../src/pages/LoginPage.jsx)
- `<Navigate to=…>`: 렌더링되는 순간 다른 경로로 보내는 컴포넌트(리다이렉트). → [src/components/ProtectedRoute.jsx](../src/components/ProtectedRoute.jsx)

---

## 브라우저 저장소

### localStorage
브라우저에 key-value로 데이터를 영구 저장(새로고침·재접속해도 유지). **문자열만** 저장 가능해서 객체/배열은 `JSON.stringify`로 저장하고 `JSON.parse`로 읽는다.
→ [src/services/favorites.js](../src/services/favorites.js) (즐겨찾기, **로그인 사용자별로 키 분리**), [recents.js](../src/services/recents.js) (직전 추천), [services/auth.js](../src/services/auth.js) (사용자 목록·로그인 세션)

---

## 스타일

### CSS Modules (`*.module.css`)
파일별로 클래스 이름이 자동으로 격리되어 충돌이 없다. `import styles from './X.module.css'` 후 `className={styles.이름}`.
→ 모든 컴포넌트/페이지 옆의 `*.module.css`

### CSS 변수 (디자인 토큰)
`:root`에 색·간격을 변수로 정의해 두고 `var(--이름)`으로 재사용. 한 곳만 바꾸면 앱 전체가 바뀐다.
→ [src/index.css](../src/index.css)

---

## 이 프로젝트의 패턴/알고리즘

### 어댑터(Adapter) 패턴
TMDB·Last.fm·카카오는 응답 형태가 모두 다르다. 이를 **하나의 공통 카드 형태**(`{ id, type, title, subtitle, description, image, link, … }`)로 바꿔, 화면 컴포넌트가 출처를 몰라도 되게 한다.
→ [src/utils/cardAdapter.js](../src/utils/cardAdapter.js)

### 피셔-예이츠 셔플 (Fisher–Yates)
배열을 **편향 없이 공정하게** 섞는 알고리즘. `array.sort(() => Math.random() - 0.5)`는 편향되므로 쓰지 않는다(이유는 주석 참고).
→ [src/utils/random.js](../src/utils/random.js)

### "넓게 가져와 섞어 뽑기"
추천을 매번 다르게 하기 위해, 후보를 넓게(랜덤 페이지로) 받아 → 셔플 → 직전에 보여준 항목을 빼고 N개만 뽑는다.
→ [src/services/recommendations.js](../src/services/recommendations.js) + [utils/random.js](../src/utils/random.js) + [services/recents.js](../src/services/recents.js)

---

## 인증 / 외부 미디어 / 네트워크

### 보호 라우트 (Protected Route)
"로그인해야 볼 수 있는 페이지"를 감싸, 비로그인 사용자면 로그인 화면으로 돌려보내는 패턴. 막힌 경로를 함께 넘겨 로그인 후 원래 가려던 곳으로 복귀시킨다.
→ [src/components/ProtectedRoute.jsx](../src/components/ProtectedRoute.jsx) (보관함 `/library` 보호)

### Web Crypto 해시 (SHA-256) · TextEncoder
비밀번호를 평문으로 저장하지 않으려고 **단방향 해시**(같은 입력 → 항상 같은 출력, 거꾸로 복원 불가)로 바꾼다. `TextEncoder`로 문자열을 바이트로 바꾼 뒤 `crypto.subtle.digest('SHA-256', …)`로 해시한다.
→ [src/services/auth.js](../src/services/auth.js) · ⚠️ 학습용 흉내일 뿐 실제 서비스 보안은 아님(소금값·서버 검증 없음).

### HTML5 `<audio>` / `new Audio()`
브라우저 내장 오디오 재생기. `new Audio()` 객체 하나를 두고 `src`를 바꿔 재생하면 **한 번에 한 곡만** 나오게 만들기 쉽다. 페이지를 떠날 때(언마운트) `pause()`로 정리한다.
→ [src/pages/HomePage.jsx](../src/pages/HomePage.jsx) (음악 30초 미리듣기)

### `<iframe>` 외부 임베드
다른 사이트(여기선 YouTube)를 내 화면 안에 끼워 넣는 요소. 예고편 key로 `https://www.youtube.com/embed/{key}` 주소를 만들어 임베드한다(외부 도메인을 그 자리에 띄우는 것).
→ [src/components/TrailerModal.jsx](../src/components/TrailerModal.jsx) (영화 예고편)

### HTTP 헤더 / Authorization
요청에 함께 보내는 "부가 정보표". 인증 토큰처럼 URL에 넣기 곤란한 값을 담는다. 카카오 책검색은 `Authorization: KakaoAK <키>` 헤더가 필수라, 공통 `fetchJson`이 헤더 옵션을 받도록 확장했다.
→ [src/services/http.js](../src/services/http.js) (옵션 인자), [services/kakaoBooks.js](../src/services/kakaoBooks.js) (헤더 사용)

### 환경변수 (`import.meta.env`, `VITE_`)
API 키처럼 코드 밖(.env)에 두는 값. Vite에선 `VITE_`로 시작하는 변수만 브라우저에 노출되며 `import.meta.env.VITE_XXX`로 읽는다. ⚠️ 빌드 결과에 그대로 들어가므로 **공개 가능한 키만** 둔다.
→ [src/services/tmdb.js](../src/services/tmdb.js), [lastfm.js](../src/services/lastfm.js), [kakaoBooks.js](../src/services/kakaoBooks.js)
