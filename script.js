/* ===== Simple demo sign-in: each name gets its own saved waste log ===== */
const USER_KEY = "waste2power.currentUser.v1";
function readUser() { try { return (localStorage.getItem(USER_KEY) || "").trim(); } catch (_) { return ""; } }
const currentUser = readUser();
const userSlug = currentUser.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
const STORAGE_KEY = "waste2power.entries.v1" + (userSlug ? "." + userSlug : "");
const categoryInfo = {
  // Indicative Panipat market snapshots from public rate listings, checked 9 Oct 2026. These are NOT direct buyer quotes or auto-updating API data.
  "Organic": { emoji: "🍃", energy: 0.25, value: 0, rateLabel: "No resale rate listed", route: "Compost / biogas", advice: "Organic waste usually has no direct scrap resale value. Keep it separate for composting or check an authorised local biogas programme." },
  "Plastic": { emoji: "🧴", energy: 0.8, value: 14.15, rateLabel: "Indicative mixed-plastic market rate", route: "Plastic recycling", advice: "Empty, dry and sort plastic by resin type. This is an indicative Panipat market listing, not a guaranteed buyer offer. Ask the recycler for a quote before selling." },
  "Paper": { emoji: "📄", energy: 0.45, value: 7.35, rateLabel: "Indicative cardboard market rate", route: "Paper recycling", advice: "Keep paper and cardboard dry. The listed reference is for cardboard; newspaper and other paper grades can have different rates. Confirm the exact grade with a buyer." },
  "Metal": { emoji: "🥫", energy: 1.2, value: 36.65, rateLabel: "Iron scrap reference only", route: "Metal recycler", advice: "This reference rate is for iron scrap only—not aluminium, copper or other metals. Identify the metal and confirm the buyer's current rate before estimating payment." },
  "E-waste": { emoji: "🔋", energy: 0, value: 0, route: "Authorised e-waste handler", advice: "No resale amount is estimated for e-waste here. Do not dismantle batteries or electronics; contact an authorised handler to confirm their take-back terms." },
  "Other": { emoji: "🧺", energy: 0.1, value: 0, route: "Check local guidance", advice: "No selling value is estimated for mixed/unknown waste. Separate and identify it before contacting a buyer." }
};
const initialEntries = [
  { id: "seed-1", name: "Food scraps", category: "Organic", weight: 3.2, date: "Today" },
  { id: "seed-2", name: "Plastic bottles", category: "Plastic", weight: 2.5, date: "Today" },
  { id: "seed-3", name: "Paper & cardboard", category: "Paper", weight: 4.8, date: "Yesterday" },
  { id: "seed-4", name: "Aluminium cans", category: "Metal", weight: 2.0, date: "Yesterday" }
];
let entries = loadEntries();
let selectedImageUrl = null;
let selectedFile = null;
let toastTimer;

