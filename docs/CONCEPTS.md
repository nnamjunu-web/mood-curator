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
화면을 다시 그리지 않으면서 값을 계속 붙잡아 두는 상자(`.current`). DOM 요소나 스트림을 가리킬 때 사용.
→ [src/pages/AnalyzePage.jsx](../src/pages/AnalyzePage.jsx) (`<video>`, 카메라 스트림)

### 조건부 렌더링
`조건 && <JSX/>` 또는 삼항연산자로 상황에 따라 다른 화면을 그리는 것.
→ [src/pages/ResultPage.jsx](../src/pages/ResultPage.jsx) (로딩/에러/결과 분기)

### 리스트 렌더링 (map + key)
배열을 `.map()`으로 돌며 여러 개의 컴포넌트를 그린다. 각 항목엔 고유한 `key`가 필요(React가 변경을 효율적으로 추적).
→ [src/pages/HomePage.jsx](../src/pages/HomePage.jsx) (카드 목록), 거의 모든 목록 화면

---

## 라우팅 (react-router-dom)

- `BrowserRouter` / `Routes` / `Route`: "이 URL이면 이 컴포넌트" 규칙. → [src/App.jsx](../src/App.jsx)
- `<Outlet/>`: 공통 레이아웃 안에서 현재 페이지가 끼워지는 자리. → [src/components/Layout.jsx](../src/components/Layout.jsx)
- `Link` / `NavLink`: 페이지 이동 링크(`NavLink`는 활성 메뉴 표시). → [src/components/Header.jsx](../src/components/Header.jsx)
- `useNavigate()`: 코드에서 `navigate('/경로')`로 이동. → [src/pages/LibraryPage.jsx](../src/pages/LibraryPage.jsx)
- `useSearchParams()`: URL 쿼리(`?mood=happy`, `?q=…`) 읽기/쓰기. → [src/pages/ResultPage.jsx](../src/pages/ResultPage.jsx), [Header.jsx](../src/components/Header.jsx)

---

## 브라우저 저장소

### localStorage
브라우저에 key-value로 데이터를 영구 저장(새로고침·재접속해도 유지). **문자열만** 저장 가능해서 객체/배열은 `JSON.stringify`로 저장하고 `JSON.parse`로 읽는다.
→ [src/services/favorites.js](../src/services/favorites.js) (즐겨찾기), [recents.js](../src/services/recents.js) (직전 추천)

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
TMDB·Last.fm·Open Library는 응답 형태가 모두 다르다. 이를 **하나의 공통 카드 형태**(`{ id, type, title, subtitle, description, image, link }`)로 바꿔, 화면 컴포넌트가 출처를 몰라도 되게 한다.
→ [src/utils/cardAdapter.js](../src/utils/cardAdapter.js)

### 피셔-예이츠 셔플 (Fisher–Yates)
배열을 **편향 없이 공정하게** 섞는 알고리즘. `array.sort(() => Math.random() - 0.5)`는 편향되므로 쓰지 않는다(이유는 주석 참고).
→ [src/utils/random.js](../src/utils/random.js)

### "넓게 가져와 섞어 뽑기"
추천을 매번 다르게 하기 위해, 후보를 넓게(랜덤 페이지로) 받아 → 셔플 → 직전에 보여준 항목을 빼고 N개만 뽑는다.
→ [src/services/recommendations.js](../src/services/recommendations.js) + [utils/random.js](../src/utils/random.js) + [services/recents.js](../src/services/recents.js)
