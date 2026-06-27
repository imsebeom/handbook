# Handbook 컴포넌트 카탈로그

`template.html`에 박힌 디자인 시스템에서 사용 가능한 모든 컴포넌트의 마크업 패턴.
**여기 없는 패턴은 만들지 말 것.** 정말 필요하면 `template.html`의 CSS와 이 문서를 함께 갱신.

---

## 1. 표지 (Cover)

표지는 `template.html`에 이미 자리가 잡혀 있다. 데코 글자(②, §, ★ 등)는 `data-deco` 속성으로 바꿀 수 있다.

```html
<section class="cover" data-deco="②">
  <div class="eyebrow">2026 「예시 강의」 · 입문형 · 세션 ②</div>
  <h1>바이브에<br><span class="accent">다이브</span> 하다.</h1>
  <div class="subtitle">앱스크립트로 코딩의 기본기 익히기 — 60분 핸드북</div>

  <div class="meta">
    <div><strong>일시</strong><span>2026-05-23(토) 10:30 – 11:30</span></div>
    <div><strong>장소</strong><span>○○센터</span></div>
    <div><strong>강사</strong><span>홍길동 · ○○초등학교</span></div>
    <div><strong>주관</strong><span>○○교육청</span></div>
  </div>
</section>
```

**팁**: `data-deco` 글자는 표지 우상단에 거대하게 워터마크처럼 배치된다. 한 글자(②, §, ★, 0~9)나 짧은 기호가 가장 잘 어울린다. 길면 잘려 나온다.

---

## 2. 섹션 헤더 (h2.section)

본문의 큰 챕터 구분. 반드시 직전에 anchor span을 둔다 (사이드바 TOC 동기화에 필수).

```html
<span id="part1" class="anchor"></span>
<h2 class="section"><span class="num">1.</span>1차시 화면의 한계</h2>
```

`<span class="num">` 안의 내용은 자유 — 숫자, ※, §, 아이콘 등.

---

## 3. 하위 섹션 (h3.subsection)

```html
<span id="part1-why" class="anchor"></span>
<h3 class="subsection">왜 사라지는가</h3>
```

---

## 4. 강사 멘트 인용 (blockquote.quote-mic)

마이크 아이콘 🎤이 우상단에 자동으로 박힌다. 강사가 옆에서 말하는 듯한 직인용 멘트에 사용.

```html
<blockquote class="quote-mic">
<p>"선생님들 직접 해 보셨겠지만, 캔버스에서 만든 화면은 새로고침하는 순간 입력한 게 다 사라집니다. 이건 수업 도구로 쓸 수 없습니다."</p>
</blockquote>
```

**주의**: 일반 `<blockquote>`는 인용·강조용으로 따로 작동한다. 강사 멘트가 아니면 `quote-mic` 클래스 빼기.

---

## 5. 콜아웃 4종 (Callout)

| 클래스 | 용도 | 색상 |
|---|---|---|
| `.callout.tip` | 팁, 권장 사항 | teal |
| `.callout.warn` | 주의, 함정 | coral |
| `.callout.danger` | 보안 위험, 절대 하지 말 것 | red |
| `.callout.note` | 메모, 보충 설명 | deep blue |

```html
<div class="callout tip">
  <h4>💡 가장 중요한 30초</h4>
  <p>시트 → 앱스크립트 → 웹앱. 이 세 글자만 다시 따라 해 보시면 절반 이상 가신 겁니다.</p>
</div>

<div class="callout danger">
  <h4>🛑 절대로 클라이언트에 박지 말 것</h4>
  <ul>
    <li><strong>API 키</strong> — 학생이 F12로 발견해서 본인 친구들 사이에 공유하면 끝.</li>
  </ul>
</div>
```

**원칙**: `danger`는 보안·법적 위험에만, `warn`은 실수·함정에만. 남발하면 시각적 무게가 무뎌진다.

---

## 6. 핵심 키워드 박스 (.key-term)

외워야 할 정의·모토에만 사용. 한 핸드북에 3~5개를 넘지 않도록.

```html
<div class="key-term">
  <span class="label">한 줄 모토</span>
  <strong>클라이언트에는 보안이 없다. 비밀은 서버에 둔다.</strong>
</div>
```

`<span class="label">`은 좌상단에 작은 산호색 배지로 표시된다. 라벨 텍스트는 짧게 (예: 정의, 모토, 핵심, 공식).

---

## 7. 단계 카드 (ol.steps)

