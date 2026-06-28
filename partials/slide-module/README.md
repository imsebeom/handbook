# SLIDE 모듈 — 슬라이드 핸드북 (LIVE 모듈 확장)

강사가 PPT로 진행하고 수강생은 핸드북을 보는 수업·연수용. **LIVE 모듈을 켠 위에** 슬라이드 레이어를 얹는다(슬라이드 동기화가 Firestore에 의존하므로 LIVE 필수).

| 기능 | 효과 |
|---|---|
| **수강생 미니 슬라이드 패널** | 사이드바 최상단(좌상단)에 강사가 진행 중인 현재 슬라이드 + "N / 총". 클릭 시 확대(라이트박스). 모바일은 화면 상단 가로 바로 전환. **발표 전·종료 후엔 표지(1번)로 고정**(라벨 "표지"). **확대해 둔 채 강사가 넘기면 확대 이미지도 따라 바뀐다** |
| **강사 발표 모드 `?present`** | 관리자 로그인 시 TOC 하단의 **"🎬 슬라이드 발표 시작"** 버튼이 **새 창**으로 발표 뷰어를 연다(원본 핸드북 창 유지). ←→/Space/클릭으로 넘김, Esc로 종료. 넘김은 **로컬 즉시 갱신(낙관적)+인접 프리로드**라 지연이 없다. 발표 화면 **왼쪽에 섹션 목차**가 있어 임의 섹션으로 바로 점프(현재 섹션 하이라이트). URL에 `?present`를 직접 붙여도 됨 |
| **슬라이드→섹션 자동 스크롤** | 강사가 슬라이드를 넘기면 매핑된 본문 섹션으로 수강생 화면이 부드럽게 이동(기존 LIVE 팔로우 재사용) |
| **수강생 직접 스크롤** | 기존 LIVE 그대로 — 직접 스크롤하면 추종 일시 해제, "📡 강사 따라가기" FAB로 재개 |
| **강의 PPT 다운로드** | 본문 맨 끝 카드에서 강사 발표 원본 PPT를 **한 파일로 내려받기**. 바로 아래에 **인용 안내 문구**(출처 표기 요청) |

## 핵심 원리 (왜 코드가 적은가)

**슬라이드 넘김을 "이 섹션으로 가라" 신호로 환원**한다. 강사가 슬라이드 N으로 가면 `currentSlide`(이미지 교체용)와 함께 매핑된 `currentSection`을 한 번에 publish하고, 섹션 스크롤은 **기존 LIVE 팔로우 구독(`live-chat.js`)이 그대로 처리**한다. SLIDE 모듈이 새로 만드는 건 슬라이드 이미지 표시·발표 UI·매핑 데이터뿐이다.

## 적용 단계

0. **선행 조건** — LIVE 모듈을 먼저 통합한다(`../live-module/README.md`). SLIDE는 그 위에 얹힌다.

1. **슬라이드 PNG 추출 + 원본 복사** — `tools/slides_to_png.py`로 PPTX 또는 PDF를 슬라이드별 PNG로 변환:
   ```
   PYTHONIOENCODING=utf-8 python tools/slides_to_png.py <발표.pptx|발표.pdf> <핸드북폴더>
   ```
   → `<핸드북폴더>/slides/01.png … NN.png` 생성 + **원본을 `slides/lecture.<ext>`로 복사**(다운로드용). 끝에 `window.SLIDES`와 `window.SLIDES_PPT`·`window.SLIDES_PPT_NAME` 스캐폴드를 출력한다.

