---
name: handbook
description: 강의 핸드북·교재·매뉴얼·연수 자료를 단일 HTML로 빌드. Pretendard·다크모드·TOC·코드 하이라이팅·인쇄 CSS 기본, 4테마 프리셋 선택, 옵션 LIVE 모듈(Firestore 실시간 채팅 + 강사 팔로우 모드), 옵션 SLIDE 모듈(슬라이드 핸드북: 강사 발표 슬라이드를 좌상단에 표시하고 슬라이드 넘김에 본문 스크롤 동기화). '핸드북', '교재 빌드', '강의 자료 HTML', '연수 자료 웹페이지', '강의 원고를 핸드북으로', '실시간 채팅 강의', '슬라이드 핸드북', '발표 동기화', 'PPT 연동 강의', 'handbook', '/handbook' 트리거 시 사용. 상세 옵션은 SKILL.md 본문.
---

# /handbook — 강의 핸드북 HTML 빌더

마크다운 강의 원고나 주제 설명을 받아 **단일 HTML 파일**의 강의 핸드북으로 빌드한다.
디자인 시스템은 `template.html`과 `components.md`에 박혀 있다 — 새로 발명하지 않는다.

## 사용법

```
/handbook [원고경로 또는 주제] [폴더명] [--theme=<name>] [--live=<room_id>] [--slides=<pptx|pdf 경로>]
```

- **원고경로 지정 시**: 해당 마크다운/텍스트를 읽어 핸드북 구조로 재조립
- **주제 설명 지정 시**: 사용자가 부른 주제를 8~10개 섹션으로 구성하는 안을 먼저 합의한 뒤 빌드
- **폴더명**: `2605-handbook-session2` 같이 영어 슬러그(소문자 + 하이픈). 생략 시 제안 후 확인
- **`--theme=<name>`**: `ocean-coral`(기본) / `forest-academic` / `berry-kids` / `charcoal-pro`. 생략 시 사용자에게 확인 또는 기본값
- **`--live=<room_id>`**: 강의 실시간 운용 모듈(채팅·강사 인증·팔로우·모드 제어) 활성화. ROOM_ID는 영어 슬러그(예: `singi2026`). 사용자가 강의 중 실시간 운영을 원할 때만 — 자세한 통합 절차는 `partials/live-module/README.md` 참조
- **`--slides=<pptx|pdf 경로>`**: 슬라이드 핸드북(SLIDE 모듈) 활성화. 강사 발표 슬라이드를 핸드북 좌상단에 표시하고, 강사가 `?present` 발표 모드에서 슬라이드를 넘기면 수강생 본문이 매핑된 섹션으로 스크롤된다. **LIVE 모듈을 자동 동반**(Firestore 동기화 의존)하므로 `--live=<room_id>`도 함께 필요. 자세한 절차는 `partials/slide-module/README.md` 참조

## 테마 프리셋

| 테마 | 분위기 | 적합한 용도 |
|---|---|---|
| `ocean-coral` (기본) | 네이비 × 티얼 × 코랄 | 일반 강의·연수, 교사 대상 자료 |
| `forest-academic` | 포레스트 그린 × 머스타드, 종이톤 | 논문·연구 보고서, 학술 발표 |
| `berry-kids` | 베리 × 코랄 × 라임, 18px 본문 | 초등 학생용, 어린이 교재 |
| `charcoal-pro` | 차콜 × 슬레이트 × 일렉트릭 블루 | 개발·테크 핸드북, 다크가 어울리는 자료 |

테마는 `themes/<name>.css`의 CSS 변수만 다르다 — 컴포넌트 클래스(`.callout`, `.steps`, `.code-tab` 등)는 동일.

## 산출물

- `<폴더명>/index.html` — 단일 자체완결 HTML (CSS·JS 인라인, 외부 의존: CDN의 Pretendard·Prism만)
- 1500~2500줄, 60~120KB가 보통의 분량

