import { useEffect } from 'react'
import styles from './TrailerModal.module.css'

/*
  TrailerModal — 영화 예고편을 화면 가운데 띄워 보여주는 모달(팝업) 오버레이
  - 어두운 배경(overlay)을 깔고 그 위에 예고편 박스를 띄운다.
  - 예고편은 유튜브를 <iframe>으로 임베드해 재생한다(외부 도메인 youtube.com을 그 자리에 띄우는 것).
  - props
      status   : 'loading'(불러오는 중) | 'ready'(예고편 있음) | 'empty'(예고편 없음)
      videoKey : 유튜브 영상 key (status가 'ready'일 때만 의미 있음)
      title    : 영화 제목 (iframe 제목/접근성용)
      onClose  : 모달을 닫을 때 실행할 함수
*/
function TrailerModal({ status, videoKey, title, onClose }) {
  // useEffect: 컴포넌트가 화면에 나타난 직후 실행할 코드를 등록(여기선 ESC 키 닫기)
  useEffect(() => {
    // ESC 키를 누르면 모달을 닫는다
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    // addEventListener(이벤트, 핸들러): 입력=이벤트 이름+실행할 함수 / 반환=없음
    window.addEventListener('keydown', handleKeyDown)
    // 정리(clean-up): 모달이 사라질 때 등록한 키 리스너를 제거해 메모리 누수를 막는다
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    // 바깥 어두운 배경을 클릭하면 닫힌다
    <div className={styles.overlay} onClick={onClose}>
      {/* 박스 안쪽 클릭은 닫힘으로 이어지지 않게 전파를 막는다 */}
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="예고편 닫기">
          ✕
        </button>

        {/* 상태에 따라 다른 내용을 보여준다(조건부 렌더링) */}
        {status === 'loading' && <p className={styles.message}>예고편을 불러오는 중…</p>}
        {status === 'empty' && <p className={styles.message}>이 영화는 예고편이 없어요. 😢</p>}
        {status === 'ready' && (
          // 16:9 비율을 유지하는 래퍼 안에 iframe을 꽉 채운다
          <div className={styles.frameWrap}>
            <iframe
              className={styles.iframe}
              src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`}
              title={`${title} 예고편`}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default TrailerModal
