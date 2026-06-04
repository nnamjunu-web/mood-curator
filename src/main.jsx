/*
  main.jsx — 앱이 가장 먼저 실행되는 진입점(entry point)
  - index.html의 <div id="root">를 찾아 그 안에 React 앱(App)을 그려 넣는다.
*/
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// createRoot(DOM요소)
//   입력: React를 그릴 실제 HTML 요소 (여기선 id가 'root'인 div)
//   반환: root 객체 — .render(...)로 그 안에 React 컴포넌트를 그린다
// StrictMode: 개발 중 잠재적 문제를 더 잘 잡아주는 React의 검사 모드(화면엔 영향 없음)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