## 워크플로

### 0단계 — 옵션 확정 (필수, 사용자 1회 질의)

원본을 분석하기 **전에**, 사용자가 인자로 명시하지 않은 항목을 한 번에 묻는다. AskUserQuestion 한 묶음으로 처리해 라운드트립을 줄인다. 단, 이미 인자로 받은 항목(`--theme`, `--live`, 폴더명)은 다시 묻지 않는다.

**필수 질의 항목** (인자 미지정 시):

1. **폴더명** — 영어 슬러그(소문자+하이픈). 모르면 주제 기반으로 후보 1~2개 제안 후 선택받기
2. **테마** — ocean-coral(기본) / forest-academic / berry-kids / charcoal-pro
3. **LIVE 모듈 (인터랙티브: 채팅 + 강사 팔로우 + 모드 제어)** — 다음 중 택일:
   - **활성화** → ROOM_ID(영어 슬러그, 예: `singi2026`, `mdbf2026`)도 함께 받는다. Firestore 규칙 배포가 필요함을 미리 고지
   - **비활성화** → 정적 핸드북 (배포 후 추가 운영 부담 없음)
4. **SLIDE 모듈 (슬라이드 핸드북)** — 강사가 PPT로 진행하고 수강생은 핸드북을 보는 수업·연수일 때:
   - **활성화** → 슬라이드 원본(PPTX/PDF) 경로와 ROOM_ID를 받는다. **LIVE 모듈을 자동 동반**한다(슬라이드 동기화가 Firestore 기반). 슬라이드↔섹션 매핑을 빌드 단계에서 채워야 함을 고지
   - **비활성화** → 슬라이드 없는 일반 핸드북

**LIVE 모듈 자동 질의 우선 트리거** — 다음 신호가 보이면 0단계에서 LIVE 여부를 **반드시** 먼저 묻는다:

- 원고/주제에 "강의", "연수", "워크숍", "수업", "특강" 같은 실시간 진행 단어
- 메타에 일시·장소·강사가 있는 강의 핸드북
- 사용자가 "강의 중 질문 받고 싶다", "실시간으로", "팔로우", "강사 모드" 등을 언급

LIVE가 필요 없는 경우(읽기 전용 매뉴얼·교재·논문 정리 등)에는 묻지 않고 비활성으로 진행해도 무방.

### 1단계 — 원본 확보

| 입력 형태 | 행동 |
|---|---|
| `*.md` 파일 경로 | Read로 전문 읽기 → 섹션 구조 추출 |
| 핸드북 주제 한 줄 | 표지 메타 + 8~10개 섹션 제안서를 사용자에게 먼저 보여주고 합의 |
| 기존 PPTX·PDF·DOCX | `/md` 스킬로 마크다운 변환 후 진행 |

### 2단계 — 섹션 플랜

기본 구조 (필요 시 가감):

1. **표지** — 제목 / 부제 / 메타(일시·장소·강사 등) / 큰 숫자나 기호 데코
2. **시작하며** — 누구를 위한 핸드북인지, 한 줄 요약, (옵션) 자료 다운로드 카드
3. **학습 목표** — `ol.steps`로 N개 항목
4. **시간표/일정** — `table.timetable` 또는 본 일정 표
5. **본문 N파트** — `h2.section` + 하위 `h3.subsection`
6. **(선택) 코드 자료실** — `.code-tab` 탭 전환 코드 블록
7. **(선택) FAQ** — `details.faq` 아코디언
8. **(선택) 용어 사전** — `table.data`
9. **(선택) 다음 단계 / 응용 가이드** — (옵션) 카카오 오픈채팅 카드로 후속 커뮤니티 안내
10. **푸터** — 빌드 일자 / 강사 / 소속

**차시 vs 부 표기**: 정규 차시(50분 단위) 운영이면 `1차시 / 2차시 ...`, 자유 흐름·압축 시간이면 `1부 / 2부 ...`. 사용자가 명시 안 하면 시간 구조 보고 결정.

