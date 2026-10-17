/* ============================================================
   Black 소개 사이트 스크립트
   ▼ 여기만 고치면 서버 이름·주소·디스코드가 바뀝니다
   ============================================================ */
const SERVER = {
  name: "Black",
  wordmark: ["BLA", "CK"],        // 첫 화면 큰 글자 (앞은 검은 흙색, 뒤는 금색)
  motto: "마인크래프트 서버 Black에 오신 것을 환영합니다.",
  ip: "blackheim.kro.kr",
  version: "Java 1.21.1",
  discord: "https://discord.gg/j4AbNA6TT",  // 예: "https://discord.gg/xxxx" (비워두면 버튼 숨김)
  // ▼ 직접 만든(제미나이 등) 그림. site/assets/ 에 넣고 파일 이름을 적으면 적용, 비워두면 기본 디자인
  logo: "",               // 예: "assets/logo.png"  (상단 바·제목 대신 로고)
  heroImage: "",          // 예: "assets/hero.png"  (첫 화면 배경 그림, 가로 1920x800 정도)
};

/* ------------------------------------------------------------ */
const D = window.MF;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const won = n => {
  if (n >= 100000000) { const e = Math.floor(n / 1e8), m = Math.floor((n % 1e8) / 1e4); return `${e}억${m ? " " + m.toLocaleString("ko-KR") + "만" : ""}원`; }
  if (n >= 100000) return (n / 10000).toLocaleString("ko-KR", { maximumFractionDigits: 1 }) + "만원";
  return n.toLocaleString("ko-KR") + "원";
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];
const cropById = Object.fromEntries(D.crops.map(c => [c.id, c]));
const ingById = Object.fromEntries(D.ingredients.map(i => [i.id, i]));
const minById = Object.fromEntries(D.minerals.map(m => [m.id, m]));

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 1600);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast(`복사했어요: ${text}`); }
  catch { toast(text); }
}

/* ---------- 서버 정보 / 히어로 ---------- */
function initServer() {
  $$("[data-server-name]").forEach(el => (el.textContent = SERVER.name));
  $$("[data-server-motto]").forEach(el => (el.textContent = SERVER.motto || ""));
  if (SERVER.wordmark && !SERVER.logo) $(".hero h1").innerHTML = `<span class="wm-a">${esc(SERVER.wordmark[0])}</span><span class="wm-b">${esc(SERVER.wordmark[1] || "")}</span>`;
  $$("[data-server-version]").forEach(el => (el.textContent = SERVER.version));
  document.title = `${SERVER.name} · 서버 안내`;
  $("#server-ip").textContent = SERVER.ip;
  $("#copy-ip").addEventListener("click", () => copy(SERVER.ip));
  if (SERVER.discord) { const a = $("#discord-link"); a.href = SERVER.discord; a.hidden = false; }
  if (SERVER.logo) {
    $(".brand img").src = SERVER.logo;
    $(".hero h1").innerHTML = `<img class="hero-logo" src="${SERVER.logo}" alt="${esc(SERVER.name)}">`;
  }
  if (SERVER.heroImage) {
    const h = $(".hero");
    h.style.backgroundImage = `linear-gradient(rgba(0,0,0,.15), rgba(0,0,0,.15)), url("${SERVER.heroImage}")`;
    h.classList.add("has-image");
  }

  const stats = [
    ["작물", D.crops.length, "img/crops/strawberry.png"],
    ["요리", D.foods.length, "img/foods/pizza.png"],
    ["광물", D.minerals.length, "img/minerals/diamond.png"],
    ["보물", D.treasures.length, "img/treasures/golden_mask.png"],
    ["물고기", D.fish.length, "img/fish/legend.png"],
    ["가공품", D.artisan.length, "img/artisan/art_wine.png"],
  ];
  $("#stats").innerHTML = stats.map(([n, v, img]) => `<li><img src="${img}" alt=""><b>${v}</b> ${n}</li>`).join("");
  $$("[data-count]").forEach(el => (el.textContent = D[el.dataset.count].length));

  const row = ["parsnip", "cauliflower", "strawberry", "tomato", "melon", "corn", "pumpkin", "grape", "sunflower", "starfruit", "ancient_fruit"];
  $("#crop-row").innerHTML = row.map(id => `<img src="${cropById[id].stages[3]}" alt="">`).join("");
}

