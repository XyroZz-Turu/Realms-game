// =========================================================
// FUNGSI-FUNGSI BANTUAN YANG DIPAKAI BARENG DI SEMUA HALAMAN
// =========================================================
import {
  doc, getDoc, setDoc, addDoc, collection, query, orderBy, onSnapshot, updateDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

export const fmtRupiah = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(n||0));
export const parseNum = (str) => parseInt(String(str||"0").replace(/\D/g,""),10) || 0;

export function escapeHtml(str){
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

export function attachRupiahInput(inputEl, onChange){
  inputEl.addEventListener("input", (e) => {
    const raw = e.target.value.replace(/\D/g,"");
    e.target.value = raw ? new Intl.NumberFormat("id-ID").format(parseInt(raw,10)) : "";
    if (onChange) onChange();
  });
}

export function timeAgo(date){
  const s = Math.floor((Date.now() - date.getTime())/1000);
  if (s < 60) return "baru saja";
  if (s < 3600) return Math.floor(s/60) + " menit lalu";
  if (s < 86400) return Math.floor(s/3600) + " jam lalu";
  if (s < 2592000) return Math.floor(s/86400) + " hari lalu";
  return date.toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"});
}

export function fmtCountdown(ms){
  if (ms <= 0) return "Selesai";
  const s = Math.floor(ms/1000);
  const d = Math.floor(s/86400);
  const h = Math.floor((s%86400)/3600);
  const m = Math.floor((s%3600)/60);
  const sec = s%60;
  if (d > 0) return `${d}h ${h}j ${m}m`;
  if (h > 0) return `${h}j ${m}m ${sec}d`;
  return `${m}m ${sec}d`;
}

// Kompres foto di browser lalu ubah jadi base64 (gratis, gak perlu Firebase Storage/Blaze)
export function compressImage(file, maxSize=700, quality=0.7){
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize){
          height = Math.round(height * (maxSize/width)); width = maxSize;
        } else if (height > maxSize){
          width = Math.round(width * (maxSize/height)); height = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function monthKey(date){
  return date.getFullYear() + "-" + String(date.getMonth()+1).padStart(2,"0");
}
export function monthLabel(key){
  const nama = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const [y,m] = key.split("-").map(Number);
  return nama[m-1] + " " + y;
}

// Ambil / buat profil user di koleksi "users" (dipanggil sekali abis login)
export async function ensureUserProfile(user, usernameFallback){
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()){
    await setDoc(ref, {
      username: usernameFallback || user.displayName || "User" + user.uid.slice(0,5),
      email: user.email || "",
      photoURL: user.photoURL || "",
      whatsapp: "",
      bio: "",
      badges: [],
      banned: false,
      isAdmin: false,
      createdAt: new Date()
    });
    return (await getDoc(ref)).data();
  }
  return snap.data();
}

export function showToast(msg, isError){
  let t = document.getElementById("globalToast");
  if (!t){
    t = document.createElement("div");
    t.id = "globalToast";
    t.style.cssText = "position:fixed;bottom:88px;left:50%;transform:translateX(-50%);background:#1A1625;color:#fff;padding:10px 18px;border-radius:20px;font-size:13px;opacity:0;transition:opacity .25s ease;pointer-events:none;max-width:90%;text-align:center;z-index:9999;";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.background = isError ? "#C4536B" : "#1A1625";
  t.style.opacity = "1";
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.style.opacity = "0", 2400);
}

// Animasi transisi antar halaman: fade-in pas halaman dimuat, fade-out pas mau pindah halaman
export function enablePageTransitions(){
  document.documentElement.classList.add("page-enter");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("javascript:") || a.target === "_blank" || a.hasAttribute("data-no-transition")) return;
    if (href.startsWith("http") && !href.includes(location.hostname)) return;
    e.preventDefault();
    document.documentElement.classList.add("page-exit");
    setTimeout(() => { window.location.href = href; }, 180);
  });
}

// Link WhatsApp buat hubungi seller (transaksi diselesaikan di luar web, bukan lewat pembayaran website)
export function waLink(nomor, pesan){
  if (!nomor) return null;
  const clean = String(nomor).replace(/\D/g,"").replace(/^0/, "62");
  const withCode = clean.startsWith("62") ? clean : "62" + clean;
  return "https://wa.me/" + withCode + (pesan ? "?text=" + encodeURIComponent(pesan) : "");
}

// Render bottom nav bar - dipanggil di tiap halaman dengan tab aktif
export function renderNav(active){
  const items = [
    { id:"jelajah", href:"jelajah.html", icon:"&#9906;", label:"Jelajah" },
    { id:"lelang", href:"lelang.html", icon:"&#9878;", label:"Lelang" },
    { id:"dashboard", href:"dashboard.html", icon:"&#8862;", label:"Toko Saya" },
    { id:"profile", href:"profile.html", icon:"&#9787;", label:"Profil" }
  ];
  const nav = document.createElement("div");
  nav.className = "bottom-nav";
  nav.innerHTML = items.map(it => `
    <a href="${it.href}" class="nav-item ${it.id===active?'active':''}">
      <span class="nav-icon"><span class="icon-sym" aria-hidden="true">${it.icon}</span></span>
      <span class="nav-label">${it.label}</span>
    </a>
  `).join("");
  document.body.appendChild(nav);
}