**LIVE 모듈 켜진 경우 압축 가이드**: 일정표·외부 참고 자료 목록·산출물 체크리스트·정적 빠른 인덱스(프롬프트 자료실 등)는 채팅으로 대체 가능하므로 사용자와 협의해 제거 또는 축약 가능. 다만 다운로드 카드(`partials/live-module` 외 별도 컴포넌트)는 LIVE 여부와 무관하게 유지 권장.

### 3단계 — HTML 조립

1. `template.html` 전문을 그대로 복사해 `<폴더명>/index.html`에 둔다
2. **테마 적용** (기본 ocean-coral 외 선택 시): `themes/<name>.css` 전문을 읽어 index.html의 `/* ▼ THEME_TOKENS_START ▼ */` ~ `/* ▲ THEME_TOKENS_END ▲ */` 블록을 통째로 교체. 단일 HTML 원칙은 유지 — 외부 CSS 링크 추가 금지
3. 본문 영역 `<!-- ▼ MAIN_CONTENT_START ▼ -->` ~ `<!-- ▲ MAIN_CONTENT_END ▲ -->` 사이를 채운다
4. 사이드바 TOC `<!-- ▼ TOC_ENTRIES_START ▼ -->` ~ `<!-- ▲ TOC_ENTRIES_END ▲ -->` 사이를 채운다 (앵커는 `#section-id` 형식)
5. 표지 영역(`<section class="cover">`)의 메타·제목·서브타이틀·`data-deco` 속성을 채운다
6. 푸터(`<footer class="footer">`) 메타를 채운다
7. 컴포넌트는 `components.md` 카탈로그에서 골라 사용 — 임의로 새 클래스 만들지 말 것
8. **`--live=<room_id>` 옵션 켜진 경우 LIVE 모듈 통합**:
   - `partials/live-module/live-chat.css` 전문을 `</style>` 직전 삽입
   - `partials/live-module/live-chat-toggle.html`을 `<button id="toc-toggle">` 옆에 삽입
   - `partials/live-module/live-chat-toc-footer.html`을 `<aside class="toc">` 마지막 `</aside>` 직전 삽입
   - `partials/live-module/live-chat-panel.html`을 `</main>` 직후 (`.layout` 닫는 `</div>` 직전) 삽입
   - `partials/live-module/live-chat.js`를 기존 `<script>` 다음 새 `<script type="module">` 안에 넣고 `const ROOM_ID = "PLACEHOLDER_ROOM_ID";`를 실제 ROOM_ID로 치환
   - `partials/live-module/firestore-rules.snippet`을 본인 프로젝트의 `firestore.rules`에 추가 후 `firebase deploy --only firestore:rules --project <YOUR_PROJECT_ID>`
   - "시작하며" 활용법 박스에 채팅·팔로우 안내 한 줄 추가 (`partials/live-module/README.md` 끝 안내 참조)
