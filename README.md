# handbook — 강의 핸드북 HTML 빌더 (Claude Code Skill)

마크다운 강의 원고나 한 줄 주제를 받아 **단일 HTML 파일**의 강의 핸드북·교재·연수 자료로 빌드하는 [Claude Code](https://claude.com/claude-code) 스킬입니다. Pretendard 웹폰트·다크모드·사이드바 TOC·코드 하이라이팅·인쇄 CSS가 기본 내장되어 있고, 4종 테마 프리셋과 두 개의 선택형 실시간 모듈(LIVE·SLIDE)을 제공합니다.

> *A Claude Code skill that turns lecture notes into a single self-contained HTML handbook — themes, dark mode, TOC, print CSS, and optional live chat / slide-sync modules built in.*

## 특징

- **단일 자체완결 HTML** — CSS·JS 인라인. 외부 의존은 CDN의 Pretendard·Prism뿐. 아무 정적 호스팅(GitHub Pages·Netlify·Vercel·Firebase Hosting)에 그대로 올리면 됩니다.
- **4종 테마 프리셋** — CSS 변수 슬롯만 교체하는 구조라 컴포넌트는 그대로 둔 채 분위기만 바뀝니다.

  | 테마 | 분위기 | 용도 |
  |---|---|---|
  | `ocean-coral` (기본) | 네이비 × 티얼 × 코랄 | 일반 강의·연수 |
  | `forest-academic` | 포레스트 그린 × 머스타드 | 논문·연구 보고서 |
  | `berry-kids` | 베리 × 코랄 × 라임, 18px 본문 | 초등·어린이 교재 |
  | `charcoal-pro` | 차콜 × 슬레이트 × 블루 | 개발·테크 핸드북 |

- **LIVE 모듈 (선택)** — Firestore 기반 실시간 채팅 + 강사 Google 인증 + 채팅 모드 제어 + 강사 팔로우 모드(강사가 스크롤하면 수강생 화면이 함께 이동). [`partials/live-module/README.md`](partials/live-module/README.md)
- **SLIDE 모듈 (선택)** — 강사 발표 슬라이드를 핸드북 좌상단에 띄우고, 강사가 슬라이드를 넘기면 수강생 본문이 매핑된 섹션으로 스크롤됩니다(슬라이드 핸드북). LIVE 모듈 위에 얹힙니다. [`partials/slide-module/README.md`](partials/slide-module/README.md)

## 설치

이 레포를 Claude Code 스킬 디렉토리에 `handbook`이라는 이름으로 두면 됩니다.

```bash
git clone https://github.com/imsebeom/handbook.git ~/.claude/skills/handbook
```

이후 Claude Code에서 `/handbook` 으로 호출하거나 자연어("이 원고를 핸드북으로 만들어줘")로 트리거됩니다. 전체 워크플로·옵션은 [`SKILL.md`](SKILL.md)에 정의돼 있습니다.

## 사용법

```
/handbook [원고경로 또는 주제] [폴더명] [--theme=<name>] [--live=<room_id>] [--slides=<pptx|pdf 경로>]
```

- 원고(`.md`) 경로를 주면 그 내용을 핸드북 구조로 재조립합니다.
- 주제 한 줄만 주면 8~10개 섹션 구성안을 먼저 제안한 뒤 빌드합니다.
- `--theme` 생략 시 `ocean-coral`이 기본값입니다.
- `--live` / `--slides`는 실시간 운영이 필요할 때만 사용합니다(아래 Firebase 설정 필요).

산출물은 `<폴더명>/index.html` 단일 파일(보통 1500~2500줄, 60~120KB)입니다.

## LIVE / SLIDE 모듈을 쓰려면 (Firebase 설정 필수)

실시간 모듈은 본인의 Firebase 프로젝트가 필요합니다. 이 레포의 Firebase 값은 **모두 자리표시자**이므로 반드시 본인 값으로 교체하세요.

1. Firebase 프로젝트를 만들고 **Firestore**와 **Google 인증**을 활성화합니다.
2. [`partials/live-module/live-chat.js`](partials/live-module/live-chat.js) 상단의 `firebaseConfig`와 `ADMIN_EMAIL`(관리자=강사 Google 계정)을 본인 값으로 교체합니다.

   ```js
   const ADMIN_EMAIL = "YOUR_ADMIN_EMAIL@example.com";  // ← 본인 계정
   const firebaseConfig = { apiKey: "YOUR_API_KEY", projectId: "YOUR_PROJECT_ID", ... };
   ```

3. [`partials/live-module/firestore-rules.snippet`](partials/live-module/firestore-rules.snippet)의 보안 규칙을 본인 `firestore.rules`에 추가하고 배포합니다.

   ```bash
   firebase deploy --only firestore:rules --project YOUR_PROJECT_ID
   ```

> 채팅(`<room_id>_chat`)은 누구나 쓰기가 가능하고, 룸 상태(`<room_id>_room`)는 `ADMIN_EMAIL` 계정만 쓸 수 있도록 규칙으로 제한됩니다. 자리표시자를 본인 값으로 바꾸지 않으면 동작하지 않습니다.

## 디렉토리 구조

```
handbook/
├── SKILL.md              # 스킬 정의 · 빌드 워크플로 (Claude Code가 읽음)
├── template.html         # 단일 HTML 스캐폴드(빌드 시작점)
├── components.md         # 컴포넌트 카탈로그(스니펫 + 사용 예)
├── themes/               # 4종 테마 토큰 CSS
├── partials/
│   ├── live-module/      # 실시간 채팅 + 강사 팔로우 (Firestore)
│   └── slide-module/     # 슬라이드 핸드북 (LIVE 확장)
└── tools/
    ├── check_overflow.py # 빌드 후 오버플로우 점검
    └── slides_to_png.py  # PPTX/PDF → slides/NN.png 변환
```

## 라이선스

[MIT](LICENSE)