// Mode gelap/terang - disimpan di localStorage, diterapkan sebelum render biar gak flash
export function applyTheme(){
  const theme = localStorage.getItem("kenzy-theme") || "dark";
  document.documentElement.setAttribute("data-theme", theme);
  return theme;
}
export function toggleTheme(){
  const current = localStorage.getItem("kenzy-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem("kenzy-theme", next);
  document.documentElement.setAttribute("data-theme", next);
  return next;
}

// Cek status VVIP user masih aktif atau udah expired
export function isVvipActive(userData){
  if (!userData || !userData.vvip || !userData.vvipUntil) return false;
  const until = userData.vvipUntil.toDate ? userData.vvipUntil.toDate() : new Date(userData.vvipUntil);
  return until.getTime() > Date.now();
}

// Ambil peta {uid: userData} buat sekumpulan ownerId - dipakai buat sorting VVIP di listing
export async function fetchOwnerMap(ownerIds){
  const unique = Array.from(new Set(ownerIds)).filter(Boolean);
  const map = {};
  await Promise.all(unique.map(async (uid) => {
    try {
      const snap = await getDoc(doc(db,"users",uid));
      if (snap.exists()) map[uid] = snap.data();
    } catch(e){ /* ignore */ }
  }));
  return map;
}

// Widget live chat mengambang ke admin - dipanggil sekali di halaman yang usernya udah login
export function renderLiveChatWidget(user, username){
  if (document.getElementById("liveChatFab")) return; // cegah dobel render

  const fab = document.createElement("button");
  fab.id = "liveChatFab";
  fab.className = "live-chat-fab";
  fab.innerHTML = '<span class="icon-sym" aria-hidden="true">&#9993;</span><span class="live-chat-dot" id="liveChatDot" style="display:none;"></span>';
  document.body.appendChild(fab);

  const panel = document.createElement("div");
  panel.className = "modal-overlay";
  panel.id = "liveChatPanel";
  panel.style.display = "none";
  panel.innerHTML = `
    <div class="modal-sheet">
      <h3>Live Chat &mdash; Admin</h3>
      <div class="chat-box" id="liveChatBox" style="max-height:340px;"></div>
      <div class="chat-input-row">
        <input type="text" id="liveChatInput" placeholder="Tulis pesan ke admin..." />
        <button class="btn btn-primary btn-sm" id="liveChatSend">Kirim</button>
      </div>
      <button class="btn btn-outline btn-sm" id="liveChatClose" style="margin-top:10px;">Tutup</button>
    </div>
  `;
  document.body.appendChild(panel);

  const threadRef = doc(db, "support", user.uid);

  // pantau status belum-dibaca buat badge merah
  onSnapshot(threadRef, (snap) => {
    const dot = document.getElementById("liveChatDot");
    if (snap.exists() && snap.data().unreadByUser){
      dot.style.display = "block";
    } else {
      dot.style.display = "none";
    }
  });

  let messagesUnsub = null;
  function openPanel(){
    panel.style.display = "flex";
    setDoc(threadRef, { userId: user.uid, username: username || user.displayName || "User", unreadByUser: false }, { merge: true });
    if (!messagesUnsub){
      const q = query(collection(db, "support", user.uid, "messages"), orderBy("createdAt","asc"));
      messagesUnsub = onSnapshot(q, (snap) => {
        const box = document.getElementById("liveChatBox");
        if (snap.empty){
          box.innerHTML = '<p class="muted" style="text-align:center;padding:20px 0;">Ada pertanyaan? Chat admin di sini.</p>';
        } else {
          box.innerHTML = snap.docs.map(d => {
            const m = d.data();
            return `<div class="chat-msg ${m.isAdmin ? 'other' : 'me'}"><span class="chat-name">${escapeHtml(m.isAdmin ? 'Admin' : 'Kamu')}</span>${escapeHtml(m.text)}</div>`;
          }).join("");
        }
        box.scrollTop = box.scrollHeight;
      });
    }
  }
  function closePanel(){ panel.style.display = "none"; }

  fab.addEventListener("click", openPanel);
  document.getElementById("liveChatClose").addEventListener("click", closePanel);
  document.getElementById("liveChatSend").addEventListener("click", async () => {
    const input = document.getElementById("liveChatInput");
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    await addDoc(collection(db, "support", user.uid, "messages"), {
      senderId: user.uid, isAdmin: false, text, createdAt: new Date()
    });
    await setDoc(threadRef, {
      userId: user.uid, username: username || user.displayName || "User",
      lastMessage: text, lastMessageAt: new Date(), unreadByAdmin: true, unreadByUser: false
    }, { merge: true });
  });
}

// Render tag video background + overlay - dipanggil sekali tiap halaman
export function renderBgVideo(){
  const v = document.createElement("video");
  v.id = "bgVideo"; v.autoplay = true; v.muted = true; v.loop = true; v.playsInline = true;
  v.src = "assets/bg.mp4";
  v.addEventListener("error", () => v.style.display = "none");
  const overlay = document.createElement("div");
  overlay.className = "bg-overlay";
  document.body.prepend(overlay);
  document.body.prepend(v);
}
