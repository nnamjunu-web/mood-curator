import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AnalyzePage from './pages/AnalyzePage'
import ResultPage from './pages/ResultPage'
import LibraryPage from './pages/LibraryPage'
import PopularPage from './pages/PopularPage'

/*
  App — 앱의 최상위 컴포넌트. URL에 따라 어떤 페이지를 보여줄지 정한다.
  - BrowserRouter: 브라우저 주소(URL)를 읽어 라우팅을 가능하게 하는 껍데기
  - Routes/Route: "이 경로(path)면 이 컴포넌트(element)를 그려라" 라는 규칙 목록
  - 바깥 Route(Layout)는 모든 페이지가 공유하는 상단바/푸터 틀이고,
    그 안의 Route들이 Layout의 <Outlet /> 자리에 끼워진다.
*/
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 공통 틀(Layout)을 부모로 두고, 자식 경로들을 그 안에 그린다 */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />        {/* 추천 홈 */}
          <Route path="/popular" element={<PopularPage />} />  {/* 인기 차트 */}
          <Route path="/library" element={<LibraryPage />} />  {/* 내 보관함 */}
          <Route path="/analyze" element={<AnalyzePage />} />  {/* 감정 분석 */}
          <Route path="/result" element={<ResultPage />} />    {/* 분석 결과 */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