9. **`--slides=<경로>` 옵션 켜진 경우 SLIDE 모듈 통합** (LIVE 모듈 통합이 선행돼야 함):
   - 슬라이드 PNG 추출: `PYTHONIOENCODING=utf-8 python tools/slides_to_png.py <슬라이드.pptx|pdf> <폴더명>` → `<폴더명>/slides/01.png …` 생성 + **원본을 `slides/lecture.<ext>`로 복사**(다운로드용) + `window.SLIDES`·`window.SLIDES_PPT` 스캐폴드 stdout
   - `partials/slide-module/slide-viewer.css` 전문을 `</style>` 직전(live-chat.css 다음) 삽입
   - `slide-viewer.html`의 **(A) 미니 패널**을 `<aside class="toc" id="toc">` 시작 직후 `<div class="topbar">` 바로 위에 삽입
   - `slide-viewer.html`의 **(C) 발표 오버레이+라이트박스**를 `.layout` 닫는 `</div>` 다음(live-chat-panel.html과 같은 영역)에 삽입
   - `slide-viewer.html`의 **(D) 강의 PPT 다운로드 카드**를 본문 맨 끝, `<div class="footer">` 바로 위에 삽입(인용 안내 문구 포함). `window.SLIDES_PPT`가 비면 자동 숨김
   - `<body>`에 `has-slides` 클래스 추가
   - `slide-viewer.html`의 **(B) SLIDES 매핑**을 삽입하고, 스캐폴드의 각 `section: null`을 본문 앵커 id(예: `section-2`)로 채운다 — **유연 매핑**(여러 슬라이드→한 섹션 OK, 점프 불필요 시 null). 원고·슬라이드 대조해 1차 제안 후 사용자 확인. 같은 블록의 `window.SLIDES_PPT`·`window.SLIDES_PPT_NAME`을 1단계 스캐폴드 값으로 채운다(다운로드 카드 활성화)
   - `partials/slide-module/slide-sync.js` 전문을 **`live-chat.js` 다음**, 같은 `<script type="module">` 안에 이어붙임(스코프 공유 필수). 발표 화면은 넘김 즉시 로컬 갱신(낙관적)+인접 슬라이드 프리로드로 지연이 없고, 왼쪽 섹션 목차로 임의 점프, 발표 전·종료 후엔 수강생 미니패널이 표지로 고정된다. '발표 시작'은 새 창으로 열린다
   - Firestore 규칙은 LIVE 모듈 스니펫에 이미 `currentSlide`가 포함됨 — LIVE 배포로 충분. **기존 LIVE 룸에 SLIDE를 켜는 경우 규칙 재배포 필수**(`currentSlide` 화이트리스트)
   - "시작하며" 활용법 박스에 좌상단 슬라이드 안내 한 줄 추가 (`partials/slide-module/README.md` 참조)

### 4단계 — 검증 체크리스트

빌드 후 반드시 확인:

- [ ] **`tools/check_overflow.py <폴더>/index.html` 실행** — 정적 1차 필터(긴 코드 줄, 넓은 테이블, 깨진 TOC 앵커, 모바일 초과 width). Playwright 설치돼 있으면 동적 검사도 자동 실행
- [ ] `<title>` 태그가 표지 제목과 일치
- [ ] 사이드바 TOC 모든 링크가 본문에 실제 앵커가 있는 섹션을 가리킴 (check_overflow가 잡아냄)
- [ ] 코드 블록은 `<pre><code class="language-XXX">…</code></pre>` 형태 — `<` `>` `&`은 HTML 엔티티로 이스케이프
- [ ] `.code-tab[data-tab-group="X"]`의 `data-tab-group`과 `.code-pane[data-pane="X-key"]`의 prefix가 일치
- [ ] 인쇄 시 사이드바·진행률 바가 숨겨지는지 (`@media print` 이미 적용됨)
- [ ] CDN(Pretendard, Prism) 링크 살아 있는지
- [ ] **LIVE 모듈 켜진 경우 추가 검증**:
  - [ ] `ROOM_ID = "PLACEHOLDER_ROOM_ID"` 잔재 없음 (실제 값으로 치환됐는지)
  - [ ] Firestore 규칙에 `<room_id>_chat`, `<room_id>_room` 두 컬렉션이 추가되고 배포됐는지 (배포 후 콘솔에서 권한 오류 없는지)
  - [ ] 데스크탑·모바일 모두에서 채팅창이 보이고, 닉네임 모달이 첫 진입 시 한 번 뜨는지
  - [ ] 강사 Google 로그인 후 TOC 하단 컨트롤이 나타나고, 모드 토글(활성/잠금/숨김) 변경이 다른 브라우저에 반영되는지
  - [ ] 데스크탑에서 topbar(글자/다크/인쇄)가 채팅 헤더 안으로 흡수돼 본문과 겹치지 않는지
