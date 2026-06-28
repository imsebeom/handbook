// ============================================================
// SLIDE 모듈 JS — 슬라이드 핸드북 동기화 (LIVE 모듈 확장)
// 삽입 위치: live-chat.js 전문 "다음"에, 같은 <script type="module"> 안.
//   → live-chat.js의 module-스코프 심볼을 직접 참조한다:
//     roomRef, isAdmin, setDoc, serverTimestamp, onSnapshot,
//     signInWithPopup, onAuthStateChanged, auth, provider, ADMIN_EMAIL
// 동작 개요:
//   강사(?present): 슬라이드를 넘기면 currentSlide + followActive=true + 매핑 currentSection을 publish.
//                   화면은 먼저 로컬 갱신(낙관적) + 인접 슬라이드 프리로드로 넘김 지연을 없앤다.
//                   왼쪽 발표 목차(섹션)로 임의 점프, 발표 종료(Esc/✕) 시 followActive=false → 표지 복귀.
//                   '슬라이드 발표 시작'은 새 창(window.open)으로 띄운다(원본 핸드북 창은 유지).
//   수강생: followActive=true일 때만 currentSlide를 미니 패널에 실시간 표시,
//           발표 중이 아니면 표지(SLIDES[0])로 고정. 미니패널을 클릭해 확대(라이트박스)한 동안
//           강사가 슬라이드를 넘기면 확대 이미지도 따라 바뀐다. 섹션 스크롤은 기존 live-chat.js가 담당.
//   다운로드: window.SLIDES_PPT 가 있으면 본문 맨 끝 (D) 카드의 다운로드 링크를 활성화한다.
// window.SLIDES = [{img, section}, ...] 가 정의돼 있을 때만 활성화.
// ============================================================
const SLIDES = Array.isArray(window.SLIDES) ? window.SLIDES : [];