/* ---------- 농사 (계절 없음 → 레벨 구간 탭) ---------- */
const BANDS = [["all", "전체", 1, 50], ["b1", "Lv.1~9", 1, 9], ["b2", "Lv.10~19", 10, 19], ["b3", "Lv.20~33", 20, 33], ["b4", "Lv.34~50", 34, 50]];
let band = "all";
function renderSeasonTabs() {
  $("#season-tabs").innerHTML = BANDS.map(([k, label, lo, hi]) => {
    const n = D.crops.filter(c => c.lvl >= lo && c.lvl <= hi).length;
    return `<button role="tab" data-s="${k}" aria-selected="${k === band}">${label}<span class="count">${n}</span></button>`;
  }).join("");
  $$("#season-tabs button").forEach(b => b.addEventListener("click", () => { band = b.dataset.s; renderSeasonTabs(); renderCrops(); }));
}
function renderCrops() {
  const [, , lo, hi] = BANDS.find(b => b[0] === band);
  const list = D.crops.filter(c => c.lvl >= lo && c.lvl <= hi).sort((a, b) => a.lvl - b.lvl || a.price - b.price);
  $("#crop-grid").innerHTML = list.map(c => `
    <article class="card">
      <div class="card-head">
        <img class="icon" src="${c.img}" alt="">
        <div>
          <h4>${esc(c.name)}</h4>
          <div class="badges">
            <span class="badge lv">Lv.${c.lvl}</span>
          </div>
        </div>
      </div>
      <div class="stages">
        ${c.stages.map((s, i) => `<img src="${s}" alt="${i + 1}단계">${i < 3 ? '<span class="arrow">›</span>' : ""}`).join("")}
      </div>
      <div class="prices">
        <span class="meta"><img src="${c.seedImg}" alt="" style="width:18px;vertical-align:-4px"> 씨앗 ${won(c.seed)}</span>
        <span>판매 <b>${won(c.price)}</b></span>
      </div>
      <div class="meta">수확 ${c.min === c.max ? c.min : c.min + "~" + c.max}개${c.regrow ? ' · <b style="color:#3fa8d8">재성장</b> (한 번 심으면 계속 열려요)' : ''}</div>
    </article>`).join("");
}
function renderQuality() {
  const c = cropById.strawberry;
  $("#quality-demo").innerHTML = [["기본", c.img], ["★ 은", c.q[0]], ["★★ 금", c.q[1]], ["★★★ 이리듐", c.q[2]]]
    .map(([n, img]) => `<figure><img src="${img}" alt="${n}"><figcaption>${n}</figcaption></figure>`).join("");
}
function renderXpChart() {
  const svg = $("#xp-chart"), W = 600, H = 180, P = { l: 52, r: 12, t: 12, b: 26 };
  const need = lv => Math.floor(100 * Math.pow(lv, 1.6));
  const max = need(49);
  const x = lv => P.l + (lv - 1) / 48 * (W - P.l - P.r);
  const y = v => H - P.b - v / max * (H - P.t - P.b);
  let pts = [];
  for (let lv = 1; lv <= 49; lv++) pts.push(`${x(lv).toFixed(1)},${y(need(lv)).toFixed(1)}`);
  const ticks = [0, 10000, 20000, 30000, 40000, 50000];
  svg.innerHTML = `
    ${ticks.map(t => `<line class="axis" x1="${P.l}" x2="${W - P.r}" y1="${y(t)}" y2="${y(t)}"/><text x="${P.l - 6}" y="${y(t) + 4}" text-anchor="end">${t / 1000}k</text>`).join("")}
    <polygon class="area" points="${P.l},${H - P.b} ${pts.join(" ")} ${x(49)},${H - P.b}"/>
    <polyline class="lineplot" points="${pts.join(" ")}"/>
    ${[1, 10, 20, 30, 40, 49].map(lv => `<circle class="dot" cx="${x(lv)}" cy="${y(need(lv))}" r="3.5"><title>Lv.${lv} → ${need(lv).toLocaleString()}</title></circle><text x="${x(lv)}" y="${H - 8}" text-anchor="middle">Lv.${lv}</text>`).join("")}`;
}