자동 번호 매김 + 둥근 산호색 원형 번호. 학습 목표·실습 단계·체크리스트에 사용.

```html
<ol class="steps">
  <li>
    <h4>FE / BE / DB를 한 문장으로 설명</h4>
    <p>옆 사람에게 "프론트엔드는 보여주는 사람"이라고 막힘없이 말할 수 있다.</p>
  </li>
  <li>
    <h4>"클라이언트에는 보안이 없다"는 한 줄을 자기 말로 풀이</h4>
    <p>왜 API 키를 프론트엔드에 박으면 안 되는지 학생 시나리오로 설명할 수 있다.</p>
  </li>
</ol>
```

CSS의 `counter-reset: step` 덕에 번호는 자동. `<h4>`는 카드 안에서 굵은 제목으로, `<p>`는 풀이로 쓰인다.

---

## 8. 흐름 다이어그램 (.flow)

가로 흐름 노드 + 산호색 화살표. 단계가 적을수록(3~5개) 읽기 좋다.

```html
<div class="flow">
  <div class="node"><span class="ico">📊</span><div class="lbl">시트 생성</div><div class="sub">sheets.new</div></div>
  <div class="arr">→</div>
  <div class="node"><span class="ico">🛠</span><div class="lbl">Apps Script</div><div class="sub">확장 프로그램</div></div>
  <div class="arr">→</div>
  <div class="node"><span class="ico">🚀</span><div class="lbl">새 배포</div><div class="sub">웹앱</div></div>
</div>
```

노드별 배경색을 다르게 주려면 `style="border-color:var(--coral);"` 같은 인라인 오버라이드.

---

## 9. 두 사람 비교 (.twoperson)

좌우 대비 카드 + 가운데 양방향 화살표. FE/BE, 전/후, A안/B안 비교에 적합.

```html
<div class="twoperson">
  <div class="person fe">
    <h4>👁 보여주는 사람</h4>
    <div class="role">프론트엔드 · 클라이언트</div>
    <ul>
      <li>사용자 눈앞에 보이는 모든 것</li>
      <li>HTML / CSS / JavaScript</li>
    </ul>
  </div>
  <div class="arrow">⇆</div>
  <div class="person be">
    <h4>🧠 기억하는 사람</h4>
    <div class="role">백엔드 · 서버</div>
    <ul>
      <li>데이터를 다룸</li>
      <li>구글 서버에서 실행</li>
    </ul>
  </div>
</div>
```

`.fe`는 산호색 테두리, `.be`는 딥블루 테두리. 모바일에서는 자동 1열 + 화살표 90도 회전.

---

## 10. 두 칸 카드 (.twocol)

같은 위계 카드 2개를 나란히. 모바일에서는 1열로 자동 전환.

```html
<div class="twocol">
  <div class="card" style="border-left:5px solid var(--deep);">
    <h4>🛡 관리자 페이지</h4>
    <ul>
      <li>학생용 화면: <code>?view=student</code></li>
      <li>선생님 화면: <code>?view=admin</code></li>
    </ul>
  </div>
  <div class="card" style="border-left:5px solid var(--coral);">
    <h4>📥 CSV 다운로드 버튼</h4>
    <ul>
      <li>한 클릭으로 학기 데이터 추출</li>
    </ul>
  </div>
</div>
```

---

## 11. 일반 카드 (.card)

가벼운 박스. 소개·예시·비유 정리 등 다목적.

```html
<div class="card">
  <h4>비유 ─ 식당으로 보면</h4>
  <p><strong>프론트엔드</strong>는 <em>홀</em>이고, <strong>백엔드</strong>는 <em>주방</em>입니다.</p>
</div>
```

---

## 12. 시간표 (table.timetable)

상단 다크 헤더 + 시간 셀이 산호색 강조.

```html
<table class="timetable">
  <thead>
    <tr><th>시각</th><th>분량</th><th>내용</th></tr>
  </thead>
  <tbody>
    <tr><td class="time-cell">10:30 – 10:35</td><td>5분</td><td>도입 — 새로고침 = 데이터 증발</td></tr>
    <tr><td class="time-cell">10:35 – 10:43</td><td>8분</td><td>핵심 개념 — FE / BE / DB / CRUD</td></tr>
  </tbody>
</table>
```

`time-cell` 클래스를 단 셀은 자동으로 `white-space: nowrap`이라 줄바꿈 안 됨.

---

