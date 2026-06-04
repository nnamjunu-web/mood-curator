# MoodCurator 🎬🎵📚

감정 기반 콘텐츠 큐레이션 앱. "오늘의 기분"을 고르거나 웹캠으로 표정을 분석하면, 그 감정에
어울리는 **영화·음악·도서**를 추천하고 마음에 든 항목을 보관함에 저장합니다.

> 📖 **처음 보는 분은 여기부터:** [docs/LEARNING.md](docs/LEARNING.md) (학습 가이드) · [docs/CONCEPTS.md](docs/CONCEPTS.md) (개념 용어집)

---

## 기술 스택
- **React + Vite** (JavaScript)
- **react-router-dom** — 페이지 라우팅
- **@vladmandic/face-api** — 브라우저에서 표정 인식
- 데이터: **TMDB**(영화) · **Last.fm**+**iTunes**(음악/표지) · **Open Library**(도서)
- 저장: 브라우저 **localStorage** (서버/DB 없음)

## 빠른 시작
```bash
npm install
cp .env.example .env   # Windows PowerShell: Copy-Item .env.example .env
# .env 에 TMDB / Last.fm 키 입력 (도서는 키 불필요)
npm run dev
```
- API 키 발급: [TMDB](https://www.themoviedb.org/settings/api) · [Last.fm](https://www.last.fm/api/account/create)
- 빌드: `npm run build` / 린트: `npm run lint`

## 폴더 구조 (요약)
```
src/
├─ pages/        화면 단위 컴포넌트
├─ components/   재사용 UI 조각
├─ services/     API 호출 · localStorage
├─ utils/        순수 변환/계산 함수
├─ App.jsx       라우팅
└─ main.jsx      진입점
```
자세한 설명과 읽는 순서는 [docs/LEARNING.md](docs/LEARNING.md)를 참고하세요.

## 코드 작성 규칙
이 프로젝트는 학습용이라 한국어 주석·요약 규칙을 따릅니다 → [CLAUDE.md](CLAUDE.md)
