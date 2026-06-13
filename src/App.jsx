import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import AnalyzePage from './pages/AnalyzePage'
import ResultPage from './pages/ResultPage'
import LibraryPage from './pages/LibraryPage'
import PopularPage from './pages/PopularPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'

/*
  App — 앱의 최상위 컴포넌트. URL에 따라 어떤 페이지를 보여줄지 정한다.
  - AuthProvider: 로그인 상태(현재 사용자)를 앱 전체에 공급한다. 라우터 바깥을 감싸
    어떤 페이지/헤더에서도 useAuth로 로그인 상태를 꺼내 쓸 수 있게 한다.
  - BrowserRouter: 브라우저 주소(URL)를 읽어 라우팅을 가능하게 하는 껍데기
  - Routes/Route: "이 경로(path)면 이 컴포넌트(element)를 그려라" 라는 규칙 목록
  - 바깥 Route(Layout)는 모든 페이지가 공유하는 상단바/푸터 틀이고,
    그 안의 Route들이 Layout의 <Outlet /> 자리에 끼워진다.
  - ProtectedRoute: 로그인해야 볼 수 있는 페이지(보관함)를 감싸는 보호막.
*/
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 공통 틀(Layout)을 부모로 두고, 자식 경로들을 그 안에 그린다 */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />        {/* 추천 홈 */}
            <Route path="/popular" element={<PopularPage />} />  {/* 인기 차트 */}
            {/* 보관함은 로그인한 사용자만 — ProtectedRoute로 감싼다 */}
            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <LibraryPage />
                </ProtectedRoute>
              }
            />
            <Route path="/analyze" element={<AnalyzePage />} />  {/* 감정 분석 */}
            <Route path="/result" element={<ResultPage />} />    {/* 분석 결과 */}
            <Route path="/login" element={<LoginPage />} />      {/* 로그인 */}
            <Route path="/signup" element={<SignUpPage />} />    {/* 회원가입 */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