## 13. 일반 표 (table.data)

용어 사전, 비교표, 응용 예시 등.

```html
<table class="data">
  <thead><tr><th style="width:25%;">용어</th><th>풀이</th></tr></thead>
  <tbody>
    <tr><td><strong>프론트엔드</strong></td><td>사용자 눈에 보이는 화면.</td></tr>
    <tr><td><strong>백엔드</strong></td><td>화면 뒤에서 데이터를 다루는 부분.</td></tr>
  </tbody>
</table>
```

다크모드에서 `th` 배경이 navy → white로 자동 전환.

---

## 14. FAQ 아코디언 (details.faq)

펼침/접힘 동작은 브라우저 기본 `<details>` 활용. JS 불필요.

```html
<details class="faq">
  <summary>Q. 학교 계정으로 만든 앱을 학생들과 공유해도 안전한가요?</summary>
  <div class="faq-body">
    <p>안전합니다. 단 두 가지를 지켜주세요. (1) 액세스 권한을 "도메인 내"로 좁히고, (2) 학생 개인정보(주민번호 등)는 절대 시트에 저장하지 마세요.</p>
  </div>
</details>
```

`summary` 앞 ▸ 화살표가 펼침 시 90도 회전.

---

## 15. 코드 탭 전환 (.code-tab + .code-pane)

여러 파일을 하나의 코드 블록 그룹으로 묶어 탭 전환. `data-tab-group`과 `data-pane`의 prefix를 일치시켜야 한다.

```html
<div class="code-tab" data-tab-group="v1">
  <button class="active" onclick="switchTab(this,'v1','code-gs')">Code.gs</button>
  <button onclick="switchTab(this,'v1','index-html')">index.html</button>
</div>

<div class="code-pane active" data-pane="v1-code-gs">
<pre><code class="language-javascript">function doGet() { ... }</code></pre>
</div>

<div class="code-pane" data-pane="v1-index-html">
<pre><code class="language-markup">&lt;!DOCTYPE html&gt; ...</code></pre>
</div>
```

**주의**:
- 첫 탭 버튼과 첫 pane에 `active` 클래스를 박아야 첫 진입 시 보인다
- `data-pane`은 `<group>-<key>` 형식. group 이름은 알파벳·숫자만 (CSS 선택자 호환)
- HTML 코드를 보여줄 땐 `<` `>` `&`을 엔티티로 이스케이프

---

## 15-B. 코드/프롬프트 복사 버튼 (.copy-btn) — 자동 삽입

`pre[class*="language-"]`와 `pre.plain` 전부에 template.html의 JS가 **복사 버튼을 자동 삽입**한다. 별도 마크업 불필요 — `<pre><code>` 구조만 지키면 된다.

- 클릭 시 `<code>`의 innerText를 클립보드에 복사, "복사됨 ✓" 1.5초 표시
- `<code>` 자식이 없는 `<pre>`는 건너뛴다 (버튼 텍스트 혼입 방지)
- 인쇄 시 자동 숨김 (`@media print`)
- 연수 핸드북의 "따라 치는 프롬프트" 박스가 주 용도 — 수강생이 그대로 복사해 붙여넣는다

---

## 16. 인라인 코드 / 키보드 단축키 / 배지

```html
<p>단축키 <kbd>Ctrl</kbd>+<kbd>S</kbd>로 저장.</p>
<p>함수명은 <code>doGet</code>. URL 끝에 <code>?view=admin</code>을 붙이면 관리자 페이지.</p>
<span class="badge">기본</span>
<span class="badge coral">중요</span>
<span class="badge teal">참고</span>
```

`<code>` 자체에 자동 스타일이 들어간다. 별도 CSS 추가 금지.

---

## 17. 큰 인용 / 한 줄 메시지

평범한 `<blockquote>`. 마이크 없음. 책의 챕터 도입부 카피, 핵심 인사이트에 사용.

```html
<blockquote>
<p style="font-size:24px; line-height:1.5; color:var(--navy); font-style:normal; font-weight:700;">
화면은 만들었다.<br>
이제 그 뒤에 <span style="color:var(--coral);">"기억하는 사람"</span>을 붙인다.
</p>
</blockquote>
```

---

## 18. 구분선 (hr.div)

섹션 마무리에 점선 구분.

```html
<hr class="div">
```

---

## 19. 푸터 (.footer)

마지막에 한 번. 빌드 일자·강사·URL 등.

