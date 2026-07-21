# 채팅 단독 페이지 — 핸드북 없이 채팅만 배포

live-module의 채팅 핵심부만 추린 **단일 HTML 한 장짜리 독립 채팅 페이지**.
연수 중 브라우저 창을 화면 오른쪽에 좁게 스냅해 두고(강사 권장 폭 340~420px) 질문·메모를 실시간으로 받는 용도.

| 항목 | live-module (핸드북 내장) | chat-standalone (이 모듈) |
|---|---|---|
| 배포 형태 | 핸드북 index.html에 삽입 | `chat-standalone.html` 단독 배포 |
| 레이아웃 | 우측 sticky 컬럼 / 모바일 토글 | 항상 뷰포트 전면 패널 |
| 팔로우 모드 | 있음 (본문 섹션 추종) | 없음 (따라갈 본문이 없음) |
| 관리자 컨트롤 | TOC 하단 | 헤더 🔒 버튼 + 상단 스트립 |
| 숨김 모드 | 학생에게 패널 사라짐 | 안내 문구 표시 (빈 화면 방지) |
| 채팅·모드 데이터 | `<room_id>_chat` / `<room_id>_room` | 동일 — **같은 ROOM_ID면 같은 채팅방 공유** |

## 적용 단계

1. **Firebase 설정** — `chat-standalone.html`의 `<script>` 상단 `firebaseConfig`와 `ADMIN_EMAIL`을 본인 프로젝트 값으로 교체 (live-module과 동일).
2. **ROOM_ID 결정** — 영어 슬러그 (예: `singi2026`).
   - **핸드북 공유형**: 이미 LIVE 모듈로 배포한 핸드북과 같은 ROOM_ID를 쓰면 메시지·채팅 모드가 그대로 공유된다. 규칙 재배포 불필요. 수강생은 핸드북 채팅, 강사는 이 독립 창으로 같은 방을 보는 구성이 가능.
   - **단독형**: 새 ROOM_ID면 3번 규칙 배포 필수.
3. **Firestore 규칙 배포** (새 ROOM_ID일 때만) — `../live-module/firestore-rules.snippet`을 `<room_id>`로 치환해 본인 프로젝트의 `firestore.rules`에 추가 후 `firebase deploy --only firestore:rules`.
4. **파일 준비** — `chat-standalone.html`을 복사해 두 곳 치환:
   - `PLACEHOLDER_ROOM_ID` → 실제 ROOM_ID
   - `PLACEHOLDER_TITLE` (2곳: `<title>`, 헤더) → 연수명 (예: `2026 신기초 연수`)
5. **배포** — 파일 하나가 전부라 임의 정적 호스팅(Firebase Hosting, GitHub Pages, Netlify 등)에 그대로 업로드 (예: `chat.html`).
6. **검증** — 다른 브라우저 2개로 송수신, 관리자 로그인 후 잠금·숨김 모드가 상대 창에 반영되는지 확인.

## 강사 현장 사용법

- 창을 <kbd>Win</kbd>+<kbd>→</kbd>로 오른쪽 스냅 후 폭을 340~420px로 좁힌다. 발표 자료는 나머지 화면에.
  일반 브라우저 창은 최소 폭이 약 500px이므로, 더 좁게 쓰려면 **앱 모드**로 연다:
  `chrome.exe --app=<URL> --window-size=380,900` (주소창·탭 없는 창, 최소 폭 제한이 크게 완화됨)
- 헤더 🔒 버튼으로 Google 로그인하면 모드 스트립(활성/잠금/숨김)과 메시지별 삭제(×) 버튼이 나타난다.
- 채팅 모드는 room 문서로 동기화되므로, 핸드북 공유형이면 어느 쪽에서 바꿔도 양쪽에 함께 적용된다.

## 주의

- 이 페이지는 room 문서의 `chatMode`만 구독한다. `currentSection`·`currentSlide`(팔로우·슬라이드)는 무시하므로 핸드북 공유형에서 발표를 진행해도 독립 창은 영향 없음.
- 테마 토큰은 ocean-coral 라이트 고정. 다른 테마가 필요하면 `<style>` 상단 `:root` 블록을 `themes/<name>.css`의 라이트 값으로 교체.
