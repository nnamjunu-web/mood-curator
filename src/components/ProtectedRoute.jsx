import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/*
  ProtectedRoute — 로그인해야 볼 수 있는 페이지를 감싸는 보호막.
  - 로그인 상태면 children을 보여주고, 아니면 /login으로 리다이렉트한다.
  - state.from에 막힌 경로를 담아, 로그인 후 원래 가려던 곳으로 복귀시킨다.
*/
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

export default ProtectedRoute