- [ ] **SLIDE 모듈 켜진 경우 추가 검증**:
  - [ ] `<폴더명>/slides/01.png …` 가 실제 생성됐고 개수가 `window.SLIDES`와 일치
  - [ ] `<폴더명>/slides/lecture.<ext>`(원본 다운로드본)이 복사됐고 `window.SLIDES_PPT`가 그 경로를 가리킴
  - [ ] `window.SLIDES`의 모든 `section` 값(null 제외)이 본문에 실제 존재하는 앵커 id를 가리킴
  - [ ] 발표 시작 전·종료 후 좌상단 미니패널이 **표지(1번 슬라이드)로 고정**되고, 라벨이 "표지"인지(발표 중에는 "강사 진행" + 빨강 dot)
  - [ ] 본문 맨 끝 **다운로드 카드**가 보이고 PPT가 받아지며, 그 아래 **인용 안내 문구**가 노출되는지
  - [ ] `?present`로 발표 모드 진입(새 창) → Google 로그인 시 하단 배지가 "LIVE 송출 중"으로 바뀌고, ←→/Space/클릭으로 슬라이드가 **지연 없이** 넘어가는지(프리로드). 왼쪽 섹션 목차 클릭 시 해당 슬라이드로 점프하는지
  - [ ] **두 번째 브라우저(수강생)**에서 강사가 슬라이드를 넘길 때 ① 좌상단 미니 슬라이드 이미지 교체, ② 매핑된 섹션으로 스크롤 동기화, ③ 미니패널을 확대(라이트박스)해 둔 상태면 확대 이미지도 따라 바뀌는지
  - [ ] 강사가 발표를 **종료(Esc/✕)하면** 수강생 미니패널이 표지로 복귀하는지(`followActive=false`)
  - [ ] 수강생이 직접 스크롤하면 추종 해제 + "📡 강사 따라가기" FAB 등장, 클릭 시 재개되는지(LIVE 팔로우 재사용). 강사 팔로우 OFF면 FAB가 뜨지 않는지
  - [ ] 콘솔에 Firestore 권한 오류(`currentSlide` 화이트리스트 누락) 없는지

### 5단계 — 사용자 확인 + 후속

- 빌드 완료 후 줄 수·크기·섹션 수 보고
- 빌드된 `index.html`은 단일 파일이라 임의 정적 호스팅(Firebase Hosting·GitHub Pages·Netlify·Vercel 등)에 그대로 올리면 된다 (이 스킬은 빌드만 담당 — 배포는 분리)
- 추가 보강이 필요한 영역(코드 샘플 더, FAQ 더, 응용 아이디어 더 등)을 한 줄로 안내

## 디자인 원칙 (불변)

- **테마 토큰 슬롯 고정** — `--navy / --deep / --teal / --mist / --cream / --coral / --amber / --ink / --muted / --rule / --bg / --fg / --card / --code-bg / --shadow / --base-fs`. 변수명 추가 금지. 색상은 `themes/<name>.css`에서만 조정
- **테마는 `themes/` 4종 중 선택** — ocean-coral / forest-academic / berry-kids / charcoal-pro. 새 테마는 같은 변수 슬롯을 채우는 CSS 1개 추가
- **Pretendard** 웹폰트 — 다른 폰트 추가 금지 (kids 테마는 18px 본문)
- **다크모드** 자동 토글 — `[data-theme="dark"]` 변수 오버라이드만 사용 (모든 테마가 라이트+다크 한 쌍)
- **컴포넌트 재사용** — `components.md`에 없는 패턴은 만들지 말 것. 정말 필요하면 `components.md`도 함께 갱신
- **단일 파일** — 외부 CSS/JS 추출 금지. CDN 의존은 Pretendard + Prism만. 테마는 `<style>` 안에 인라인

## 작성 톤 (강의 핸드북 특화)

