// ============================================================
// SLIDE 모듈 JS — 슬라이드 핸드북 동기화 (LIVE 모듈 확장)
// 삽입 위치: live-chat.js 전문 "다음"에, 같은 <script type="module"> 안.
//   → live-chat.js의 module-스코프 심볼을 직접 참조한다:
//     roomRef, isAdmin, setDoc, serverTimestamp, onSnapshot,
//     signInWithPopup, onAuthStateChanged, auth, provider, ADMIN_EMAIL
// 동작 개요:
//   강사(?present): 슬라이드를 넘기면 currentSlide + 매핑 currentSection을 publish.
//                   currentSection은 기존 LIVE 팔로우 구독이 받아 수강생을 스크롤시킨다(재사용).
//   수강생: currentSlide를 구독해 좌상단 미니 패널의 이미지·번호만 교체.
//           섹션 스크롤은 기존 live-chat.js의 room 구독이 담당(관심 분리).
// window.SLIDES = [{img, section}, ...] 가 정의돼 있을 때만 활성화.
// ============================================================
const SLIDES = Array.isArray(window.SLIDES) ? window.SLIDES : [];

if (SLIDES.length > 0) {
  const isPresent = new URLSearchParams(location.search).has("present");

  // ---------- 수강생 미니 패널 ----------
  const smImg = document.getElementById("sm-img");
  const smNum = document.getElementById("sm-num");
  const smEmpty = document.getElementById("sm-empty");
  const smFrame = document.getElementById("sm-frame");
  const lightbox = document.getElementById("slide-lightbox");
  const lbImg = document.getElementById("lb-img");
  let shownSlide = -1;

  function renderMini(idx) {
    if (idx < 0 || idx >= SLIDES.length) return;
    shownSlide = idx;
    smImg.src = SLIDES[idx].img;
    smImg.style.display = "block";
    if (smEmpty) smEmpty.style.display = "none";
    if (smNum) smNum.textContent = (idx + 1) + " / " + SLIDES.length;
    document.body.classList.add("slide-live");
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

    function showPresent(idx) {
      presentIdx = Math.max(0, Math.min(SLIDES.length - 1, idx));
      poImg.src = SLIDES[presentIdx].img;
      poCount.textContent = (presentIdx + 1) + " / " + SLIDES.length;
      const sec = SLIDES[presentIdx].section;
      poSection.textContent = sec ? ("→ #" + sec) : "(섹션 매핑 없음)";
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
      showPresent(next);
      publishSlide();
    }

    function updateAuthBadge() {
      if (isAdmin) { poAuth.textContent = "LIVE 송출 중"; poAuth.className = "po-auth live"; }
      else { poAuth.textContent = "로그인 필요 — 클릭"; poAuth.className = "po-auth need"; }
    }

    function exitPresent() {
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
      pbtn.title = "발표 모드로 들어가 슬라이드를 넘기면 수강생 핸드북이 따라옵니다";
      pbtn.addEventListener("click", () => {
        const u = new URL(location.href);
        u.searchParams.set("present", "1");
        location.href = u.toString();
      });
      adminCtrls.insertBefore(pbtn, adminCtrls.firstChild);
    }
  }

  // ---------- 수강생: currentSlide 구독 ----------
  if (!isPresent) {
    if (smFrame) smFrame.addEventListener("click", () => {
      if (shownSlide < 0) return;
      lbImg.src = SLIDES[shownSlide].img;
      lightbox.classList.add("show");
    });
    if (lightbox) lightbox.addEventListener("click", () => lightbox.classList.remove("show"));

    onSnapshot(roomRef, (snap) => {
      if (!snap.exists()) return;
      const n = snap.data().currentSlide;
      if (typeof n === "number" && n !== shownSlide) renderMini(n);
    }, (err) => console.warn("슬라이드 구독 실패:", err?.message || err));
  }
}
