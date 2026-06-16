# MoodCurator 🎬🎵📚

감정 기반 콘텐츠 큐레이션 앱. "오늘의 기분"을 고르거나 웹캠으로 표정을 분석하면, 그 감정에
어울리는 **영화·음악·도서**를 추천하고 마음에 든 항목을 보관함에 저장합니다.

**주요 기능**: 감정/표정 기반 추천 · 영화 **예고편 미리보기**(YouTube) · 음악 **30초 미리듣기** · 회원가입/로그인(사용자별 보관함).

---

## 기술 스택
- **React + Vite** (JavaScript)
- **react-router-dom** — 페이지 라우팅
- **@vladmandic/face-api** — 브라우저에서 표정 인식
- 데이터: **TMDB**(영화) · **iTunes 한국 스토어**(음악/표지/미리듣기) · **카카오 책검색**(도서)
- 저장: 브라우저 **localStorage** (서버/DB 없음)

## 빠른 시작
```bash
npm install
cp .env.example .env   # Windows PowerShell: Copy-Item .env.example .env
# .env 에 TMDB / 카카오 키 입력 (음악=iTunes, 도서=카카오 / iTunes는 키 불필요)
npm run dev
```
- API 키 발급: [TMDB](https://www.themoviedb.org/settings/api) · [카카오(REST API 키)](https://developers.kakao.com)
- 빌드: `npm run build` / 린트: `npm run lint`

## 폴더 구조 (요약)
```
src/
├─ pages/        화면 단위 컴포넌트
├─ components/   재사용 UI 조각 (카드·모달·가드 등)
├─ context/      전역 상태 (로그인 AuthContext)
├─ services/     API 호출 · localStorage · 인증
├─ utils/        순수 변환/계산 함수
├─ App.jsx       라우팅 + AuthProvider
└─ main.jsx      진입점
```