- **대화체로 풀어쓴다** — "~합니다" 종결, 강사가 옆에서 말하는 듯한 흐름
- **강사 멘트 직인용은 `blockquote.quote-mic`** — 마이크 아이콘이 자동으로 붙는다
- **핵심 한 줄은 `.key-term`** — 외워야 할 정의·모토에만 사용 (남발 금지)
- **위험·주의는 `.callout.danger / .callout.warn`** — 보안·실수·함정에만
- **팁·메모는 `.callout.tip / .callout.note`**
- 인라인 코드는 `<code>` (자동 스타일), 키보드 단축키는 `<kbd>`

## 참조 파일

이 스킬 폴더 안:

- `template.html` — 빌드 시작점이 되는 전체 HTML 스캐폴드 (CSS 변수 영역은 `THEME_TOKENS_START/END` 마커로 감싸져 있음). 다운로드 카드 / 카카오 오픈채팅 카드 / YouTube 영상 카드 CSS 포함
- `components.md` — 사용 가능한 컴포넌트 카탈로그(스니펫 + 사용 예). 카드 3종(20-A/B/C) 포함
- `themes/<name>.css` — 4종 테마 토큰 (ocean-coral / forest-academic / berry-kids / charcoal-pro)
- `partials/live-module/` — **강의 실시간 운용 옵션 모듈** (채팅·강사 인증·팔로우·모드 제어)
  - `README.md` — 통합 절차 / 옵션 줄여쓰기 가이드
  - `live-chat.css` / `live-chat-*.html` / `live-chat.js`
  - `firestore-rules.snippet` — Firestore 보안 규칙 패턴 (`currentSlide` 포함 — SLIDE 모듈 공유)
- `partials/slide-module/` — **슬라이드 핸드북 옵션 모듈** (LIVE 확장: 발표 슬라이드 표시 + 슬라이드↔섹션 동기화)
  - `README.md` — 통합 절차 / 강사 현장 사용법
  - `slide-viewer.css` / `slide-viewer.html` / `slide-sync.js`
- `tools/check_overflow.py` — 빌드 후 정적+동적 오버플로우 점검 스크립트
- `tools/slides_to_png.py` — 슬라이드(PPTX/PDF) → `slides/NN.png` 변환 + SLIDES 스캐폴드 출력

## 안티 패턴 (하지 말 것)

- 표지 디자인을 매번 다시 만들기 — `template.html`의 `.cover`만 사용
- 새 색깔 추가 — 팔레트가 흔들리면 시리즈 일관성이 깨진다
- 외부 CSS 프레임워크(Tailwind, Bootstrap 등) 추가 — 단일 파일 원칙 위배
- 내용 없이 컴포넌트로만 화려하게 채우기 — 핸드북은 글이 본체다
- 마크다운을 그대로 줄바꿈만 바꿔서 붙이기 — 강의 톤으로 한 번 더 풀어쓰기

## 트리거 예시

- "이 강의 원고를 핸드북으로 만들어줘"
- "/handbook 세션2_원고.md"
- "교재를 HTML로 빌드"
- "연수 자료 한 페이지 웹사이트로"
- "선생님들에게 배포할 안내 핸드북"
- "강의 중 실시간 채팅·팔로우 모드가 되는 핸드북" → `--live=<room_id>` 적용
- "강사 슬라이드를 좌상단에 띄우고 슬라이드 넘기면 본문이 따라가는 슬라이드 핸드북" → `--slides=<경로>` + `--live=<room_id>` 적용

## 사용 후 권장 후속

빌드된 `<폴더명>/index.html`을 정적 호스팅(Firebase Hosting·GitHub Pages·Netlify·Vercel 등)에 업로드하면 공개 URL이 된다. LIVE/SLIDE 모듈을 켰다면 Firestore 보안 규칙 배포(`firebase deploy --only firestore:rules`)를 잊지 말 것.
