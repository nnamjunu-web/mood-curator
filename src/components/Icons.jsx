/*
  Icons.jsx — 앱 곳곳에서 쓰는 아이콘들을 인라인 SVG로 모아둔 파일
  - 별도 아이콘 라이브러리를 설치하지 않고, SVG를 직접 그려서 사용한다.
  - 각 아이콘은 컴포넌트(함수)이며, props로 받은 값들을 <svg>에 그대로 전달한다.
    (...props: 호출하는 쪽에서 className, width 등을 넘기면 그대로 적용됨)
*/

// 종 모양 알림 아이콘
export function BellIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" {...props}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  )
}

// 북마크(저장) 아이콘 — filled를 true로 주면 채워진 모양
export function BookmarkIcon({ filled = false, ...props }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" {...props}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

// 하트(좋아요) 아이콘 — filled가 true면 속을 채운다
export function HeartIcon({ filled = false, ...props }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" {...props}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  )
}

// 휴지통(삭제) 아이콘
export function TrashIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" {...props}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  )
}

// 검색 돋보기 아이콘
export function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

// 위로 향한 화살표(업로드) 아이콘
export function UploadIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" {...props}>
      <path d="M12 16V4m0 0l-5 5m5-5l5 5" />
      <path d="M5 20h14" />
    </svg>
  )
}

// 얼굴 스캔 아이콘 (표정 분석 버튼용) — 모서리 브래킷 + 웃는 얼굴
export function ScanFaceIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" {...props}>
      <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
      <path d="M9 10h.01M15 10h.01M9 14.5c.8.7 1.9 1 3 1s2.2-.3 3-1" />
    </svg>
  )
}

// 시계 아이콘 (업데이트 시각 표시)
export function ClockIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}