/* ---------- 요리 ---------- */
let foodFilter = "all";
function ingInfo(spec) {
  const [kind, id, n] = spec.split(":");
  if (kind === "fish") return { name: "물고기", img: null, n, fish: true };
  if (kind === "crop") return { name: cropById[id]?.name ?? id, img: cropById[id]?.img, n };
  return { name: ingById[id]?.name ?? id, img: ingById[id]?.img, n };
}
function renderFoodChips() {
  const chips = [["all", "전체"], ["crop", "작물만"], ["fish", "물고기 요리"], ["meat", "고기 요리"], ["drink", "음료"]];
  $("#food-chips").innerHTML = chips.map(([k, l]) => `<button class="chip" data-k="${k}" aria-pressed="${k === foodFilter}">${l}</button>`).join("");
  $$("#food-chips .chip").forEach(b => b.addEventListener("click", () => { foodFilter = b.dataset.k; renderFoodChips(); renderFoods(); }));
}
function renderFoods() {
  const q = $("#food-search").value.trim();
  const lv = +$("#food-lv").value;
  $("#food-lv-out").textContent = lv;
  const meats = ["beef", "pork", "chicken", "mutton"];
  const drinks = ["커피", "에일", "맥주", "주스", "버블티", "셔벗", "파르페"];
  const list = D.foods.filter(f => {
    if (f.lvl > lv) return false;
    if (foodFilter === "crop" && !f.ings.every(s => s.startsWith("crop:"))) return false;
    if (foodFilter === "fish" && !f.ings.some(s => s.startsWith("fish:"))) return false;
    if (foodFilter === "meat" && !f.ings.some(s => meats.includes(s.split(":")[1]))) return false;
    if (foodFilter === "drink" && !drinks.some(d => f.name.includes(d))) return false;
    if (q) {
      const names = [f.name, ...f.ings.map(s => ingInfo(s).name)].join(" ");
      if (!names.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => a.lvl - b.lvl || a.value - b.value);
  $("#food-grid").innerHTML = list.length ? list.map(f => `
    <article class="card">
      <span class="value">${won(f.value)}</span>
      <div class="card-head">
        <img class="icon" src="${f.img}" alt="">
        <div><h4>${esc(f.name)}</h4><div class="badges"><span class="badge lv">농사 Lv.${f.lvl}</span></div></div>
      </div>
      <div class="ings">
        ${f.ings.map(s => { const i = ingInfo(s); return `<span class="ing${i.fish ? " fish" : ""}">${i.img ? `<img src="${i.img}" alt="">` : ""}${esc(i.name)} ×${i.n}</span>`; }).join("")}
      </div>
    </article>`).join("") : `<p class="empty">조건에 맞는 요리가 없어요.</p>`;
}
function renderIngredients() {
  $("#ing-grid").innerHTML = D.ingredients.map(i => `
    <div class="ing-item"><img src="${i.img}" alt=""><div>${esc(i.name)}<small>${won(i.price)}</small></div></div>`).join("");
}

/* ---------- 광산 ---------- */
const BLOCK_KO = {
  stone: "돌", coal_ore: "석탄 광석", copper_ore: "구리 광석", iron_ore: "철 광석", lapis_ore: "청금석 광석",
  redstone_ore: "레드스톤 광석", nether_quartz_ore: "석영 광석", gold_ore: "금 광석", emerald_ore: "에메랄드 광석",
  diamond_ore: "다이아몬드 광석", ancient_debris: "고대 잔해",
};
function blockName(b) {
  if (b.startsWith("deepslate_")) return "심층 " + (BLOCK_KO[b.slice(10)] ?? b);
  return BLOCK_KO[b] ?? b;
}
function renderOres() {
  const rows = [...D.ores].sort((a, b) => a.deep - b.deep || a.lvl - b.lvl);
  $("#ore-table tbody").innerHTML = rows.map(o => {
    const m = minById[o.min];
    return `<tr class="${o.deep ? "deep" : ""}">
      <td class="name"><img src="${m.img}" alt="">${blockName(o.block)} ${o.deep ? '<span class="tag-deep">보물</span>' : ""}</td>
      <td>광부 Lv.${o.lvl}</td>
      <td>${esc(m.name)} ${o.amin === o.amax ? o.amin : o.amin + "~" + o.amax}개</td>
      <td>${o.regen}초</td>
      <td>${won(m.value)}</td></tr>`;
  }).join("");
  const total = D.treasures.reduce((s, t) => s + t.w, 0);
  $("#treasure-grid").innerHTML = [...D.treasures].sort((a, b) => a.value - b.value).map(t => {
    const pct = (t.w / total * 100);
    return `<article class="card">
      <div class="card-head"><img class="icon" src="${t.img}" alt=""><div><h4>${esc(t.name)}</h4><div class="meta">광부 Lv.${t.lvl}~</div></div></div>
      <div class="prices"><span class="meta">보물 중 ${pct.toFixed(1)}%</span><b>${won(t.value)}</b></div>
      <div class="rarity" title="나올 확률"><span style="width:${Math.max(4, pct / 23 * 100)}%"></span></div>
    </article>`;
  }).join("");
  const gNames = { geode: "정동석", frozen_geode: "얼어붙은 정동석", magma_geode: "마그마 정동석", omni_geode: "만능 정동석" };
  $("#geode-grid").innerHTML = D.geodeDrop.map(([gid, lv, ch]) => {
    const loot = D.geodeLoot[gid];
    return `<article class="card">
      <div class="card-head"><img class="icon" src="${minById[gid].img}" alt=""><div><h4>${gNames[gid]}</h4><div class="meta">광부 Lv.${lv}~ · 채굴당 ${ch}%</div></div></div>
      <div class="loot">${loot.map(([mid]) => `<span><img src="${minById[mid].img}" alt="">${esc(minById[mid].name)}</span>`).join("")}</div>
    </article>`;
  }).join("");
}

/* ---------- 낚시 ---------- */
function renderFish() {
  const rk = ["", "일반", "고급", "희귀", "영웅", "전설"];
  const wk = { any: "언제나", sun: "맑을 때", rain: "비 올 때" };
  $("#fish-grid").innerHTML = [...D.fish].sort((a, b) => a.rank - b.rank || a.lvl - b.lvl).map(f => `
    <article class="card fishcard">
      <span class="value">${won(f.value)}</span>
      <div class="card-head">
        <img class="icon" src="${f.img}" alt="">
        <div><h4>${esc(f.name)}</h4>
          <div class="badges"><span class="badge" style="background:var(--r${f.rank});color:#fff">${rk[f.rank]}</span><span class="badge lv">낚시 Lv.${f.lvl}</span></div></div>
      </div>
      <div class="meta">${f.min}~${f.max}cm · ${wk[f.weather] ?? f.weather} · 난이도 ${"●".repeat(Math.max(1, Math.round(f.diff / 25)))}</div>
    </article>`).join("");
  $("#rod-strip").innerHTML = D.tools.rods.map((r, i) =>
    `<figure><img src="${r.img}" alt=""><figcaption>+${i * 2}${i < 5 ? "~" + (i * 2 + 1) : ""}<br><small>${esc(r.name.replace("Black ", ""))}</small></figcaption></figure>`).join("");
}

/* ---------- 가공 ---------- */
function renderArtisan() {
  const A = Object.fromEntries(D.artisan.map(a => [a.id, a]));
  const rows = [
    ["술통", "과일", "art_wine", "와인", "30분", "작물 값 ×3"],
    ["술통", "채소", "art_juice", "주스", "10분", "작물 값 ×2.25"],
    ["절임병", "과일", "art_jam", "잼", "10분", "작물 값 ×2"],
    ["절임병", "채소", "art_pickles", "피클", "10분", "작물 값 ×2"],
    ["목장 가공기", "고기", "art_smoked", "훈제 고기", "10분", "고기 값 ×1.5"],
    ["목장 가공기", "우유", null, "치즈 (요리 재료)", "5분", "—"],
    ["목장 가공기", "달걀", "art_mayo", "마요네즈", "3분", "달걀 값 ×3"],
  ];
  const ing = D.ingredients.find(i => i.id === "cheese");
  $("#artisan-table").innerHTML = rows.map(([m, inp, id, out, t, v]) => `
    <tr><td><b>${m}</b></td><td>${inp}</td>
    <td class="name"><img src="${id ? A[id].img : ing.img}" alt="">${out}</td><td>${t}</td><td>${v}</td></tr>`).join("");
  $("#art-row").innerHTML = D.artisan.map(a => `<figure><img src="${a.img}" alt=""><figcaption>${esc(a.name)}</figcaption></figure>`).join("");
}

/* ---------- 강화 ---------- */
function renderEnh() {
  const T = D.tools, nm = { black_pickaxe: "곡괭이", black_axe: "도끼", black_shovel: "삽" };
  $("#tool-show").innerHTML = T.black.map(t => `
    <figure><div class="pair"><img src="${t.img}" alt=""><span>→</span><img src="${t.nimg}" alt=""></div>
    <figcaption>Black ${nm[t.id]}<br><small>다이아 → +5 네더라이트</small></figcaption></figure>`).join("")
    + `<figure><div class="pair"><img src="${T.rods[0].img}" alt=""><span>→</span><img src="${T.rods[5].img}" alt=""></div><figcaption>Black 낚싯대<br><small>+0 → +10 전설</small></figcaption></figure>`;
  $("#enh-table tbody").innerHTML = D.enh.map(e => `
    <tr class="${e.destroy ? "deep" : ""}"><td><b>+${e.lv}</b></td><td>${e.rank}등급</td><td>${e.rate}%</td><td>${won(e.price)}</td><td>${e.stones}개</td>
    <td>${e.destroy ? `<span class="tag-deep">파괴 ${e.destroy}%</span> 아니면 ` : ""}${e.down ? "50% 하락" : "유지"}</td>
    <td>${e.eff} · ${e.fort}</td></tr>`).join("");
  const sn = { farm: "괭이 강화석", mine: "광산 강화석", fish: "낚시 강화석" };
  $("#stone-list").innerHTML = T.stones.map(st => `<span class="ing"><img src="${st.img}" alt="">${sn[st.id]}</span>`).join("");
  $("#protect-list").innerHTML = `<span class="ing"><img src="${T.protect[0]}" alt="">파괴 방지권</span><span class="ing"><img src="${T.protect[1]}" alt="">하락 방지권</span>`;
}

/* ---------- 등급 ---------- */
const MC = { "0": "#2a2a2a", "1": "#1f3fa8", "2": "#2f8a1f", "3": "#1f8a8a", "4": "#a81f1f", "5": "#8a2fa8", "6": "#d8961f", "7": "#8a8a8a", "8": "#5a5a5a", "9": "#4f6fff", a: "#3fae2a", b: "#2fa8c8", c: "#e0473f", d: "#c84fc8", e: "#d8b81f", f: "#666" };
function renderRanks() {
  const L = D.limits;
  $("#rank-list").innerHTML = D.ranks.map(r => `
    <article class="rank" style="--rc:${MC[r.color] ?? "#888"}">
      <div class="rn">${r.n}등급</div>
      <h4>${esc(r.name.replace(/[\[\]]/g, ""))}</h4>
      <div class="price">${r.price ? won(r.price) : "기본"}</div>
      <p>${esc(r.desc)}</p>
      <div class="lims">
        <span class="badge">호퍼 ${L["호퍼"][r.n - 1]}</span><span class="badge">상자 ${L["상자"][r.n - 1]}</span>
        <span class="badge">신호기 ${L["신호기"][r.n - 1]}</span><span class="badge">홈 ${r.homes}</span>
      </div>
    </article>`).join("");
}

/* ---------- 편의 ---------- */
function renderTickets() {
  $("#ticket-list").innerHTML = D.tickets.map(t => `
    <div class="ticket"><img src="${t.img}" alt=""><div><b>${t.mins >= 60 ? t.mins / 60 + "시간" : t.mins + "분"}</b><span class="muted">${won(t.price)}</span></div></div>`).join("");
}

/* ---------- 규칙 ---------- */
function renderBans() {
  const cats = [...new Set(D.bans.map(b => b.cat))];
  $("#ban-list").innerHTML = cats.map(c => `
    <div class="ban-cat">${esc(c)}</div>
    <div class="ban-items">${D.bans.filter(b => b.cat === c).map(b => `<span title="${esc(b.reason)}">${esc(b.name)}</span>`).join("")}</div>`).join("");
}

/* ---------- 명령어 ---------- */
function renderCmds() {
  const q = $("#cmd-search").value.trim().toLowerCase();
  const list = D.commands.filter(c => !q || (c.cmd + c.desc + c.cat + c.typo).toLowerCase().includes(q));
  $("#cmd-table tbody").innerHTML = list.length ? list.map(c => `
    <tr><td>${esc(c.cat)}</td><td class="cmd"><code data-copy="/${esc(c.cmd)}">/${esc(c.cmd)}</code></td>
    <td class="desc">${esc(c.desc)}</td><td class="typo"><code>/${esc(c.typo)}</code></td></tr>`).join("")
    : `<tr><td colspan="4" class="muted">찾는 명령어가 없어요.</td></tr>`;
}

/* ---------- 내비 강조 ---------- */
function initNav() {
  const links = $$(".nav a");
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  $$("main section[id]").forEach(s => io.observe(s));
}

/* ---------- 시작 ---------- */
initServer();
renderSeasonTabs(); renderCrops(); renderQuality(); renderXpChart();
renderFoodChips(); renderFoods(); renderIngredients();
renderOres(); renderFish(); renderArtisan(); renderEnh(); renderRanks(); renderTickets(); renderBans(); renderCmds();
initNav();
$("#food-search").addEventListener("input", renderFoods);
$("#food-lv").addEventListener("input", renderFoods);
$("#cmd-search").addEventListener("input", renderCmds);
document.addEventListener("click", e => { const c = e.target.closest("[data-copy]"); if (c) copy(c.dataset.copy); });

/* ---------- 표 : 옆으로 밀지 않고 한눈에 (휴대폰에선 줄마다 카드처럼) ---------- */
function labelTables() {
  $$("table.data").forEach(t => {
    const heads = $$("thead th", t).map(th => th.textContent.trim());
    $$("tbody tr", t).forEach(tr => [...tr.children].forEach((td, i) => { if (heads[i] && !td.dataset.label) td.dataset.label = heads[i]; }));
  });
}
labelTables();
new MutationObserver(labelTables).observe(document.querySelector("main"), { childList: true, subtree: true });