function loadEntries() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) { console.warn("Could not read local demo data", e); }
  return initialEntries.map(item => ({...item}));
}
function saveEntries() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }
  catch (e) { showToast("Browser storage is unavailable. Changes may not persist."); }
}
function totalWeight() { return entries.reduce((sum, e) => sum + Number(e.weight || 0), 0); }
function energyFor(entry) { return Number(entry.weight || 0) * (categoryInfo[entry.category]?.energy ?? 0); }
function totalEnergy() { return entries.reduce((sum, e) => sum + energyFor(e), 0); }
// Only rigid plastic uses the listed plastic rate. Thin film and multilayer packaging usually have no reliable resale rate.
function rateFor(category, form) {
  const base = categoryInfo[category]?.value ?? 0;
  if (category === "Plastic" && (form === "film" || form === "multilayer")) return 0;
  return base;
}
function totalValue() { return entries.reduce((sum, e) => sum + Number(e.weight || 0) * rateFor(e.category, e.form), 0); }
function fmt(value, decimals=1) { return Number(value).toLocaleString("en-IN", {maximumFractionDigits:decimals, minimumFractionDigits:decimals}); }
function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}
const pageCopy = {
  dashboard: [currentUser ? `Hello, ${currentUser} 👋` : "Hello 👋", "Let's turn waste into a better tomorrow."],
  scan: ["Scan waste", "Add an item and get a responsible disposal suggestion."],
  waste: ["My waste", "Your recorded items, all in one place."],
  impact: ["Energy & impact", "Understand the potential value of better waste sorting."],
  route: ["Collection route", "A concept for smarter campus collection."],
  marketplace: ["Seller marketplace", "List recyclable waste and estimate its potential selling value."],
  ewaste: ["E-waste & recycling guide", "Small disposal choices can make a difference."]
};
function showPage(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("active-page", p.id === `page-${name}`));
  document.querySelectorAll(".nav-link").forEach(b => b.classList.toggle("active", b.dataset.page === name));
  const copy = pageCopy[name] || pageCopy.dashboard;
  document.getElementById("pageTitle").textContent = copy[0];
  document.getElementById("pageSubtitle").textContent = copy[1];
  document.getElementById("sidebar").classList.remove("open");
  if (name === "dashboard" || name === "waste" || name === "impact") renderAll();
  window.scrollTo({top:0, behavior:"smooth"});
}
document.querySelectorAll("[data-page]").forEach(el => el.addEventListener("click", event => {
  event.preventDefault();
  showPage(el.dataset.page);
}));
document.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", () => showPage(el.dataset.go)));
document.getElementById("mobileMenu").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));

