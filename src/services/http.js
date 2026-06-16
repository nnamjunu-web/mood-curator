/*
  http.js — 모든 API 호출이 공통으로 쓰는 "JSON 가져오기" 도우미
  - fetch + 에러 처리 + JSON 파싱을 한곳에 모아 각 서비스가 반복하지 않게 한다.
*/

/*
  fetchJson — 주어진 URL로 요청을 보내고 응답을 JSON 객체로 돌려준다.
    입력: url, errorMessage(실패 시 메시지), options(선택 — fetch 설정 객체, 예: 헤더)
    반환: Promise<객체>. 응답이 비정상이면 errorMessage를 담은 에러를 던진다.
*/
export async function fetchJson(url, errorMessage = '데이터를 불러오지 못했습니다.', options = undefined) {
  const response = await fetch(url, options)

  // 응답이 2xx가 아니면 에러를 던져 호출한 쪽이 처리하게 한다
  if (!response.ok) {
    throw new Error(`${errorMessage} (상태코드: ${response.status})`)
  }

  return response.json()
}
