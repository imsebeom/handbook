// ============================================================
// LIVE 모듈 JS — Firestore 실시간 채팅 + 강사 인증 + 팔로우 모드 + 채팅 모드 제어
// 삽입 위치: template.html 기존 <script> 블록 다음에 별도 <script type="module">로
// 주의: ROOM_ID는 핸드북마다 고유하게 (예: singi2026, mdbf2026)
// Firestore 규칙은 firestore-rules.snippet 참고
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, deleteDoc, doc, setDoc }
  from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// ★★★ 관리자(강사) 이메일 — Google 로그인에 쓸 본인 계정으로 변경 ★★★
const ADMIN_EMAIL = "YOUR_ADMIN_EMAIL@example.com";

// ★★★ 본인 Firebase 웹 앱 설정으로 교체 ★★★
// Firebase 콘솔 → 프로젝트 설정 → 일반 → 내 앱 → SDK 설정 및 구성에서 복사
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ★★★ 핸드북별 고유 ROOM_ID — 반드시 변경 ★★★
const ROOM_ID = "PLACEHOLDER_ROOM_ID";

const chatRef = collection(db, ROOM_ID + "_chat");
const roomRef = doc(db, ROOM_ID + "_room", "main");

const toggle = document.getElementById("chat-toggle");
const panel = document.getElementById("chat-panel");
const closeBtn = document.getElementById("chat-close");
const msgsEl = document.getElementById("chat-msgs");
const countEl = document.getElementById("chat-count");
const form = document.getElementById("chat-form");
const nameInput = document.getElementById("chat-name");
const textInput = document.getElementById("chat-text");
const sendBtn = document.getElementById("chat-send");
const hintEl = document.getElementById("chat-hint");
const badge = toggle.querySelector(".badge");
const tocAdminBtn = document.getElementById("toc-admin-btn");
const tocAdminStatus = document.getElementById("toc-admin-status");
const tocAdminControls = document.getElementById("toc-admin-controls");
const modeFlag = document.getElementById("mode-flag");

let isAdmin = false;
let currentChatMode = "active"; // 'active' | 'readonly' | 'hidden'

const savedName = localStorage.getItem(ROOM_ID + "_chat_name");
if (savedName) nameInput.value = savedName;

let lastSeenTs = parseInt(localStorage.getItem(ROOM_ID + "_chat_last_seen") || "0", 10);
let unread = 0;

function fmtTime(d){
  if (!d) return "";
  const h = String(d.getHours()).padStart(2,"0");
  const m = String(d.getMinutes()).padStart(2,"0");
  return h + ":" + m;
}

function setUnread(n){
  unread = n;
  if (n > 0 && !panel.classList.contains("open")) {
    toggle.classList.add("has-unread");
    badge.textContent = n > 99 ? "99+" : String(n);
  } else {
    toggle.classList.remove("has-unread");
  }
}

function escape(s){ return String(s||"").replace(/[<>&]/g, c => ({"<":"&lt;",">":"&gt;","&":"&amp;"}[c])); }

function linkify(s){
  const escaped = escape(s);
  return escaped.replace(/(https?:\/\/[^\s<]+?)([.,!?;:)\]]*)(?=\s|$)/g,
    (m, url, trailing) => '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>' + trailing);
}

function renderMsgs(docs){
  if (docs.length === 0) {
    msgsEl.innerHTML = '<div class="chat-empty">아직 메시지가 없습니다. 첫 글을 남겨 보세요.</div>';
    return;
  }
  msgsEl.innerHTML = "";
  docs.forEach(d => {
    const m = d.data();
    const dt = m.createdAt && m.createdAt.toDate ? m.createdAt.toDate() : null;
    const div = document.createElement("div");
    div.className = "chat-msg";
    div.innerHTML =
      '<div class="meta"><span class="name">' + escape(m.name || "익명") + '</span>' +
      '<span class="time">' + fmtTime(dt) + '</span></div>' +
      '<div class="text">' + linkify(m.text) + '</div>' +
      '<button class="del-admin" data-id="' + escape(d.id) + '" title="관리자 삭제">×</button>';
    msgsEl.appendChild(div);
  });
  msgsEl.querySelectorAll(".del-admin").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!isAdmin) return;
      const id = btn.getAttribute("data-id");
      btn.disabled = true;
      btn.textContent = "...";
      try { await deleteDoc(doc(db, ROOM_ID + "_chat", id)); }
      catch(err){
        btn.disabled = false;
        btn.textContent = "×";
        alert("삭제 실패: " + (err?.message || err));
      }
    });
  });
}

