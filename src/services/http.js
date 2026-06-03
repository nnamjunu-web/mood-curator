/*
  http.js — 모든 API 호출이 공통으로 쓰는 "JSON 가져오기" 도우미 함수
  - TMDB / Last.fm / Google Books 세 서비스가 똑같은 fetch+에러처리+JSON파싱을
    반복하지 않도록 이 한 곳에 모았다.

  ───────────────────────────────────────────────────────────────
  개념 정리 (이 프로젝트에서 처음 나오는 비동기 개념들)

  ● Promise(약속)란?
    - 시간이 걸리는 작업(예: 서버에서 데이터 받기)의 "미래의 결과"를 담는 상자.
    - 지금 당장은 값이 없고, 나중에 둘 중 하나가 된다:
        성공(resolve) → 결과 값이 담김 / 실패(reject) → 에러가 담김
    - 즉 Promise는 "작업이 끝나면 알려줄게"라는 약속표 같은 것.

  ● async / await 란?
    - async: 함수 앞에 붙이면 그 함수는 "항상 Promise를 돌려주는 함수"가 된다.
    - await: Promise 앞에 붙이면 "그 약속이 끝날 때까지 이 줄에서 기다렸다가,
             결과 값을 꺼내서" 다음 줄로 넘어간다.
    - 덕분에 비동기 코드를 위에서 아래로 읽는 평범한 코드처럼 쓸 수 있다.

  ● fetch(url) 란?
    - 브라우저가 기본 제공하는, 네트워크 요청을 보내는 함수.
      입력: 요청할 URL 문자열 (+ 선택적으로 method/headers 등 옵션 객체)
      반환: Promise<Response> — "응답이 도착하면" Response 객체를 담는 약속.
    - Response.ok : 응답 상태코드가 200~299이면 true (정상)
    - Response.json() : 응답 본문(JSON 문자열)을 자바스크립트 객체로 바꿔준다.
                        이것도 시간이 걸리므로 또 Promise를 반환 → await 필요.
  ───────────────────────────────────────────────────────────────
*/

/*
  fetchJson — 주어진 URL로 GET 요청을 보내고, 응답을 JSON 객체로 돌려준다.
    입력: url(요청할 주소 문자열), errorMessage(실패 시 보여줄 한국어 메시지)
    반환: Promise<객체> — 파싱된 JSON 데이터
    실패: 응답이 비정상이면 errorMessage를 담은 에러를 던진다(throw).
*/
export async function fetchJson(url, errorMessage = '데이터를 불러오지 못했습니다.') {
  // await: fetch가 돌려준 Promise가 끝나(응답 도착)길 기다렸다가 response에 담는다
  const response = await fetch(url)

  // 흐름 분기: 응답이 정상(2xx)이 아니면 여기서 에러를 던져 호출한 쪽이 알게 한다
  if (!response.ok) {
    throw new Error(`${errorMessage} (상태코드: ${response.status})`)
  }

  // 본문(JSON)을 자바스크립트 객체로 변환해 돌려준다 (이것도 await로 기다림)
  return response.json()
}