```html
<div class="footer">
  <p><strong>2026 「예시 강의」 입문형 · 세션 ② 강의 핸드북</strong></p>
  <p>강사 홍길동 (○○초등학교) · 주관 ○○교육청</p>
  <p>핸드북 빌드 2026-05-10 · <a href="https://your-host.example.com/handbook-session2/">your-host.example.com/handbook-session2</a></p>
</div>
```

---

## 20-A. 다운로드 카드 (.download-card)

자료 PDF·슬라이드·예시 데이터 등 한 줄 다운로드용 카드. 메인 권장 자료는 `featured` 변형으로 강조.

```html
<h4>📦 강의 자료 다운로드</h4>

<div class="download-card featured">
  <span class="dc-ico">📊</span>
  <div class="dc-body">
    <strong>2605 신기초 연수 슬라이드</strong>
    <span class="dc-meta">PPTX · 약 27MB · 강의 본 슬라이드 원본</span>
  </div>
  <a class="dc-btn" href="assets/2605%20%EC%8B%A0%EA%B8%B0%EC%B4%88%20%EC%97%B0%EC%88%98.pptx" download>다운로드</a>
</div>

<div class="download-card">
  <span class="dc-ico">📘</span>
  <div class="dc-body">
    <strong>2022 개정 초등학교 교육과정</strong>
    <span class="dc-meta">PDF · 약 6.4MB · Gem 지식파일용</span>
  </div>
  <a class="dc-btn" href="assets/curriculum.pdf" download>다운로드</a>
</div>
```

**규칙**:
- 파일은 `<폴더>/assets/`에 두고 상대경로 `assets/파일.확장자` 사용
- 한글·공백 파일명은 percent-encoding (브라우저는 호환성 좋지만 안전하게)
- `featured`는 한 페이지에 1~2개만 — 강조가 무뎌진다
- 파일 종류(PDF/PPTX/CSV/ZIP)별 아이콘은 `dc-ico`에 이모지로

---

## 20-B. 카카오 오픈채팅 카드 (.openchat-card)

강의 후속 커뮤니티·질문방 안내. 카카오 노란색이라 시각적으로 튄다.

```html
<a class="openchat-card" href="https://open.kakao.com/o/xxxxxxxx" target="_blank" rel="noopener" style="text-decoration:none;">
  <span class="oc-ico">💛</span>
  <div class="oc-body">
    <strong>선생님을 위한 생성형 AI · 카카오 오픈채팅</strong>
    <span class="oc-meta">강의 이후 질문·자료 공유 · 교사 커뮤니티</span>
  </div>
  <span class="oc-btn">입장하기</span>
</a>
```

**규칙**: 한 핸드북에 보통 시작(시작하며 끝) + 마지막(마무리) 2회면 충분. 본문 사이에 끼우면 흐름이 끊긴다.

---

## 20-C. YouTube 영상 카드 (.video-card)

본문 흐름 안에 인라인으로 박는 영상 안내. 외부 임베드(iframe) 대신 썸네일 + 외부 링크 — 광고·쿠키 없이 가볍다.

```html
<a class="video-card" href="https://www.youtube.com/watch?v=XwjfzwR4XO0" target="_blank" rel="noopener">
  <span class="thumb">
    <img src="https://img.youtube.com/vi/XwjfzwR4XO0/hqdefault.jpg" alt="영상 썸네일" loading="lazy">
    <span class="play">▶</span>
  </span>
  <span class="vc-body">
    <span class="vc-title">관련 영상 보기 — "AI 먼저 쓴 사람이 오히려 뒤쳐지는 이유"</span>
    <span class="vc-meta"><span class="yt">YouTube</span> · 새 창에서 열기</span>
  </span>
</a>
```

**규칙**:
- YouTube 영상 ID(예: `XwjfzwR4XO0`)는 URL `v=` 뒤 11자
- 썸네일 URL 패턴: `https://img.youtube.com/vi/<ID>/hqdefault.jpg`
- 임베드(iframe) 절대 쓰지 말 것 — 페이지 무거워지고 광고 노출
- `.key-term`·`.callout` 박스 안에 넣어 "이 모토와 관련된 영상" 형태로 사용 시 자연스러움

---

## 20. 강사용 체크리스트 패턴

마크다운 체크박스(`- [ ]`)는 그대로 안 박힌다. HTML로 일반 `<ul>`에 풀어쓰는 게 자연스럽다.

