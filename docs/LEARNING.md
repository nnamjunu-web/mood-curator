# MoodCurator 학습 가이드

> 컴퓨터공학과 2학년 수준을 대상으로, 이 프로젝트를 **어디부터 어떻게 읽으면 되는지** 정리한 문서입니다.
> 모든 소스 파일에는 한국어 주석이 달려 있으니, 이 문서와 함께 코드를 열어 읽는 것을 권합니다.
> 용어가 낯설면 [CONCEPTS.md](./CONCEPTS.md)(개념 용어집)를 함께 보세요.

---

## 1. 이 앱이 하는 일

"오늘의 감정"을 고르면(또는 웹캠으로 표정을 분석하면) 그 감정에 어울리는 **영화·음악·도서**를 추천해 주고, 마음에 든 항목을 브라우저에 저장(보관함)하는 웹앱입니다. 회원가입/로그인으로 **사용자별 보관함**을 두고, 영화는 **예고편 미리보기**, 음악은 **30초 미리듣기**도 지원합니다.

- 영화: TMDB API (+ 예고편: TMDB `/videos` → YouTube `<iframe>`)
- 음악: iTunes 한국 스토어 검색(country=KR) — 한글 곡 목록 + 표지 + 30초 미리듣기를 한 번에
- 도서: 카카오 책검색 API (한글 제목·저자·표지)
- 로그인: 브라우저 `localStorage` 기반(서버 없음) — ⚠️ 학습용 흉내, 실제 보안 아님
- 저장: 브라우저 `localStorage` (서버/DB 없음)
- 표정 인식: `@vladmandic/face-api` (브라우저에서 동작)

---

## 2. 큰 그림 — 폴더별 책임

```
src/
├─ main.jsx        앱 진입점 (React를 #root에 그림)
├─ App.jsx         라우팅 (URL ↔ 페이지 연결) + 로그인 상태 공급(AuthProvider)
├─ index.css       전역 스타일 + 디자인 토큰(색/폰트)
│
├─ pages/          화면 단위 컴포넌트 (상태·이벤트를 다루는 곳)
├─ components/     여러 화면이 공유하는 UI 조각 (버튼·카드·배지·모달)
├─ context/        앱 전체가 공유하는 상태 (로그인 상태 AuthContext)
├─ services/       바깥세상과 통신 (API 호출, localStorage)  ← "데이터를 가져오는 곳"
└─ utils/          입력→출력만 있는 순수 함수 (변환·계산)     ← "가장 이해하기 쉬운 곳"
```

| 폴더 | 한 줄 책임 |
|------|-----------|
| `pages/` | 사용자가 보는 화면. `useState`로 상태를 갖고, 버튼 클릭 등 이벤트를 처리한다. |
| `components/` | 화면 곳곳에서 재사용하는 UI 부품. props만 받아 모양을 그린다(대부분 상태 없음). |
| `context/` | 멀리 떨어진 컴포넌트들이 함께 봐야 하는 상태(로그인 사용자)를 한곳에서 공급. |
| `services/` | API 호출·localStorage처럼 "바깥"과 닿는 코드. 화면 코드가 지저분해지지 않게 분리. |
| `utils/` | 데이터를 변환/계산하는 순수 함수. 같은 입력엔 항상 같은 출력 → 테스트·이해가 쉽다. |

---

## 3. 추천 읽기 순서

처음 본다면 **이 순서**가 가장 빠릅니다. (위에서 아래로)

### ① 뼈대 — 화면이 어떻게 뜨는가
| 파일 | 여기서 배우는 개념 |
|------|-------------------|
| [src/main.jsx](../src/main.jsx) | 진입점, `createRoot`, `StrictMode` |
| [src/App.jsx](../src/App.jsx) | 라우팅(`BrowserRouter`/`Routes`/`Route`), 중첩 라우트 |
| [src/components/Layout.jsx](../src/components/Layout.jsx) | 공통 틀, `<Outlet/>` |
| [src/index.css](../src/index.css) | CSS 변수(디자인 토큰) |

