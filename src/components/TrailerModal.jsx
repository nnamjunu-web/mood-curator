import { useEffect } from 'react'
import styles from './TrailerModal.module.css'

/*
  TrailerModal — 영화 예고편을 가운데 띄우는 모달. 예고편은 유튜브를 <iframe>으로 임베드한다.
  - props: status('loading' | 'ready' | 'empty'), videoKey, title, onClose
*/
function TrailerModal({ status, videoKey, title, onClose }) {
  // ESC 키로 닫기 (언마운트 시 리스너 제거)
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    // 바깥 배경 클릭 시 닫힘
    <div className={styles.overlay} onClick={onClose}>
      {/* 박스 안쪽 클릭은 전파를 막아 닫히지 않게 */}
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="예고편 닫기">
          ✕
        </button>

        {status === 'loading' && <p className={styles.message}>예고편을 불러오는 중…</p>}
        {status === 'empty' && <p className={styles.message}>이 영화는 예고편이 없어요. 😢</p>}
        {status === 'ready' && (
          // 16:9 비율 래퍼에 iframe을 꽉 채운다
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