2. **template.html에 삽입** (`slide-viewer.html`의 4개 블록):
   - **CSS**: `slide-viewer.css` 전문을 `</style>` 직전(=`live-chat.css` 다음)에 붙임
   - **(A) 미니 패널**: `<aside class="toc" id="toc">` 시작 직후, `<div class="topbar">` **바로 위**에 삽입
   - **(C) 발표 오버레이 + 라이트박스**: `.layout` 닫는 `</div>` 다음(=`live-chat-panel.html`과 같은 영역)에 삽입
   - **(D) 강의 PPT 다운로드 카드**: 본문 맨 끝, `<div class="footer">` **바로 위**에 삽입. `window.SLIDES_PPT`가 비면 자동 숨김
   - **(B) SLIDES 매핑**: `<script>window.SLIDES=[...]</script>`를 본문 어디든(아래 JS보다 먼저). 1단계 스캐폴드를 채우고, 같은 블록의 `window.SLIDES_PPT`·`window.SLIDES_PPT_NAME`도 채워 다운로드 카드를 활성화
   - **`<body>` 클래스**: `<body class="has-slides">` 추가(모바일 상단 여백 보정용)
   - **JS**: `slide-sync.js` 전문을 **`live-chat.js` 다음**, 같은 `<script type="module">` 안에 이어붙임(별도 module이면 스코프 분리로 `roomRef`·`isAdmin` 접근 불가)

3. **SLIDES 매핑 채우기** — 각 슬라이드의 `section`을 본문 앵커 id(`<span id="section-2" class="anchor">`의 `section-2`)로 지정. **유연 매핑**: 여러 슬라이드가 같은 섹션을 가리켜도 되고, 섹션 점프가 불필요한 슬라이드는 `section: null`. LLM이 원고·슬라이드를 대조해 1차 제안 후 사용자 확인.

4. **Firestore 규칙** — `../live-module/firestore-rules.snippet`에 이미 `currentSlide` 필드가 포함돼 있다. 새 ROOM_ID로 복사 후 배포:
   ```
   firebase deploy --only firestore:rules --project YOUR_PROJECT_ID
   ```
   **기존에 배포된 LIVE 룸에 SLIDE를 추가로 켜는 경우, 규칙을 반드시 재배포**해야 `currentSlide` publish가 막히지 않는다(`followActive` 추가 때와 동일한 화이트리스트 함정).

5. **본문 안내** — "시작하며" 섹션에 한 줄 추가 권장:
   ```
   <li><strong>📽 좌상단 슬라이드</strong>: 강사가 진행 중인 슬라이드가 실시간 표시됩니다(클릭하면 확대)</li>
   ```

## 강사 사용법 (현장)

1. 발표용 창을 연다. 두 방법 중 하나:
   - 평소처럼 핸드북에 Google 로그인(관리자) → TOC 하단 컨트롤의 **"🎬 슬라이드 발표 시작"** 버튼 클릭(URL을 외울 필요 없음).
   - 또는 핸드북 URL 뒤에 `?present`를 직접 붙인다(예: `https://your-host/singi2026/?present`).
2. 하단 바의 "로그인 필요 — 클릭"을 눌러 Google 로그인(관리자 본인 계정). "LIVE 송출 중"으로 바뀌면 송출된다(버튼으로 진입했고 이미 로그인 상태면 바로 송출).
3. ←→ / Space / 화면 좌우 클릭으로 슬라이드를 넘긴다. 넘길 때마다 수강생 화면의 좌상단 슬라이드가 교체되고, 매핑된 섹션으로 함께 스크롤된다.
4. Esc 또는 "✕ 종료"로 일반 핸드북으로 돌아간다. **발표를 종료하면 수강생 좌상단 미니패널은 자동으로 표지로 복귀**한다.

수강생은 그냥 `?present` 없는 핸드북 URL을 연다. 발표 시작 전·종료 후엔 좌상단에 표지가 보이고, 본문 맨 끝에서 강의 PPT 원본을 한 파일로 내려받을 수 있다(인용 시 출처 표기 안내 포함).

## 파일

| 파일 | 역할 |
|---|---|
| `slide-viewer.css` | 미니 패널 / 확대 라이트박스 / 발표 오버레이 / 다운로드 카드 스타일 |
| `slide-viewer.html` | (A) 미니 패널 (B) SLIDES·SLIDES_PPT 매핑 (C) 발표 오버레이+라이트박스 (D) PPT 다운로드 카드 |
| `slide-sync.js` | 강사 슬라이드 publish(낙관적+프리로드) + 수강생 표지고정/currentSlide 구독 + 다운로드 활성화 (live-chat.js와 같은 module) |

> Firestore 규칙은 LIVE 모듈의 `firestore-rules.snippet`을 공유한다(거기에 `currentSlide` 포함).
> 슬라이드 추출은 스킬 루트의 `tools/slides_to_png.py`.
