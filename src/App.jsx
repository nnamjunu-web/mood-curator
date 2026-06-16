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
  App — 최상위 컴포넌트. AuthProvider로 로그인 상태를 공급하고, URL에 따라 페이지를 라우팅한다.
  - Layout이 공통 상단바/푸터 틀이고, 자식 Route들이 그 <Outlet /> 자리에 끼워진다.
*/
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />        {/* 추천 홈 */}
            <Route path="/popular" element={<PopularPage />} />  {/* 인기 차트 */}
            {/* 보관함은 로그인 사용자만 — ProtectedRoute로 감싼다 */}
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
