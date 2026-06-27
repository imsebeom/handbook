# LIVE 모듈 — 강의 실시간 운용 옵션

강의 진행 중 다음 기능이 필요할 때만 적용한다. **모든 핸드북에 자동 적용되지 않는다.**

| 기능 | 효과 |
|---|---|
| 우측 sticky **채팅 패널** | 데스크탑은 화면 우측에 항시, 모바일은 우측 하단 토글 |
| **닉네임 모달** | 최초 진입 시 1회 입력, localStorage 저장 |
| **강사 Google 로그인** | TOC 하단 버튼, `live-chat.js`의 `ADMIN_EMAIL`로 지정한 본인 계정만 관리자 |
| **채팅 모드 제어** | 활성 / 잠금(읽기 전용) / 숨김(학생에게 패널 사라짐) |
| **강사 팔로우 모드** | 강사가 토글 켜고 스크롤하면 모두 부드럽게 추종, 수강생이 직접 스크롤하면 일시 해제 |
| **강사 따라가기 FAB** | 추종이 풀린 수강생 화면 하단에 "📡 강사 따라가기" 플로팅 버튼 등장 → 누르면 강사 현재 위치로 점프 + 추종 재개. 강사가 팔로우 OFF하면 버튼도 사라짐 |
| **컨트롤 버튼 위치** | 글자/다크/인쇄/절 모드 등 topbar 버튼은 TOC 사이드바 상단에 고정 (LIVE 모듈과 무관) |

## 적용 단계

1. **Firebase 프로젝트 준비** — 본인 Firebase 프로젝트(Firestore + Google 인증 활성화)의 `firebaseConfig`와 `ADMIN_EMAIL`을 `live-chat.js` 상단에 붙여넣는다.
2. **컬렉션 ID 결정** — `<room_id>_chat`, `<room_id>_room` 두 개. `live-chat.js` 상단의 `ROOM_ID` 상수 변경 (예: `singi2026`, `mdbf2026`).
3. **Firestore 규칙 추가** — `firestore-rules.snippet`을 본인 프로젝트의 `firestore.rules`에 새 컬렉션 명으로 복사 후 `firebase deploy --only firestore:rules` 실행. 규칙 와일드카드 안 쓰는 프로젝트면 컬렉션별 명시 필수.
4. **template.html에 삽입**:
   - **CSS**: `live-chat.css` 전문을 template.html의 `</style>` 직전에 붙임
   - **HTML**:
     - `live-chat-toc-footer.html` — TOC `</aside>` 직전 (마지막 `<ul>` 다음)
     - `live-chat-panel.html` — `</main>` 직후, `.layout` 닫는 `</div>` 직전
     - `live-chat-toggle.html` — 모바일 폴백 채팅 토글 + 강사 따라가기 FAB, `<body>` 시작 부근
   - **JS**: `live-chat.js` 전문을 기존 `<script>` 블록 다음 새 `<script type="module">`로 삽입
5. **main 영역 폭 조정** — `live-chat.css` 안에 `@media (min-width: 1100px) { main { flex: 4 1 0; max-width: none; padding: 50px 64px 100px; } }`가 포함됨. 기존 max-width 제거됨에 주의.
6. **본문 안내** — "시작하며" 섹션에 다음 한 줄 추가 권장:
   ```
   <li><strong>우측 💬 채팅창</strong>: 강의 중 질문·메모 실시간 공유 (최초 진입 시 이름 입력)</li>
   <li><strong>📡 팔로우 모드</strong>: 강사가 켜면 모두 같은 위치로 부드럽게 이동 — 직접 스크롤하면 일시 해제, 하단 "강사 따라가기" 버튼으로 재개</li>
   ```

## 옵션 줄여쓰기

LIVE 모듈을 켜면 **정적 인덱스 섹션이 채팅으로 대체 가능**하므로 다음을 압축해도 좋다:

- ⚡ 프롬프트 자료실(빠른 인덱스) — TOC에 anchor 링크가 이미 있어 중복
- 📦 강의 자료 다운로드 — 핵심 1~2개만 인트로에, 나머지는 본문 해당 섹션 옆 인라인 카드로
- 📋 산출물 체크리스트 — 강사가 채팅 잠금 모드로 구두 전달 가능
- 📚 외부 참고 자료 13선 — 후속 카카오 오픈채팅으로 안내

세부 결정은 강의 시간(2h vs 3h+)·청중(교사·학생·일반)에 따라 사용자에게 확인.

## 파일

| 파일 | 역할 |
|---|---|
| `live-chat.css` | 패널 / 모달 / 팔로우 표식 / 3컬럼 레이아웃 / topbar 위치 |
| `live-chat-toggle.html` | 모바일 폴백 채팅 토글 버튼 + 강사 따라가기 FAB (body 시작 부근) |
| `live-chat-panel.html` | 우측 sticky 패널 본체 + 닉네임 모달 + 팔로우 상태 표식 |
| `live-chat-toc-footer.html` | TOC 하단 관리자 로그인 + 모드 셀렉터 + 팔로우 토글 |
| `live-chat.js` | Firestore 채팅 + Google Auth + 모드 publish/subscribe + 팔로우 publish/subscribe + 닉네임 모달 + topbar 재배치 |
| `firestore-rules.snippet` | `<room_id>_chat` + `<room_id>_room` 규칙 (firestore.rules에 추가) |
