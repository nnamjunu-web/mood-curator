import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/*
  ProtectedRoute — "로그인해야 볼 수 있는 페이지"를 감싸는 보호막 컴포넌트
  - 로그인되어 있으면 자식(children, 실제 페이지)을 그대로 보여준다.
  - 로그인되어 있지 않으면 로그인 페이지로 돌려보낸다.
  - 어디로 가려다 막혔는지(location.pathname)를 함께 넘겨, 로그인 후 원래 가려던 곳으로 보낼 수 있게 한다.

  사용 예) App.jsx에서
    <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
*/
function ProtectedRoute({ children }) {
  // 현재 로그인 사용자(없으면 null)
  const { user } = useAuth()

  // 지금 막힌 경로를 기억해 두려고 현재 위치를 읽는다
  const location = useLocation()

  // 흐름 분기: 비로그인 상태면 /login 으로 이동(=화면을 그리지 않고 리다이렉트)
  if (!user) {
    // Navigate: 렌더링되는 순간 to로 이동시키는 컴포넌트
    //   - state.from: 로그인 성공 후 돌아올 원래 목적지
    //   - replace: 뒤로가기 했을 때 막힌 페이지가 아니라 그 이전으로 가게 한다
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // 로그인 상태면 보호된 실제 페이지를 그대로 보여준다
  return children
}

export default ProtectedRoute