if (SLIDES.length > 0) {
  const isPresent = new URLSearchParams(location.search).has("present");

  // ---------- 이미지 프리로드 (낙관적 넘김 — 디코드 지연 제거) ----------
  const imgCache = {};
  function preload(idx) {
    if (idx < 0 || idx >= SLIDES.length || imgCache[idx]) return;
    const im = new Image();
    im.src = SLIDES[idx].img;
    imgCache[idx] = im;
  }

  // ---------- 수강생 미니 패널 ----------
  const smImg = document.getElementById("sm-img");
  const smNum = document.getElementById("sm-num");
  const smEmpty = document.getElementById("sm-empty");
  const smFrame = document.getElementById("sm-frame");
  const smLabel = document.getElementById("sm-label");
  const lightbox = document.getElementById("slide-lightbox");
  const lbImg = document.getElementById("lb-img");
  let shownSlide = -1;
  let shownLive = false;

  // live=true: 강사 발표 중 현재 슬라이드 · live=false: 발표 전·후 표지 고정
  function renderMini(idx, live) {
    if (idx < 0 || idx >= SLIDES.length) return;
    shownSlide = idx;
    shownLive = !!live;
    smImg.src = SLIDES[idx].img;
    smImg.style.display = "block";
    if (smEmpty) smEmpty.style.display = "none";
    if (smNum) smNum.textContent = (idx + 1) + " / " + SLIDES.length;
    if (smLabel) smLabel.textContent = live ? "강사 진행" : "표지";
    document.body.classList.toggle("slide-live", !!live);
    // 확대(라이트박스)를 켜 둔 채 강사가 넘기면 확대 이미지도 따라 바뀐다
    if (lightbox && lightbox.classList.contains("show")) lbImg.src = SLIDES[idx].img;
    preload(idx + 1);
  }

  // ---------- 강사 발표 모드 (?present) ----------
  if (isPresent) {
    document.body.classList.add("present-mode");
    const overlay = document.getElementById("present-overlay");
    const poImg = document.getElementById("po-img");
    const poCount = document.getElementById("po-count");
    const poSection = document.getElementById("po-section");
    const poAuth = document.getElementById("po-auth");
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");

    let presentIdx = 0;

    // 왼쪽 발표 목차 — 섹션 단위로 첫 슬라이드에 점프 (본문 TOC 제목 재사용)
    function buildPresentToc() {
      const tocEl = document.getElementById("po-toc");
      if (!tocEl) return;
      const firstIdx = new Map();  // section id → 첫 등장 슬라이드 인덱스
      SLIDES.forEach((s, i) => { if (s.section && !firstIdx.has(s.section)) firstIdx.set(s.section, i); });
      const titleFor = (secId) => {
        const a = document.querySelector('aside.toc a[href="#' + secId + '"]');
        return a ? a.textContent.trim() : secId;
      };
      tocEl.textContent = "";
      const head = document.createElement("div");
      head.className = "po-toc-head";
      head.textContent = "목차 — 클릭해 이동";
      tocEl.appendChild(head);
      firstIdx.forEach((idx, secId) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "po-toc-item";
        b.dataset.sec = secId;
        const no = document.createElement("span");
        no.className = "po-toc-no";
        no.textContent = idx + 1;
        b.appendChild(no);
        b.appendChild(document.createTextNode(titleFor(secId)));
        b.addEventListener("click", () => { showPresent(idx); publishSlide(); });
        tocEl.appendChild(b);
      });
    }
    function highlightPresentToc() {
      const cur = SLIDES[presentIdx] ? SLIDES[presentIdx].section : null;
      document.querySelectorAll("#po-toc .po-toc-item").forEach(b => {
        b.classList.toggle("active", b.dataset.sec === cur);
      });
    }

    function showPresent(idx) {
      presentIdx = Math.max(0, Math.min(SLIDES.length - 1, idx));
      poImg.src = SLIDES[presentIdx].img;
      poCount.textContent = (presentIdx + 1) + " / " + SLIDES.length;
      const sec = SLIDES[presentIdx].section;
      poSection.textContent = sec ? ("→ #" + sec) : "(섹션 매핑 없음)";
      highlightPresentToc();
      // 인접 슬라이드 프리로드 — 다음 넘김이 즉시 표시되도록
      preload(presentIdx + 1); preload(presentIdx + 2); preload(presentIdx - 1);
    }

    async function publishSlide() {
      if (!isAdmin) return;
      const sec = SLIDES[presentIdx].section;
      const payload = { currentSlide: presentIdx, followActive: true, updatedAt: serverTimestamp(), by: ADMIN_EMAIL };
      if (sec) payload.currentSection = sec;
      try { await setDoc(roomRef, payload, { merge: true }); }
      catch (err) { console.warn("슬라이드 publish 실패:", err?.message || err); }
    }

    function go(delta) {
      const next = presentIdx + delta;
      if (next < 0 || next >= SLIDES.length) return;
      showPresent(next);   // 화면 즉시 갱신(낙관적) — publish는 await하지 않아 넘김을 막지 않는다
      publishSlide();
    }

    function updateAuthBadge() {
      if (isAdmin) { poAuth.textContent = "LIVE 송출 중"; poAuth.className = "po-auth live"; }
      else { poAuth.textContent = "로그인 필요 — 클릭"; poAuth.className = "po-auth need"; }
    }

    async function exitPresent() {
      // 발표 종료를 알려 수강생 미니패널이 표지로 복귀하도록 followActive=false 송출
      if (isAdmin) {
        try { await setDoc(roomRef, { followActive: false, updatedAt: serverTimestamp(), by: ADMIN_EMAIL }, { merge: true }); }
        catch (err) { console.warn("발표 종료 publish 실패:", err?.message || err); }
      }
      const u = new URL(location.href);
      u.searchParams.delete("present");
      location.href = u.toString();
    }

    poAuth.addEventListener("click", async () => {
      if (isAdmin) return;
      try { await signInWithPopup(auth, provider); }
      catch (e) { alert("로그인 실패: " + (e?.message || e)); }
    });
    document.getElementById("po-next").addEventListener("click", () => go(1));
    document.getElementById("po-prev").addEventListener("click", () => go(-1));
    document.getElementById("po-exit").addEventListener("click", exitPresent);

    document.addEventListener("keydown", (e) => {
      if (!overlay.classList.contains("active")) return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
      else if (e.key === "Escape") { exitPresent(); }
    });

    buildPresentToc();
    showPresent(0);
    updateAuthBadge();
    // 로그인 상태가 비동기로 확정되면 배지 갱신 + 현재 슬라이드 1회 송출
    onAuthStateChanged(auth, () => {
      const wasNeed = poAuth.classList.contains("need");
      updateAuthBadge();
      if (isAdmin && wasNeed) publishSlide();
    });
  }

  // ---------- 강사: 관리자 컨트롤에 '발표 시작' 버튼 주입 ----------
  // #toc-admin-controls는 관리자 로그인 시에만 표시되므로 버튼도 강사에게만 보인다.
  if (!isPresent) {
    const adminCtrls = document.getElementById("toc-admin-controls");
    if (adminCtrls) {
      const pbtn = document.createElement("button");
      pbtn.type = "button";
      pbtn.className = "ac-present-btn";
      pbtn.innerHTML = '<span>🎬</span> 슬라이드 발표 시작';
      pbtn.title = "발표 모드를 새 창으로 엽니다 — 슬라이드를 넘기면 수강생 핸드북이 따라옵니다";
      pbtn.addEventListener("click", () => {
        const u = new URL(location.href);
        u.searchParams.set("present", "1");
        window.open(u.toString(), "_blank");   // 새 창으로 (원본 핸드북 창은 유지)
      });
      adminCtrls.insertBefore(pbtn, adminCtrls.firstChild);
    }
  }

  // ---------- 수강생: 표지 고정 + currentSlide 구독 + PPT 다운로드 ----------
  if (!isPresent) {
    // 발표 시작 전에도 미니패널에 표지를 고정 표시(빈 패널 방지)
    renderMini(0, false);

    if (smFrame) smFrame.addEventListener("click", () => {
      if (shownSlide < 0) return;
      lbImg.src = SLIDES[shownSlide].img;
      lightbox.classList.add("show");
    });
    if (lightbox) lightbox.addEventListener("click", () => lightbox.classList.remove("show"));

    // 강의 PPT 다운로드 카드 활성화 (window.SLIDES_PPT 있을 때만)
    const dlUrl = typeof window.SLIDES_PPT === "string" ? window.SLIDES_PPT.trim() : "";
    const dlBox = document.getElementById("slide-dl");
    const dlLink = document.getElementById("slide-dl-link");
    if (dlBox && dlLink && dlUrl) {
      dlLink.href = dlUrl;
      const name = (typeof window.SLIDES_PPT_NAME === "string" && window.SLIDES_PPT_NAME.trim())
        ? window.SLIDES_PPT_NAME.trim() : dlUrl.split("/").pop();
      if (name) dlLink.setAttribute("download", name);
      dlBox.hidden = false;
    }

    onSnapshot(roomRef, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      const live = data.followActive === true && typeof data.currentSlide === "number";
      if (live) {
        if (data.currentSlide !== shownSlide || !shownLive) renderMini(data.currentSlide, true);
      } else {
        // 발표 비진행: 표지로 고정
        if (shownSlide !== 0 || shownLive) renderMini(0, false);
      }
    }, (err) => console.warn("슬라이드 구독 실패:", err?.message || err));
  }
}