const q = query(chatRef, orderBy("createdAt", "asc"), limit(200));
onSnapshot(q, (snap) => {
  const docs = snap.docs;
  countEl.textContent = docs.length ? "(" + docs.length + ")" : "";
  let newestTs = 0;
  docs.forEach(d => {
    const m = d.data();
    const ts = m.createdAt && m.createdAt.toMillis ? m.createdAt.toMillis() : 0;
    if (ts > newestTs) newestTs = ts;
  });
  renderMsgs(docs);
  msgsEl.scrollTop = msgsEl.scrollHeight;
  if (docs.length === 0) { setUnread(0); return; }
  const desktopVisible = window.matchMedia("(min-width: 1100px)").matches;
  if (panel.classList.contains("open") || desktopVisible) {
    lastSeenTs = newestTs;
    localStorage.setItem(ROOM_ID + "_chat_last_seen", String(newestTs));
    setUnread(0);
  } else {
    const newCount = docs.filter(d => {
      const ts = d.data().createdAt && d.data().createdAt.toMillis ? d.data().createdAt.toMillis() : 0;
      return ts > lastSeenTs;
    }).length;
    setUnread(newCount);
  }
}, (err) => {
  msgsEl.innerHTML = '<div class="chat-empty">채팅을 불러오지 못했습니다. 새로고침 부탁드려요.<br><br><code>' + (err.message || err) + '</code></div>';
});

onAuthStateChanged(auth, (user) => {
  if (user && user.email === ADMIN_EMAIL && user.emailVerified) {
    isAdmin = true;
    document.body.classList.add("is-admin");
    tocAdminBtn.querySelector(".icon").textContent = "🔓";
    tocAdminBtn.querySelector(".lbl").textContent = "관리자 로그아웃";
    tocAdminStatus.style.display = "block";
    tocAdminStatus.textContent = "✓ " + user.email;
    tocAdminControls.style.display = "block";
  } else {
    isAdmin = false;
    document.body.classList.remove("is-admin");
    tocAdminBtn.querySelector(".icon").textContent = "🔒";
    tocAdminBtn.querySelector(".lbl").textContent = "관리자 로그인";
    tocAdminStatus.style.display = "none";
    tocAdminControls.style.display = "none";
  }
  applyChatModeUI(currentChatMode);
});

tocAdminBtn.addEventListener("click", async () => {
  if (isAdmin) {
    if (confirm("관리자 로그아웃하시겠어요?")) await signOut(auth);
  } else {
    try { await signInWithPopup(auth, provider); }
    catch(err){ alert("로그인 실패: " + (err?.message || err)); }
  }
});

function openPanel(){
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  document.body.classList.add("chat-open");
  setUnread(0);
  lastSeenTs = Date.now();
  localStorage.setItem(ROOM_ID + "_chat_last_seen", String(lastSeenTs));
  setTimeout(() => { msgsEl.scrollTop = msgsEl.scrollHeight; }, 50);
}
function closePanel(){
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("chat-open");
}
toggle.addEventListener("click", () => {
  if (panel.classList.contains("open")) closePanel();
  else openPanel();
});
closeBtn.addEventListener("click", closePanel);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = textInput.value.trim();
  const name = (nameInput.value || "").trim().slice(0, 20);
  if (!name) {
    nameInput.focus();
    hintEl.textContent = "이름을 입력해 주세요.";
    return;
  }
  if (!text) return;
  localStorage.setItem(ROOM_ID + "_chat_name", name);
  sendBtn.disabled = true;
  hintEl.textContent = "전송 중...";
  try {
    await addDoc(chatRef, { name: name, text: text.slice(0, 300), createdAt: serverTimestamp() });
    textInput.value = "";
    hintEl.textContent = "이름 + 메시지(최대 300자) · 누구나 보입니다 · https:// 링크 자동 변환";
  } catch (err) {
    hintEl.textContent = "전송 실패: " + (err.message || err);
  } finally {
    sendBtn.disabled = false;
  }
});

textInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});

// ============================================================
// 닉네임 입력 모달 — 최초 1회
// ============================================================
const nameModal = document.getElementById("name-modal");
const nameModalInput = document.getElementById("name-modal-input");
const nameModalSave = document.getElementById("name-modal-save");
const nameModalSkip = document.getElementById("name-modal-skip");
const nameModalHint = document.getElementById("name-modal-hint");

function applySavedName(name){
  nameInput.value = name;
  document.body.classList.add("has-name");
  localStorage.setItem(ROOM_ID + "_chat_name", name);
}
if (savedName) {
  document.body.classList.add("has-name");
} else {
  setTimeout(() => {
    nameModal.classList.add("show");
    setTimeout(() => nameModalInput.focus(), 100);
  }, 1200);
}
nameModalSave.addEventListener("click", () => {
  const v = nameModalInput.value.trim().slice(0, 20);
  if (!v) {
    nameModalHint.textContent = "이름을 입력해 주세요.";
    nameModalInput.focus();
    return;
  }
  applySavedName(v);
  nameModal.classList.remove("show");
});
nameModalSkip.addEventListener("click", () => {
  nameModal.classList.remove("show");
});
nameModalInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); nameModalSave.click(); }
});

// ============================================================
// 강사 팔로우 모드 — Firestore room/main 문서 sync
// (컨트롤 버튼 topbar는 사이드바 TOC 상단에 고정 배치되므로 이동 JS 불필요)
// ============================================================
const followPill = document.getElementById("follow-pill");
const followPillLbl = followPill.querySelector(".lbl");

// 'sections'는 기존 TOC 스크립트에서 정의된 변수 — 같은 윈도우 스코프에서 접근.
// 만약 module 스코프 분리로 접근 불가하면 아래에서 직접 다시 만든다.
const followLinks = [...document.querySelectorAll('aside.toc a[href^="#"]')];
const followSections = followLinks
  .map(a => document.getElementById(a.getAttribute('href').slice(1)))
  .filter(Boolean);

let hostFollowOn = false;
let listenerFollowActive = true;
let lastPublishedId = null;
let lastReceivedId = null;
let ignoreNextScroll = 0;

function currentVisibleSectionId(){
  const y = window.scrollY + 140;
  let cur = followSections[0];
  for (const s of followSections) {
    if (s.offsetTop <= y) cur = s;
  }
  return cur ? cur.id : null;
}

function scrollToSectionSmooth(id){
  const target = document.getElementById(id);
  if (!target) return;
  ignoreNextScroll = 8;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => { ignoreNextScroll = 0; }, 1400);
}

// ---------- 강사 측 ----------
function setHostFollow(on){
  hostFollowOn = on;
  followPill.classList.toggle("on", on);
  followPillLbl.textContent = on ? "팔로우 ON" : "팔로우 OFF";
  publishFollowState(on);
  if (on) publishHostSection(true);
}

// 강사 팔로우 ON/OFF 상태를 room에 기록 — 수강생이 '강사 따라가기' 버튼 표시 여부 판단에 사용
async function publishFollowState(on){
  if (!isAdmin) return;
  try {
    await setDoc(roomRef, { followActive: on, updatedAt: serverTimestamp(), by: ADMIN_EMAIL }, { merge: true });
  } catch (err) {
    console.warn("팔로우 상태 publish 실패:", err?.message || err);
  }
}
followPill.addEventListener("click", () => {
  if (!isAdmin) return;
  setHostFollow(!hostFollowOn);
});