function renderAll() {
  const weight = totalWeight(), energy = totalEnergy(), value = totalValue();
  document.getElementById("statWaste").textContent = `${fmt(weight)} kg`;
  document.getElementById("statEnergy").textContent = `${fmt(energy)} kWh`;
  document.getElementById("statValue").textContent = `₹ ${Math.round(value).toLocaleString("en-IN")}`;
  document.getElementById("statEntries").textContent = entries.length;
  document.getElementById("donutTotal").textContent = fmt(weight);
  document.getElementById("impactEnergy").textContent = `${fmt(energy)} kWh`;
  document.getElementById("impactWaste").textContent = `${fmt(weight)} kg`;
  document.getElementById("impactValue").textContent = `₹ ${Math.round(value).toLocaleString("en-IN")}`;
  renderComposition();
  renderActivity();
  renderTable();
  renderBars();
  renderRecommendation();
}
function renderComposition() {
  const colors = {Organic:"#0fb77b",Plastic:"#4489ef",Paper:"#ffbf43",Metal:"#9561e8","E-waste":"#fa5961",Other:"#9caea8"};
  const order = Object.keys(categoryInfo);
  const total = totalWeight();
  let running = 0;
  const segments = [];
  const legend = [];
  order.forEach(cat => {
    const amount = entries.filter(e => e.category === cat).reduce((s,e)=>s+Number(e.weight||0),0);
    const pct = total ? amount / total * 100 : 0;
    segments.push(`${colors[cat]} ${running}% ${running + pct}%`);
    running += pct;
    if (amount > 0) legend.push(`<div class="legend-row"><i class="legend-dot" style="background:${colors[cat]}"></i><span>${cat}</span><b>${Math.round(pct)}%</b></div>`);
  });
  document.getElementById("donut").style.background = total ? `conic-gradient(${segments.join(",")})` : "#e7efea";
  document.getElementById("legend").innerHTML = legend.length ? legend.join("") : '<p class="form-hint">Add a waste entry to see your composition.</p>';
}
function renderActivity() {
  const target = document.getElementById("recentActivity");
  const latest = [...entries].slice(-4).reverse();
  target.innerHTML = latest.length ? latest.map(e => {
    const info = categoryInfo[e.category] || categoryInfo.Other;
    return `<div class="activity-item"><span class="activity-emoji">${info.emoji}</span><div class="activity-copy"><b>${safeText(e.name)}</b><small>${safeText(e.category)} · ${fmt(e.weight,2)} kg</small></div><span class="activity-time">${safeText(e.date || "Saved")}</span></div>`;
  }).join("") : '<p class="form-hint">No activity yet. Scan your first item.</p>';
}
function renderTable() {
  const target = document.getElementById("wasteTable");
  document.getElementById("tableCount").textContent = `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;
  target.innerHTML = entries.length ? [...entries].reverse().map(e => {
    const info = categoryInfo[e.category] || categoryInfo.Other;
    return `<tr><td><b>${safeText(info.emoji)} ${safeText(e.name)}</b><br><small>${safeText(e.date || "Saved")}</small></td><td><span class="category-pill">${safeText(e.category)}</span></td><td>${fmt(e.weight,2)} kg</td><td>${fmt(energyFor(e),2)} kWh</td><td>${safeText(info.route)}</td><td><button class="delete-btn" data-delete="${safeText(e.id)}" aria-label="Delete ${safeText(e.name)}">Delete</button></td></tr>`;
  }).join("") : '<tr><td colspan="6">No entries yet. Use Scan Waste to add your first item.</td></tr>';
  target.querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", () => {
    entries = entries.filter(e => e.id !== button.dataset.delete);
    saveEntries(); renderAll(); showToast("Waste entry deleted.");
  }));
}
function renderBars() {
  const target = document.getElementById("barChart");
  const order = Object.keys(categoryInfo);
  const amounts = order.map(cat => ({cat, amount:entries.filter(e=>e.category===cat).reduce((s,e)=>s+Number(e.weight||0),0)}));
  const max = Math.max(1, ...amounts.map(x=>x.amount));
  target.innerHTML = amounts.map(x => `<div class="bar-row"><span>${safeText(x.cat)}</span><div class="bar-track"><div class="bar-fill" style="width:${x.amount/max*100}%"></div></div><span class="bar-value">${fmt(x.amount,2)} kg</span></div>`).join("");
}
function renderRecommendation() {
  const mostCommon = Object.keys(categoryInfo).map(cat => ({cat, amount:entries.filter(e=>e.category===cat).reduce((s,e)=>s+Number(e.weight||0),0)})).sort((a,b)=>b.amount-a.amount)[0];
  const cat = mostCommon && mostCommon.amount > 0 ? mostCommon.cat : "Organic";
  document.getElementById("recommendationTitle").textContent = cat === "E-waste" ? "Keep e-waste out of mixed bins" : `Prioritise ${cat.toLowerCase()} waste separation`;
  document.getElementById("recommendationText").textContent = categoryInfo[cat].advice;
}
function previewSelectedFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) { showToast("Please choose a valid image file."); return; }
  if (file.size > 8 * 1024 * 1024) { showToast("Please choose an image smaller than 8 MB."); return; }
  if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);
  selectedFile = file;
  selectedImageUrl = URL.createObjectURL(file);
  document.getElementById("imagePreview").src = selectedImageUrl;
  document.getElementById("previewWrap").classList.remove("hidden");
  document.getElementById("dropZone").classList.add("has-preview");
  if (typeof refreshAiButton === "function") refreshAiButton();
}
document.getElementById("imageInput").addEventListener("change", e => previewSelectedFile(e.target.files[0]));
document.getElementById("removeImage").addEventListener("click", () => {
  if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);
  selectedImageUrl = null;
  selectedFile = null;
  document.getElementById("imageInput").value = "";
  if (typeof refreshAiButton === "function") refreshAiButton();
  document.getElementById("previewWrap").classList.add("hidden");
});
document.getElementById("analyzeBtn").addEventListener("click", () => {
  const category = document.getElementById("wasteCategory").value;
  const plasticForm = category === "Plastic" ? document.getElementById("plasticForm").value : undefined;
  const weight = Number(document.getElementById("wasteWeight").value);
  const description = document.getElementById("wasteDescription").value.trim();
  if (!Number.isFinite(weight) || weight <= 0 || weight > 10000) {
    showToast("Enter a weight greater than 0 and no more than 10,000 kg.");
    document.getElementById("wasteWeight").focus();
    return;
  }
  const info = categoryInfo[category];
  const name = description || ({"Organic":"Food waste","Plastic":"Plastic item","Paper":"Paper/cardboard","Metal":"Metal item","E-waste":"Electronic waste","Other":"Mixed waste"}[category]);
  const entry = {id: (crypto.randomUUID ? crypto.randomUUID() : `entry-${Date.now()}`), name, category, form: plasticForm, weight:Math.round(weight*100)/100, date:"Just now"};
  entries.push(entry);
  saveEntries();
  document.getElementById("emptyResult").classList.add("hidden");
  document.getElementById("resultContent").classList.remove("hidden");
  document.getElementById("resultEmoji").textContent = info.emoji;
  document.getElementById("resultCategory").textContent = category;
  document.getElementById("resultDescription").textContent = name;
  document.getElementById("resultWeight").textContent = `${fmt(weight,2)} kg`;
  document.getElementById("resultEnergy").textContent = `${fmt(energyFor(entry),2)} kWh`;
  const rate = rateFor(category, plasticForm);
  const estimatedMoney = Math.max(0, Number(weight) * Number(rate || 0));
  document.getElementById("resultMoney").textContent = `₹ ${fmt(estimatedMoney,2)}`;
  document.getElementById("resultRate").textContent = rate > 0 ? `${info.rateLabel || "Indicative market reference"}: ₹${fmt(rate,2)}/kg × ${fmt(weight,2)} kg` : (category === "Plastic" ? "Thin film and multilayer plastic usually has no reliable resale rate. Ask a recycler if they accept it." : "No selling value estimated for this category");
  document.getElementById("resultAdvice").textContent = info.advice;
  renderAll();
  showToast("Entry saved. Dashboard totals updated.");
});
document.getElementById("resetDemo").addEventListener("click", () => {
  entries = initialEntries.map(item => ({...item}));
  saveEntries(); renderAll(); showToast("Sample data restored.");
});
const MARKET_KEY = "waste2power.market.listings.v1";
function loadListings() {
  try { const x = JSON.parse(localStorage.getItem(MARKET_KEY) || "[]"); return Array.isArray(x) ? x : []; }
  catch (_) { return []; }
}
const sampleListings = [
  { id: "sample-l1", sample: true, category: "Plastic", form: "rigid", weight: 6, condition: "Clean and sorted", details: "Sample: washed PET water and soft-drink bottles.", contact: "sample@example.com", createdAt: "2026-10-09T08:00:00.000Z" },
  { id: "sample-l2", sample: true, category: "Paper", weight: 12, condition: "Compressed / bulk", details: "Sample: flattened cardboard boxes, dry.", contact: "sample@example.com", createdAt: "2026-10-09T09:00:00.000Z" }
];
let listings = loadListings();
try { if (localStorage.getItem(MARKET_KEY) === null) { listings = sampleListings.map(x => ({...x})); localStorage.setItem(MARKET_KEY, JSON.stringify(listings)); } } catch (_) { listings = sampleListings.map(x => ({...x})); }
const demoOffers = {
  Plastic: [{buyer:"Demo Recycler A",rate:14.2,pickup:"Pickup by arrangement"},{buyer:"Demo Recycler B",rate:12.5,pickup:"Seller drop-off"}],
  Paper: [{buyer:"Demo Paper Buyer A",rate:7.4,pickup:"Bulk quantity preferred"},{buyer:"Demo Paper Buyer B",rate:6.8,pickup:"Seller drop-off"}],
  Metal: [{buyer:"Demo Scrap Buyer A",rate:36.5,pickup:"Iron only; confirm grade"},{buyer:"Demo Scrap Buyer B",rate:32,pickup:"Seller drop-off"}]
};
function renderMarketplace() {
  const count = document.getElementById("listingCount");
  const target = document.getElementById("marketplaceListings");
  const offerTarget = document.getElementById("offerComparison");
  if (count) count.textContent = `${listings.length} ${listings.length === 1 ? "LISTING" : "LISTINGS"}`;
  if (target) target.innerHTML = listings.length ? [...listings].reverse().map(l => {
    const total = Number(l.weight) * Number(rateFor(l.category, l.form) || 0);
    const formLabel = l.category === "Plastic" && l.form ? ` · ${({rigid:"Rigid",film:"Thin film",multilayer:"Multilayer"}[l.form]||"")}` : "";
    return `<article class="recycler-card"><span class="recycler-type">${safeText(l.category.toUpperCase())}${safeText(formLabel)} · ${safeText(l.condition)}</span>${l.sample ? '<span class="sample-badge">SAMPLE</span>' : ""}<h4>${safeText(l.weight)} kg listed</h4><p>${safeText(l.details || "No extra details")}</p><p><b>Indicative estimate:</b> ${total > 0 ? "₹" + fmt(total,2) : "No reliable resale rate. Ask a recycler."}</p><p><b>Contact:</b> ${safeText(l.contact)}</p><small class="contact-note">Saved in this browser only. Listing is not public.</small><button class="btn btn-outline btn-small" data-remove-listing="${safeText(l.id)}">Delete listing</button></article>`;
  }).join("") : '<div class="empty-market">No seller listings yet. Add your first listing using the form.</div>';
  if (target) target.querySelectorAll("[data-remove-listing]").forEach(b => b.addEventListener("click", () => {
    listings = listings.filter(l => l.id !== b.dataset.removeListing);
    localStorage.setItem(MARKET_KEY, JSON.stringify(listings)); renderMarketplace(); showToast("Listing deleted.");
  }));
  if (offerTarget) offerTarget.innerHTML = Object.entries(demoOffers).map(([cat,offers]) => `<article class="recycler-card"><h4>${safeText(cat)} — example offers</h4>${offers.map(o=>`<div class="market-rate-row"><span>${safeText(o.buyer)}<br><small>${safeText(o.pickup)}</small></span><b>₹${fmt(o.rate,2)}/kg</b></div>`).join("")}</article>`).join("");
}
const listingForm = document.getElementById("listingForm");
if (listingForm) listingForm.addEventListener("submit", event => {
  event.preventDefault();
  const weight = Number(document.getElementById("listingWeight").value);
  const contact = document.getElementById("listingContact").value.trim();
  if (!(weight > 0) || !contact) { showToast("Enter a valid weight and contact method."); return; }
  listings.push({
    id: (crypto.randomUUID ? crypto.randomUUID() : `listing-${Date.now()}`),
    category: document.getElementById("listingCategory").value,
    form: document.getElementById("listingCategory").value === "Plastic" ? document.getElementById("listingPlasticForm").value : undefined,
    weight: Math.round(weight*100)/100,
    condition: document.getElementById("listingCondition").value,
    details: document.getElementById("listingDetails").value.trim(),
    contact,
    createdAt: new Date().toISOString()
  });
  try { localStorage.setItem(MARKET_KEY, JSON.stringify(listings)); }
  catch (_) { showToast("Browser storage unavailable; listing may not persist."); }
  listingForm.reset(); renderMarketplace(); showToast("Demo listing saved on this device.");
});
const receiptForm = document.getElementById("receiptForm");
if (receiptForm) receiptForm.addEventListener("submit", event => {
  event.preventDefault();
  const material = document.getElementById("receiptMaterial").value;
  const weight = Number(document.getElementById("receiptWeight").value);
  const rate = Number(document.getElementById("receiptRate").value);
  const buyer = document.getElementById("receiptBuyer").value.trim();
  if (!(weight > 0) || !(rate >= 0) || !buyer) { showToast("Please check receipt details."); return; }
  const id = `W2P-${Date.now().toString().slice(-8)}`;
  const out = document.getElementById("receiptOutput");
  out.classList.remove("hidden");
  out.innerHTML = `<article class="recycler-card" id="receiptPrintable"><span class="recycler-type">WASTE2POWER · DEMO RECEIPT</span><h3>${id}</h3><p><b>Material:</b> ${safeText(material)}</p><p><b>Actual agreed weight:</b> ${fmt(weight,2)} kg</p><p><b>Agreed rate:</b> ₹${fmt(rate,2)}/kg</p><p><b>Total agreed amount:</b> ₹${fmt(weight*rate,2)}</p><p><b>Buyer:</b> ${safeText(buyer)}</p><p><b>Date:</b> ${new Date().toLocaleString("en-IN")}</p><small class="contact-note">Demo record only. This does not verify weight, buyer identity, delivery or payment.</small><button class="btn btn-outline btn-small" onclick="window.print()">Print / Save PDF</button></article>`;
  showToast("Demo receipt generated.");
});

/* ===== AI waste detection (Gemini) ===== */
const GEMINI_KEY_STORAGE = "waste2power.geminiKey.v1";
// Tried in order; if a model name is retired (404) the next one is used.
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-2.0-flash"];
const AI_CATEGORIES = ["Organic", "Plastic", "Paper", "Metal", "E-waste", "Other"];

function getGeminiKey() { try { return localStorage.getItem(GEMINI_KEY_STORAGE) || ""; } catch (_) { return ""; } }
function setAiStatus(text, kind) {
  const el = document.getElementById("aiStatus");
  el.textContent = text;
  el.className = "ai-status" + (kind ? " " + kind : "");
}
function refreshAiButton() {
  const btn = document.getElementById("aiDetectBtn");
  if (!btn) return;
  btn.disabled = !selectedFile;
  if (!selectedFile) setAiStatus("Upload a photo first, then tap detect.");
  else if (!getGeminiKey()) setAiStatus("Add your Gemini API key in AI settings below, then tap detect.");
  else setAiStatus("Photo ready. Tap detect.");
}
function fileToResizedBase64(file, maxSide = 1024) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read this image.")); };
    img.src = url;
  });
}
async function callGemini(model, key, base64) {
  const prompt = "You are a waste-sorting assistant. Look at the main waste item in the photo. " +
    "Return JSON only with keys: category (exactly one of Organic, Plastic, Paper, Metal, E-waste, Other), " +
    "item (short name, max 5 words), confidence (number 0 to 1), " +
    "plastic_form (only when category is Plastic: rigid for bottles, jugs, boxes, cups and caps; film for thin carry bags and sheets; multilayer for chips packets and foil-lined pouches; otherwise null). " +
    "Use E-waste for electronics and batteries. Use Other if unsure or mixed. If no waste item is visible, use Other with low confidence.";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: base64 } }] }],
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
    })
  });
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
async function detectWithAi() {
  const key = getGeminiKey();
  if (!selectedFile) { setAiStatus("Upload a photo first.", "err"); return; }
  if (!key) { document.getElementById("aiSettings").open = true; setAiStatus("Please add your Gemini API key first.", "err"); return; }
  const btn = document.getElementById("aiDetectBtn");
  btn.disabled = true;
  setAiStatus("Analysing photo with AI...", "busy");
  try {
    const base64 = await fileToResizedBase64(selectedFile);
    let result = null, lastErr = null;
    for (const model of GEMINI_MODELS) {
      try { result = await callGemini(model, key, base64); break; }
      catch (e) { lastErr = e; if (e.status !== 404) break; }
    }
    if (!result) throw lastErr || new Error("No result");
    const category = AI_CATEGORIES.includes(result.category) ? result.category : "Other";
    const item = String(result.item || "").replace(/[<>]/g, "").slice(0, 80);
    const conf = Math.round(Math.min(1, Math.max(0, Number(result.confidence) || 0)) * 100);
    document.getElementById("wasteCategory").value = category;
    if (item) document.getElementById("wasteDescription").value = item;
    if (category === "Plastic") {
      const f = ["rigid", "film", "multilayer"].includes(result.plastic_form) ? result.plastic_form : "rigid";
      document.getElementById("plasticForm").value = f;
    }
    syncPlasticField();
    const low = conf < 60 ? " Low confidence, please check it yourself." : " Please confirm before saving.";
    setAiStatus(`AI suggests: ${category}${item ? " (" + item + ")" : ""}, ${conf}% confident.${low}`, conf < 60 ? "err" : "ok");
  } catch (e) {
    const msg = e.status === 400 || e.status === 403 ? "The API key looks invalid or not allowed. Check it in AI settings."
      : e.status === 429 ? "Free quota reached. Wait a minute and try again."
      : e instanceof SyntaxError ? "AI reply was not readable. Try again."
      : "Could not reach the AI service. Check internet and try again. You can still choose the category manually.";
    setAiStatus(msg, "err");
  } finally {
    btn.disabled = !selectedFile;
  }
}
document.getElementById("aiDetectBtn").addEventListener("click", detectWithAi);
document.getElementById("saveKeyBtn").addEventListener("click", () => {
  const v = document.getElementById("geminiKey").value.trim();
  if (!v) { showToast("Paste your API key first."); return; }
  try { localStorage.setItem(GEMINI_KEY_STORAGE, v); } catch (_) { showToast("Browser storage unavailable."); return; }
  document.getElementById("geminiKey").value = "";
  showToast("API key saved in this browser.");
  refreshAiButton();
});
document.getElementById("clearKeyBtn").addEventListener("click", () => {
  try { localStorage.removeItem(GEMINI_KEY_STORAGE); } catch (_) {}
  showToast("API key removed.");
  refreshAiButton();
});
refreshAiButton();

/* ===== Plastic type selector ===== */
function syncPlasticField() {
  const isPlastic = document.getElementById("wasteCategory").value === "Plastic";
  document.getElementById("plasticFormField").classList.toggle("hidden", !isPlastic);
}
document.getElementById("wasteCategory").addEventListener("change", syncPlasticField);
syncPlasticField();

/* ===== Camera, drag and drop, impact line, marketplace plastic type ===== */
document.getElementById("cameraInput").addEventListener("change", e => previewSelectedFile(e.target.files[0]));
const dz = document.getElementById("dropZone");
["dragenter", "dragover"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add("drag-over"); }));
["dragleave", "drop"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove("drag-over"); }));
dz.addEventListener("drop", e => { const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) previewSelectedFile(f); });

function renderImpactLine() {
  const el = document.getElementById("impactLine");
  if (!el) return;
  const w = totalWeight();
  el.textContent = w > 0 ? `You have logged ${fmt(w)} kg of waste, about ${fmt(totalEnergy())} kWh of indicative energy and ₹${Math.round(totalValue()).toLocaleString("en-IN")} of estimated value.` : "Log your first item to see your impact.";
}
const _renderAllBase = renderAll;
renderAll = function () { _renderAllBase(); renderImpactLine(); };

function syncListingPlastic() {
  document.getElementById("listingPlasticField").classList.toggle("hidden", document.getElementById("listingCategory").value !== "Plastic");
}
document.getElementById("listingCategory").addEventListener("change", syncListingPlastic);
syncListingPlastic();

/* ===== First render (must stay last, after all declarations) ===== */
renderMarketplace();
renderAll();

/* ===== Sign-in screen, greeting and logout ===== */
(function initUser() {
  const screen = document.getElementById("loginScreen");
  const avatar = document.getElementById("userAvatar");
  const logout = document.getElementById("logoutBtn");
  document.getElementById("pageTitle").textContent = pageCopy.dashboard[0];
  if (currentUser) {
    avatar.textContent = currentUser.charAt(0).toUpperCase();
    avatar.title = currentUser;
    logout.hidden = false;
    screen.hidden = true;
  } else {
    avatar.textContent = "?";
    screen.hidden = false;
    setTimeout(() => document.getElementById("loginName").focus(), 50);
  }
  document.getElementById("loginForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("loginName").value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
    if (name.length < 2) { document.getElementById("loginError").textContent = "Please enter at least 2 characters."; return; }
    try { localStorage.setItem(USER_KEY, name.slice(0, 30)); } catch (_) { document.getElementById("loginError").textContent = "Browser storage is blocked, so sign-in cannot be saved."; return; }
    location.reload();
  });
  logout.addEventListener("click", () => {
    try { localStorage.removeItem(USER_KEY); } catch (_) {}
    location.reload();
  });
})();