```html
<div class="callout tip">
  <h4>📋 강사 사전 점검 체크리스트</h4>
  <ul>
    <li>슬라이드 12장 미리 풀로 한 번 돌려보기</li>
    <li>액세스 승인 화면을 영상으로 백업</li>
    <li>OBS 데모 녹화 백업 1개</li>
  </ul>
</div>
```

---

## 색 변수 참조 (CSS 변수)

인라인 색상이 필요할 때 **반드시 변수로 참조**. 하드코딩 금지.

| 변수 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `--navy` | #0B2A4A | #cfe3ee | 가장 어두운 강조, 본문 굵은 |
| `--deep` | #065A82 | #6cb7d6 | 메인 딥블루, 링크 |
| `--teal` | #1C7293 | #8ec5da | 보조 청록 |
| `--mist` | #CFE3EE | #2a3f55 | 라이트 배경 |
| `--cream` | #F4F8FB | #0f1822 | 본문 보조 배경 |
| `--coral` | #F4A261 | (동일) | 강조 산호 |
| `--amber` | #FFB454 | (동일) | 강조 보조 |
| `--ink` | #1A1A1A | #e8eef3 | 본문 검정 |
| `--muted` | #5C6670 | #9aa7b3 | 캡션·보조 텍스트 |
| `--rule` | #D8E3EA | #2a3f55 | 분리선 |

사용 예: `style="color:var(--coral);"`

---

## 사이드바 TOC 작성 규칙

본문의 모든 `h2.section`과 주요 `h3.subsection`을 사이드바에 매핑한다. 그룹 헤더 `<h2>`는 **소문자 라벨** 분류용.

```html
<aside class="toc" id="toc">
  <div class="brand">SESSION ②</div>
  <div class="title">바이브에 <span class="accent">다이브</span> 하다</div>
  <div style="color:var(--muted); font-size:12px; margin-top:6px;">강의 핸드북 · 2026</div>

  <h2>차례</h2>
  <ul>
    <li><a href="#intro">시작하며</a></li>
    <li><a href="#goals">학습 목표</a></li>
  </ul>

  <h2>본문</h2>
  <ul>
    <li><a href="#part1">1. 1차시 한계</a></li>
    <li><a href="#part2">2. 핵심 개념</a></li>
    <li><a href="#part2-fe-be" style="padding-left:24px;">2-1. 프론트엔드</a></li>
  </ul>

  <h2>자료실</h2>
  <ul>
    <li><a href="#code">코드 자료실</a></li>
    <li><a href="#faq">자주 묻는 질문</a></li>
  </ul>
</aside>
```

**규칙**:
- 들여쓰기는 `style="padding-left:24px;"` 인라인으로
- 그룹 라벨 (차례·본문·자료실 등)은 `<h2>` 태그 — 자동으로 소문자 + tracking 1px 변환됨
- 모든 `href="#xxx"`는 본문에 `<span id="xxx" class="anchor"></span>`로 받혀야 함

---

## 빌드 체크 (조립 후)

마지막으로 한 번 훑을 것:

1. **anchor 매칭** — TOC 모든 링크가 본문 어딘가에 같은 id의 `<span class="anchor">`로 받혀있는지 (Grep 권장)
2. **HTML escape** — 코드 블록 안에서 `<` `>` `&`이 그대로 노출되지 않았는지
3. **모바일 시뮬** — 폭 360px 기준으로 표지·표·`twoperson`·`flow`가 깨지지 않는지
4. **다크모드** — 다크 토글 시 카드·본문이 자연스러운지 (대부분 자동, 일부 인라인 색만 검증)
5. **인쇄 미리보기** — `@media print`로 사이드바·진행률 바가 숨고 표지가 컬러로 인쇄되는지
6. **CDN 살아 있는지** — Pretendard, Prism CDN 링크가 `template.html`의 그대로인지 (변경 X)

---

## 안티 패턴

- ❌ 인라인 `<style>` 블록 추가 → 디자인 시스템 흐림
- ❌ 새 색상 도입 → 시리즈 일관성 깨짐
- ❌ 외부 프레임워크(Tailwind, Bootstrap, Font Awesome 등) → 단일 파일 원칙 위배
- ❌ 컴포넌트로만 화려하게 채우기 → 글이 본체. 패턴은 양념
- ❌ FAQ나 단계 카드를 5개 미만으로 — 한두 개면 그냥 단락으로
- ❌ 한 페이지에 `.key-term` 6개 이상 — 강조가 무뎌짐