let publishThrottle = null;
async function publishHostSection(force){
  if (!isAdmin || !hostFollowOn) return;
  const id = currentVisibleSectionId();
  if (!id) return;
  if (!force && id === lastPublishedId) return;
  lastPublishedId = id;
  try {
    await setDoc(roomRef, { currentSection: id, updatedAt: serverTimestamp(), by: ADMIN_EMAIL }, { merge: true });
  } catch (err) {
    console.warn("팔로우 publish 실패:", err?.message || err);
  }
}
document.addEventListener("scroll", () => {
  if (!isAdmin || !hostFollowOn) return;
  clearTimeout(publishThrottle);
  publishThrottle = setTimeout(() => publishHostSection(false), 350);
}, { passive: true });
document.querySelectorAll('aside.toc a[href^="#"]').forEach(a => {
  a.addEventListener("click", () => {
    if (isAdmin && hostFollowOn) {
      setTimeout(() => publishHostSection(true), 600);
    }
  });
});

// ---------- 수강생 측 ----------
const followFab = document.getElementById("follow-fab");
let hostFollowActive = false; // 강사가 팔로우 모드를 켰는지 (room에서 수신)

function updateFollowFab(){
  // 수강생이 직접 스크롤로 추종을 푼 동안, 강사가 팔로우 중일 때만 버튼 표시
  const show = !isAdmin && hostFollowActive && !listenerFollowActive;
  followFab.classList.toggle("show", show);
}

function setListenerFollow(on){
  listenerFollowActive = on;
  updateFollowFab();
}

// '강사 따라가기' 플로팅 버튼 — 누르면 추종 재개 + 강사 현재 위치로 점프
followFab.addEventListener("click", () => {
  setListenerFollow(true);
  if (lastReceivedId) scrollToSectionSmooth(lastReceivedId);
});

// 수강생이 직접 스크롤하면 자동 추종 일시 해제
document.addEventListener("wheel", () => {
  if (isAdmin) return;
  if (ignoreNextScroll > 0) { ignoreNextScroll--; return; }
  if (listenerFollowActive) setListenerFollow(false);
}, { passive: true });
document.addEventListener("touchmove", () => {
  if (isAdmin) return;
  if (ignoreNextScroll > 0) { ignoreNextScroll--; return; }
  if (listenerFollowActive) setListenerFollow(false);
}, { passive: true });
document.addEventListener("keydown", (e) => {
  if (isAdmin) return;
  if (["PageUp","PageDown","ArrowUp","ArrowDown","Home","End"," "].includes(e.key)) {
    if (listenerFollowActive) setListenerFollow(false);
  }
});

// ============================================================
// 채팅 모드 (active / readonly / hidden) — 관리자 제어
// ============================================================
const modeSegBtns = document.querySelectorAll(".toc-footer .mode-seg button[data-mode]");

function applyChatModeUI(mode){
  document.body.classList.remove("chat-active","chat-readonly","chat-hidden");
  document.body.classList.add("chat-" + mode);
  modeSegBtns.forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  if (mode === "active") {
    modeFlag.style.display = "none";
  } else {
    modeFlag.style.display = "inline-block";
    modeFlag.textContent = mode === "readonly" ? "🔒 잠금" : "👁‍🗨 숨김";
  }
}

async function setChatMode(mode){
  if (!isAdmin) return;
  if (!["active","readonly","hidden"].includes(mode)) return;
  currentChatMode = mode;
  applyChatModeUI(mode);
  try {
    await setDoc(roomRef, { chatMode: mode, updatedAt: serverTimestamp(), by: ADMIN_EMAIL }, { merge: true });
  } catch (err) {
    alert("모드 변경 실패: " + (err?.message || err));
  }
}
modeSegBtns.forEach(b => b.addEventListener("click", () => setChatMode(b.dataset.mode)));

// Firestore room 구독 — 강사 위치 + 채팅 모드 변경 감지
onSnapshot(roomRef, (snap) => {
  if (!snap.exists()) return;
  const data = snap.data();
  const mode = data.chatMode || "active";
  if (mode !== currentChatMode) {
    currentChatMode = mode;
    applyChatModeUI(mode);
  }
  hostFollowActive = data.followActive === true;
  updateFollowFab();
  const id = data.currentSection;
  if (!id || id === lastReceivedId) return;
  lastReceivedId = id;
  if (isAdmin) return;
  if (listenerFollowActive) {
    scrollToSectionSmooth(id);
  }
  // listenerFollowActive=false (수강생이 직접 스크롤 중)면 조용히 무시
}, (err) => {
  console.warn("팔로우/모드 구독 실패:", err?.message || err);
});