### ② utils — 순수 함수부터 (가장 쉬움)
| 파일 | 여기서 배우는 개념 |
|------|-------------------|
| [src/utils/moodMapper.js](../src/utils/moodMapper.js) | 객체로 값 매핑, `??`(기본값) |
| [src/utils/emotionMapper.js](../src/utils/emotionMapper.js) | 감정→검색기준 매핑표 |
| [src/utils/cardAdapter.js](../src/utils/cardAdapter.js) | **어댑터 패턴**(서로 다른 응답 → 공통 형태), `map`, 옵셔널 체이닝 |
| [src/utils/random.js](../src/utils/random.js) | 피셔-예이츠 셔플, 배열 다루기 |

### ③ services — 데이터 가져오기
| 파일 | 여기서 배우는 개념 |
|------|-------------------|
| [src/services/http.js](../src/services/http.js) | **`fetch`/`Promise`/`async·await`** (꼭 먼저), 헤더 옵션 |
| [src/services/tmdb.js](../src/services/tmdb.js) | REST API 호출, 쿼리 파라미터, 환경변수(`import.meta.env`) |
| [src/services/itunes.js](../src/services/itunes.js) | **한국 스토어 검색(country=KR)** 으로 한글 곡·표지·미리듣기 한 번에 |
| [src/services/kakaoBooks.js](../src/services/kakaoBooks.js) | **헤더 인증(`Authorization`)** 으로 한글 도서 조회 |
| [src/services/recommendations.js](../src/services/recommendations.js) | **`Promise.allSettled`로 동시 호출**, 조합 |
| [src/services/favorites.js](../src/services/favorites.js) | **`localStorage`**, `JSON.stringify/parse`, 사용자별 키 |
| [src/services/recents.js](../src/services/recents.js) | localStorage로 "직전 결과" 기억 |
| [src/services/auth.js](../src/services/auth.js) | **Web Crypto 해시(SHA-256)**, 사용자/세션 저장 |
| [src/services/faceApi.js](../src/services/faceApi.js) | 외부 라이브러리 감싸기, 표정→점수 |

> 참고: [openLibrary.js](../src/services/openLibrary.js)(도서→카카오)와 [lastfm.js](../src/services/lastfm.js)(음악→iTunes 한국 스토어)는 소스가 바뀌며 **미사용**이 되었지만, 각각 '키 없는 REST 호출' / '태그+키 쿼리 호출' 예시로 남겨두었습니다.

### ③-2 context — 전역 로그인 상태
| 파일 | 여기서 배우는 개념 |
|------|-------------------|
| [src/context/AuthContext.jsx](../src/context/AuthContext.jsx) | **Context API**(`createContext`/`useContext`/`Provider`), 커스텀 훅(`useAuth`) |

### ④ components — UI 조각 (작은 것 → 큰 것)
작은 것 → [MatchBadge](../src/components/MatchBadge.jsx) · [TagChip](../src/components/TagChip.jsx) · [ToggleButton](../src/components/ToggleButton.jsx) · [MoodPill](../src/components/MoodPill.jsx) · [Spinner](../src/components/Spinner.jsx)
조립한 것 → [ContentCard](../src/components/ContentCard.jsx) (예고편/미리듣기 버튼 포함) · [RecommendationCard](../src/components/RecommendationCard.jsx)
특수 → [TrailerModal](../src/components/TrailerModal.jsx) (**`<iframe>` 임베드**, ESC 닫기) · [ProtectedRoute](../src/components/ProtectedRoute.jsx) (**보호 라우트**, `<Navigate>`)
공통 → [Header](../src/components/Header.jsx) (로그인 상태 분기) · [Footer](../src/components/Footer.jsx)

배우는 개념: **props**, 조건부 렌더링, 리스트 렌더링(`map`+`key`), 이벤트 핸들러, 클래스 합성, 모달·리다이렉트.

### ⑤ pages — 실제 화면 (단순 → 복잡)
| 파일 | 여기서 배우는 개념 |
|------|-------------------|
| [src/pages/LoginPage.jsx](../src/pages/LoginPage.jsx) · [SignUpPage.jsx](../src/pages/SignUpPage.jsx) | 폼 입력·유효성 검사, `useAuth`, 로그인 후 복귀 |
| [src/pages/LibraryPage.jsx](../src/pages/LibraryPage.jsx) | `useState`로 필터/정렬 |
| [src/pages/PopularPage.jsx](../src/pages/PopularPage.jsx) | `useEffect`로 데이터 로딩, 탭 필터 |
| [src/pages/ResultPage.jsx](../src/pages/ResultPage.jsx) | URL 파라미터로 데이터 가져오기(`useSearchParams`) |
| [src/pages/AnalyzePage.jsx](../src/pages/AnalyzePage.jsx) | `useRef`, 웹캠(`getUserMedia`), 파일 업로드 |
| [src/pages/HomePage.jsx](../src/pages/HomePage.jsx) | 여러 상태 조합, 인라인 추천, 미리듣기(`Audio`)·예고편 모달(종합편) |

