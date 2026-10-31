/* ============================================================
   Black 소개 사이트 스크립트
   ▼ 여기만 고치면 서버 이름·주소·디스코드가 바뀝니다
   ============================================================ */
const SERVER = {
  name: "BLACKHEIM",
  nameKo: "블랙하임",
  wordmark: ["BLA", "CK"],        // 첫 화면 큰 글자 (앞은 검은 흙색, 뒤는 금색)
  motto: "",
  ip: "blackheim.kro.kr",
  version: "Java 26.2",
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
  $$("[data-server-version]").forEach(el => (el.textContent = SERVER.version));
  document.title = `${SERVER.nameKo} ${SERVER.name} · 서버 안내`;
  $$("[data-server-name-ko]").forEach(el => (el.textContent = SERVER.nameKo));
  $("#server-ip").textContent = SERVER.ip;
  $("#copy-ip").addEventListener("click", () => copy(SERVER.ip));
  if (SERVER.discord) { const a = $("#discord-link"); a.href = SERVER.discord; a.hidden = false; }
  if (SERVER.logo) {
    $(".brand img").src = SERVER.logo;
    $(".hero h1").innerHTML = `<img class="hero-logo" src="${SERVER.logo}" alt="${esc(SERVER.name)}">`;
  }
  if (SERVER.heroImage) {
    const h = $(".hero");
    $(".hero-shot img").src = SERVER.heroImage; $(".hero-shot source")?.remove();
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
            <span class="badge${c.days > 8 ? ' long' : ''}">${growText(c.days)}</span>
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
// 성장 시간 : 1포인트 ≈ 2.3분
function growText(pts) {
  const m = Math.round(pts * 2.3);
  if (m < 50) return `약 ${m}분`;
  const h = Math.round(m / 30) / 2;
  return `약 ${h}시간`;
}
function renderQuality() {
  const c = cropById.strawberry;
  $("#quality-demo").innerHTML = [["기본", c.img], ["★ 은", c.q[0]], ["★★ 금", c.q[1]], ["★★★ 이리듐", c.q[2]]]
    .map(([n, img]) => `<figure><img src="${img}" alt="${n}"><figcaption>${n}</figcaption></figure>`).join("");
}
function renderXpChart() {
  const svg = $("#xp-chart"), W = 600, H = 180, P = { l: 52, r: 12, t: 12, b: 26 };
  const need = lv => Math.floor(100 * Math.pow(lv, 2.3));
  const max = need(49);
  const x = lv => P.l + (lv - 1) / 48 * (W - P.l - P.r);
  const y = v => H - P.b - v / max * (H - P.t - P.b);
  let pts = [];
  for (let lv = 1; lv <= 49; lv++) pts.push(`${x(lv).toFixed(1)},${y(need(lv)).toFixed(1)}`);
  const step = Math.pow(10, Math.floor(Math.log10(max / 4))) * (max / Math.pow(10, Math.floor(Math.log10(max / 4))) > 20 ? 2 : 1);
  const ticks = []; for (let t = 0; t <= max; t += step) ticks.push(t);
  svg.innerHTML = `
    ${ticks.map(t => `<line class="axis" x1="${P.l}" x2="${W - P.r}" y1="${y(t)}" y2="${y(t)}"/><text x="${P.l - 6}" y="${y(t) + 4}" text-anchor="end">${t >= 10000 ? (t / 10000) + "만" : t}</text>`).join("")}
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
    if (f.clvl > lv) return false;
    if (foodFilter === "crop" && !f.ings.every(s => s.startsWith("crop:"))) return false;
    if (foodFilter === "fish" && !f.ings.some(s => s.startsWith("fish:"))) return false;
    if (foodFilter === "meat" && !f.ings.some(s => meats.includes(s.split(":")[1]))) return false;
    if (foodFilter === "drink" && !drinks.some(d => f.name.includes(d))) return false;
    if (q) {
      const names = [f.name, ...f.ings.map(s => ingInfo(s).name)].join(" ");
      if (!names.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => a.clvl - b.clvl || a.value - b.value);
  $("#food-grid").innerHTML = list.length ? list.map(f => `
    <article class="card">
      <span class="value">${won(f.value)}</span>
      <div class="card-head">
        <img class="icon" src="${f.img}" alt="">
        <div><h4>${esc(f.name)}</h4><div class="badges"><span class="badge lv">요리 Lv.${f.clvl}</span><span class="badge">1개 ${f.sec}초</span></div></div>
      </div>
      <div class="ings">
        ${f.ings.map(s => { const i = ingInfo(s); return `<span class="ing${i.fish ? " fish" : ""}">${i.img ? `<img src="${i.img}" alt="">` : ""}${esc(i.name)} ×${i.n}</span>`; }).join("")}
      </div>
    </article>`).join("") : `<p class="empty">조건에 맞는 요리가 없어요.</p>`;
}
function renderIngredients() {
  $("#ing-grid").innerHTML = D.ingredients.map(i => `
    <div class="ing-item"><img src="${i.img}" alt=""><div>${esc(i.name)}<small>가치 ${won(i.price)}</small></div></div>`).join("");
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
      <td>${o.xp}</td>
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
    `<figure><img src="${r.img}" alt=""><figcaption>+${i}<br><small>${esc(D.tools.tierNames[i])}</small></figcaption></figure>`).join("");
}

/* ---------- 가공 ---------- */
function renderArtisan() {
  const A = Object.fromEntries(D.artisan.map(a => [a.id, a]));
  const rows = [
    ["술통", "과일", "art_wine", "와인", "1개 10~60초", "작물 값 ×2"],
    ["술통", "채소", "art_juice", "주스", "1개 10~60초", "작물 값 ×1.5"],
    ["절임병", "과일", "art_jam", "잼", "1개 10~60초", "작물 값 ×1.7"],
    ["절임병", "채소", "art_pickles", "피클", "1개 10~60초", "작물 값 ×1.6"],
    ["술통", "벼", "ing:vinegar", "식초 ×2 (요리 재료)", "1개 10~60초", "—"],
    ["목장 가공기", "고기", "art_smoked", "훈제 고기", "1개 10~60초", "고기 값 ×1.4"],
    ["목장 가공기", "우유", "ing:cheese", "치즈 (요리 재료)", "1개 10~60초", "—"],
    ["목장 가공기", "우유", "ing:butter", "버터 (요리 재료)", "1개 10~60초", "—"],
    ["목장 가공기", "달걀", "art_mayo", "마요네즈", "1개 10~60초", "달걀 값 ×1.6"],
    ["제분기", "밀", "ing:flour", "밀가루 (요리 재료)", "1개 10~60초", "—"],
    ["제분기", "비트", "ing:sugar", "설탕 ×2 (요리 재료)", "1개 10~60초", "—"],
    ["제분기", "옥수수 · 해바라기", "ing:oil", "식용유 (해바라기 ×3)", "1개 10~60초", "—"],
  ];
  const ingImg = id => (D.ingredients.find(i => i.id === id) || {}).img;
  $("#artisan-table").innerHTML = rows.map(([m, inp, id, out, t, v]) => `
    <tr><td><b>${m}</b></td><td>${inp}</td>
    <td class="name"><img src="${id.startsWith("ing:") ? ingImg(id.slice(4)) : A[id].img}" alt="">${out}</td><td>${t}</td><td>${v}</td></tr>`).join("");
  $("#art-row").innerHTML = D.artisan.map(a => `<figure><img src="${a.img}" alt=""><figcaption>${esc(a.name)}</figcaption></figure>`).join("");
}

/* ---------- 강화 ---------- */
function renderEnh() {
  const T = D.tools, nm = { black_pickaxe: "곡괭이", black_axe: "도끼", black_shovel: "삽", black_hoe: "괭이", black_sword: "칼" };
  // 강화할 때마다 모습이 바뀜 : 도구마다 +0 ~ +10 한 줄
  $("#tool-show").innerHTML = `<div class="tier-grid">`
    + `<div class="tier-row head"><span></span>${T.tierNames.map((n, i) => `<small>+${i}<br>${esc(n)}</small>`).join("")}</div>`
    + T.black.map(t => `<div class="tier-row"><b>${nm[t.id]}</b>${t.tiers.map(s => `<img src="${s}" alt="">`).join("")}</div>`).join("")
    + `<div class="tier-row"><b>낚싯대</b>${T.rods.map(r => `<img src="${r.img}" alt="">`).join("")}</div></div>`;
  $("#enh-table tbody").innerHTML = D.enh.map(e => `
    <tr class="${e.destroy ? "deep" : ""}"><td><b>+${e.lv}</b></td><td>${e.rank}등급</td><td>${e.rate}%</td><td>${won(e.price)}</td><td>${e.stones}개</td>
    <td>${e.destroy ? `<span class="tag-deep">파괴 ${e.destroy}%</span> 아니면 ` : ""}${e.down ? "50% 하락" : "유지"}</td>
    <td>${e.lv * 5}%</td></tr>`).join("");
  const sn = { farm: "농사 강화석", mine: "광산 강화석", fish: "낚시 강화석", butcher: "도축 강화석" };
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

/* ---------- 레벨 특전 ---------- */
function renderPerks() {
  const el = $("#perk-list");
  if (!el || !D.perks) return;
  const sk = [["farm", "농사"], ["mine", "광부"], ["fish", "낚시"], ["cook", "요리"]];
  el.innerHTML = sk.map(([k, n]) => `
    <article class="panel">
      <h3>${n} 특전</h3>
      <ul class="timeline">${D.perks.filter(p => p.sk === k).sort((a, b) => a.lv - b.lv)
        .map(p => `<li><b>Lv.${p.lv}</b> ${esc(p.name)} — ${esc(p.desc)}</li>`).join("")}</ul>
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

// ---- 치장 (옷장) : tools/cosmetics2.py · shoes.py · mf_52_wardrobe.sk ----
const COS = [["straw_hat", "밀짚모자", "hat", 60, "꽃 핀 꽂은 농부 모자"], ["cat_ears", "고양이 귀 리본", "hat", 80, "냥냥 · 분홍 리본"], ["flower_crown", "꽃 화관", "hat", 100, "알록달록 들꽃 엮음"], ["frog_hat", "개구리 모자", "hat", 100, "개굴개굴 웃는 개구리"], ["mushroom_hat", "버섯 모자", "hat", 100, "빨간 점박이 버섯"], ["bunny_ears", "토끼 귀 머리띠", "hat", 100, "한쪽 귀가 폴더 접힌 토끼"], ["santa_hat", "산타 모자", "hat", 120, "솜방울 달린 빨간 모자"], ["beret", "화가 베레모", "hat", 120, "별 핀 꽂은 빨간 베레모"], ["top_hat", "마술사 실크햇", "hat", 180, "보라 리본 · 꽃 장식 실크햇"], ["wizard_hat", "마법사 모자", "hat", 180, "별 · 달 박힌 휘어진 고깔"], ["viking_helm", "바이킹 투구", "hat", 220, "금테 두른 뿔 투구"], ["devil_horns", "악마 뿔", "hat", 220, "끝이 붉게 물든 뿔"], ["tiara", "다이아 티아라", "hat", 280, "푸른 보석 반짝 티아라"], ["halo", "천사 고리", "hat", 300, "머리 위 빛나는 고리"], ["crown", "황금 왕관", "hat", 350, "보석 박힌 벨벳 왕관"], ["wing_butterfly", "나비 날개", "wings", 300, "주황 · 파랑 호랑나비"], ["wing_dragonfly", "잠자리 날개", "wings", 300, "그물 무늬 투명 날개 네 장"], ["wing_leaf", "숲의 날개", "wings", 350, "커다란 잎 · 넝쿨 열매"], ["wing_fairy", "요정 날개", "wings", 350, "반짝이는 투명 날개"], ["wing_petal", "벚꽃잎 날개", "wings", 400, "커다란 꽃잎 다섯 장"], ["wing_demon", "악마 날개", "wings", 400, "붉은 막 날개"], ["wing_mech", "기계 날개", "wings", 450, "톱니바퀴 · 금속 칼날 깃"], ["wing_ice", "얼음 결정 날개", "wings", 450, "차갑게 빛나는 결정"], ["wing_dragon", "드래곤 날개", "wings", 450, "초록 용의 날개"], ["wing_angel", "천사 날개", "wings", 450, "새하얀 깃털 날개"], ["wing_peacock", "공작 날개", "wings", 500, "눈 무늬 화려한 부채"], ["wing_star", "별자리 날개", "wings", 550, "은하 위에 빛나는 별자리"], ["wing_thunder", "번개 날개", "wings", 550, "번쩍이는 번개 깃"], ["wing_phoenix", "불사조 날개", "wings", 600, "불꽃처럼 타오르는 깃털"], ["wing_rainbow", "무지개 날개", "wings", 600, "일곱 빛깔 깃털"], ["back_basket", "채소 바구니", "back", 120, "수확한 채소 가득"], ["back_tackle", "낚시 가방", "back", 120, "낚싯대 꽂힌 가방"], ["back_flower", "꽃 배낭", "back", 120, "꽃이 핀 분홍 배낭"], ["back_guitar", "기타", "back", 150, "등에 멘 통기타"], ["back_shell", "거북 등껍질", "back", 150, "단단한 초록 등껍질"], ["back_quiver", "화살통", "back", 150, "알록달록 깃 화살"], ["back_teddy", "곰인형 가방", "back", 180, "리본 단 곰돌이"], ["back_key", "태엽 열쇠", "back", 200, "태엽 인형처럼 빙글"], ["back_parasol", "레이스 양산", "back", 220, "분홍 레이스 양산"], ["cape_ocean", "바다 망토", "back", 250, "물결 무늬 푸른 망토"], ["cape_sakura", "벚꽃 망토", "back", 250, "꽃잎 흩날리는 분홍 망토"], ["back_sword", "전설의 대검", "back", 300, "푸른 빛 도는 거대한 검"], ["cape_flame", "불꽃 망토", "back", 300, "끝이 불타오르는 망토"], ["cape_night", "밤하늘 망토", "back", 300, "별이 박힌 남색 망토"], ["cape_royal", "왕실 망토", "back", 350, "금실 무늬 진홍 망토"], ["pet_chick", "병아리", "pet", 250, "삐약삐약"], ["pet_slime", "슬라임", "pet", 250, "말랑말랑 통통"], ["pet_hamster", "햄스터", "pet", 250, "볼 빵빵 해바라기씨"], ["pet_duck", "오리", "pet", 250, "파란 모자 꽥꽥"], ["pet_bunny", "토끼", "pet", 300, "깡총깡총"], ["pet_cat", "고양이", "pet", 300, "치즈냥이"], ["pet_penguin", "펭귄", "pet", 300, "빨간 털모자 펭귄"], ["pet_panda", "판다", "pet", 300, "대나무 냠냠"], ["pet_bee", "꿀벌", "pet", 300, "붕붕 날아다녀요"], ["pet_pig", "아기 돼지", "pet", 300, "꼬불 꼬리 꿀꿀"], ["pet_axolotl", "우파루파", "pet", 350, "분홍 아가미 우파"], ["pet_owl", "부엉이 박사", "pet", 350, "학사모 쓴 부엉이"], ["pet_fox", "여우", "pet", 350, "복슬복슬 꼬리"], ["pet_ghost", "꼬마 유령", "pet", 350, "둥실둥실 떠다녀요"], ["pet_dragon", "아기 드래곤", "pet", 500, "파닥파닥 날아다녀요"], ["aura_petal", "벚꽃잎 흩날림", "aura", 200, "파티클 효과"], ["aura_heart", "하트 뿅뿅", "aura", 200, "파티클 효과"], ["aura_note", "음표", "aura", 200, "파티클 효과"], ["aura_clover", "행운의 초록빛", "aura", 200, "파티클 효과"], ["aura_pollen", "꽃가루", "aura", 200, "파티클 효과"], ["aura_snow", "눈송이", "aura", 250, "파티클 효과"], ["aura_bubble", "비눗방울", "aura", 250, "파티클 효과"], ["aura_firefly", "반딧불이", "aura", 250, "파티클 효과"], ["aura_honey", "꿀방울", "aura", 250, "파티클 효과"], ["aura_magic", "마법 글자", "aura", 300, "파티클 효과"], ["aura_soul", "푸른 영혼불", "aura", 300, "파티클 효과"], ["aura_star", "별가루", "aura", 300, "파티클 효과"], ["aura_flame", "불꽃 발자국", "aura", 300, "파티클 효과"], ["aura_firework", "불꽃놀이", "aura", 350, "파티클 효과"], ["aura_totem", "축복의 빛", "aura", 400, "파티클 효과"], ["shoe_glass", "유리 구두", "shoes", 200, "반짝반짝 빛나는 유리 구두"], ["shoe_angel", "천사 날개 부츠", "shoes", 350, "발목에 하얀 날개가 펄럭"], ["shoe_phoenix", "불사조 부츠", "shoes", 400, "불꽃이 활활 타오르는 부츠"], ["shoe_frost", "얼음 여왕 부츠", "shoes", 350, "얼음 결정이 솟은 부츠"], ["shoe_galaxy", "은하수 부츠", "shoes", 350, "별이 흐르는 밤하늘 부츠"], ["shoe_cloud", "무지개 구름 신발", "shoes", 250, "폭신한 구름 위 무지개"], ["shoe_dragon", "용 비늘 부츠", "shoes", 350, "단단한 비늘 · 발톱"], ["shoe_sakura", "벚꽃 요정 슈즈", "shoes", 250, "꽃잎 리본이 감긴 요정 신발"], ["shoe_royal", "황금 왕실 부츠", "shoes", 400, "보석 박힌 왕의 부츠"], ["shoe_wizard", "마법사 컬 슈즈", "shoes", 250, "끝이 돌돌 말린 방울 신발"], ["shoe_neon", "네온 사이버 운동화", "shoes", 300, "형광으로 빛나는 운동화"], ["shoe_candy", "사탕 신발", "shoes", 200, "알록달록 막대사탕 신발"], ["shoe_ocean", "인어 조개 신발", "shoes", 250, "진주 · 조개 달린 신발"], ["shoe_demon", "악마 가시 부츠", "shoes", 350, "붉게 빛나는 가시 부츠"], ["shoe_bunny", "토끼 구름 슬리퍼", "shoes", 200, "귀 쫑긋 폭신 슬리퍼"]];
const COS_KINDS = [["hat", "모자"], ["wings", "날개"], ["back", "등 · 망토"], ["pet", "펫"], ["shoes", "신발"], ["aura", "오라"]];
let cosKind = "hat";
function renderCos() {
  $("#cos-tabs").innerHTML = COS_KINDS.map(([k, label]) =>
    `<button role="tab" data-k="${k}" aria-selected="${k === cosKind}">${label}<span class="count">${COS.filter(c => c[2] === k).length}</span></button>`).join("");
  $$("#cos-tabs button").forEach(b => b.addEventListener("click", () => { cosKind = b.dataset.k; renderCos(); }));
  $("#cos-grid").innerHTML = COS.filter(c => c[2] === cosKind).map(([id, name, k, price, d]) => `
    <article class="cos-card">
      <img src="img/cos/${id}.png" alt="" loading="lazy">
      <h4>${esc(name)}</h4>
      <p>${esc(d)}</p>
      <span class="mile">${price} M</span>
    </article>`).join("");
}

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
renderOres(); renderFish(); renderArtisan(); renderEnh(); renderRanks(); renderPerks(); renderTickets();
  renderCos(); renderBans(); renderCmds();
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