> 가장 추천하는 최소 경로: **App.jsx → http.js → recommendations.js → HomePage.jsx**
> 이 4개만 따라가도 "라우팅 → 비동기 데이터 → 조합 → 화면"의 중심 줄기가 잡힙니다.

---

## 4. 핵심 흐름 3개 (코드가 어떻게 연결되는가)

### 흐름 ① 감정 선택 → 추천 (홈, 인라인)
```
[HomePage] 감정 알약 클릭 → selectedMood (useState)
   └─ '추천 받기' 클릭
        └─ getRecommendations(감정)                 ... services/recommendations.js
             ├─ getRecommendationKeys(감정)          ... utils/emotionMapper.js  (감정→장르/태그/주제)
             ├─ Promise.allSettled([                 ... 영화·음악·도서 동시 호출
             │     fetchMoviesByGenre(),             ... services/tmdb.js
             │     searchKoreanTracks(),             ... services/itunes.js (한국 스토어 한글 검색어)
             │     fetchBooksByQuery() ])            ... services/kakaoBooks.js (한글 검색어, 헤더 인증)
             ├─ normalizeMovies/ItunesTracks/KakaoBooks() ... utils/cardAdapter.js  (응답→공통 카드)
             └─ pickRandom(풀, 8, 직전ID)             ... utils/random.js  (섞어서 N개)
   └─ 결과를 ContentCard로 화면에 표시 (영화=예고편 버튼 / 음악=미리듣기 버튼)
   ※ iTunes 검색은 표지·미리듣기가 이미 들어 있어 별도 보강 단계가 없다.
```

### 흐름 ② 표정 분석 → 결과
```
[AnalyzePage] '내 표정 분석하기'
   ├─ navigator.mediaDevices.getUserMedia()  ... 웹캠 켜기
   ├─ detectExpressions(video)               ... services/faceApi.js (7가지 감정 점수)
   ├─ pickTopExpression()                    ... 가장 높은 감정 선택
   └─ navigate('/result?mood=…&confidence=…')
[ResultPage] URL의 mood를 읽어 → 흐름 ①의 getRecommendations 재사용
```

### 흐름 ③ 하트/북마크 → 저장 (localStorage)
```
카드의 하트/북마크 클릭
   └─ toggleFavorite(item)        ... services/favorites.js
        └─ localStorage 'moodcurator:favorites:<이메일>' 갱신 (로그인 사용자별 분리)
[LibraryPage]·[HomePage 사이드바] 같은 저장소를 읽어 표시
```

### 흐름 ④ 회원가입/로그인 → 사용자별 보관함
```
[SignUpPage/LoginPage] 폼 제출
   └─ useAuth().signUp / logIn      ... context/AuthContext.jsx
        └─ services/auth.js
             ├─ hashPassword()       ... Web Crypto SHA-256 (평문 저장 방지)
             └─ localStorage 'moodcurator:users' / ':session' 갱신
   └─ setUser(...)  → 헤더가 '닉네임/로그아웃'으로 자동 갱신
[ProtectedRoute] 비로그인 상태로 /library 접근 → <Navigate to="/login">
   로그인 성공 후 원래 가려던 곳으로 복귀 (state.from)
```

### 흐름 ⑤ 예고편(영화) / 미리듣기(음악)
```
[ContentCard] 영화 '▶ 예고편' 클릭
   └─ HomePage.handleOpenTrailer(item)
        └─ fetchMovieTrailer(previewId)   ... services/tmdb.js (클릭 시에만 = 지연 로딩)
        └─ <TrailerModal>에 YouTube key 전달 → https://youtube.com/embed/{key} 를 <iframe>으로 재생

[ContentCard] 음악 '▶ 미리듣기' 클릭
   └─ HomePage.handleTogglePreview(item)
        └─ audioRef(new Audio).src = previewUrl → play()  (다른 곡 누르면 이전 곡 정지 = 한 번에 하나)
```

---

## 5. 직접 실행하며 관찰하기 (실습 팁)

```bash
npm install      # 처음 한 번 (의존성 설치)
npm run dev      # 개발 서버 실행 → 터미널에 뜨는 주소를 브라우저로 열기
```

브라우저에서 **F12(개발자 도구)** 를 열고:

1. **Network 탭**: 감정을 골라 "추천 받기"를 누르면 `themoviedb.org`, `audioscrobbler.com`(Last.fm), `openlibrary.org` 로 요청이 나가는 것을 볼 수 있어요. 각 요청을 클릭하면 실제 응답(JSON)도 보입니다.
2. **Application 탭 → Local Storage**: 하트를 누르면 `moodcurator:favorites` 값이 바뀌고, 추천을 받으면 `recent_movie`/`recent_music`/`recent_book` 이 갱신되는 걸 관찰하세요.
3. **console.log 찍어보기**: 예를 들어 `services/recommendations.js`의 `getRecommendations` 안에서 `console.log(movies, music, books)` 를 찍어 데이터가 어떻게 생겼는지 직접 확인해 보세요.

---

## 6. 직접 해보기 (난이도순 연습)

> 코드를 "읽기만" 하는 것보다 **조금씩 바꿔보는 것**이 가장 빠른 학습입니다.

1. **(쉬움) 새 감정 추가** — [moodMapper.js](../src/utils/moodMapper.js)의 라벨/이모지와 [emotionMapper.js](../src/utils/emotionMapper.js)의 매핑표에 새 감정(예: `bored`)을 추가하고, [HomePage](../src/pages/HomePage.jsx)의 `MOODS` 배열에도 넣어보세요.
2. **(쉬움) 추천 결과 바꾸기** — [emotionMapper.js](../src/utils/emotionMapper.js)에서 `happy`의 `movieGenreId`·`musicTag`나 `bookSubject`(한글 도서 검색어)를 바꿔보고, 추천이 달라지는지 확인하세요. ([TMDB 장르 ID 표](https://developer.themoviedb.org/reference/genre-movie-list))
3. **(보통) 카드에 정보 한 줄 추가** — [cardAdapter.js](../src/utils/cardAdapter.js)의 `normalizeMovies`에 `year`(개봉연도) 같은 필드를 추가하고, [ContentCard](../src/components/ContentCard.jsx)에서 화면에 보여주세요.
4. **(보통) 추천 개수 바꾸기** — `getRecommendations(mood, limit)`의 `limit`을 바꿔 카드 개수를 조절해 보세요. 너무 크게 하면 어떤 문제가 생길지도 생각해 보세요(API 호출/표지 조회 수).
5. **(보통) 예고편 모달 닫기 관찰** — [TrailerModal.jsx](../src/components/TrailerModal.jsx)에서 배경 클릭·✕·ESC 세 가지로 닫히는 과정을 따라가 보고, `useEffect`의 정리(clean-up)가 키 리스너를 언제 제거하는지 확인하세요.
6. **(보통) 로그인 상태 흐름 따라가기** — [AuthContext.jsx](../src/context/AuthContext.jsx)의 `setUser`가 호출되면 왜 [Header.jsx](../src/components/Header.jsx)가 자동으로 다시 그려지는지(Context 구독) 설명해 보세요. 로그아웃 후 보관함(`/library`)에 들어가면 어디로 가는지도 확인하세요.
7. **(도전) 단위 테스트 1개** — Vitest를 추가해 [random.js](../src/utils/random.js)의 `fisherYatesShuffle`(길이 보존·원본 불변) 또는 [cardAdapter.js](../src/utils/cardAdapter.js)의 `normalizeKakaoBooks`(빈 isbn·thumbnail 처리) 같은 변환 함수에 대한 간단한 테스트를 작성해 보세요.

---

## 7. 더 읽을거리
- 개념 용어집: [CONCEPTS.md](./CONCEPTS.md)
- 코드 작성 규칙(주석/요약 규칙): [../CLAUDE.md](../CLAUDE.md)
