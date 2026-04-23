/* ============================================
   STATE
   ============================================ */
const state = {
  currentScene: "scene-intro",
  storyIndex: 0,
  warmUpIndex: 0,
  analysisIndex: 0,
  scores: { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
};

/* ============================================
   SCENE CONTROL
   ============================================ */
function showScene(id) {
  document.querySelectorAll(".scene").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  state.currentScene = id;
  // เปิด/ปิดตารางพื้นหลังเฉพาะหน้าแชท
  document.body.classList.toggle("chat-mode", id === "scene-chat");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================================
   STORY INTRO (typewriter + mood + dots + rain)
   ============================================ */
let typewriterTimer = null;
let typing = false;

function renderDots() {
  const dotsEl = document.getElementById("storyDots");
  dotsEl.innerHTML = storyScenes
    .map((_, i) => `<span class="dot${i === state.storyIndex ? " active" : ""}"></span>`)
    .join("");
}

function typeWriter(el, html, speed = 38) {
  typing = true;
  el.innerHTML = "";
  // parse html into tokens: either a tag string or a single char
  const tokens = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] === "<") {
      const end = html.indexOf(">", i);
      tokens.push(html.slice(i, end + 1));
      i = end + 1;
    } else {
      tokens.push(html[i]);
      i++;
    }
  }
  let idx = 0;
  let buffer = "";
  const caret = '<span class="caret">&nbsp;</span>';
  clearInterval(typewriterTimer);
  typewriterTimer = setInterval(() => {
    if (idx >= tokens.length) {
      clearInterval(typewriterTimer);
      el.innerHTML = buffer;
      typing = false;
      return;
    }
    buffer += tokens[idx];
    el.innerHTML = buffer + caret;
    idx++;
  }, speed);
}

function renderStory() {
  const textEl = document.getElementById("storyText");
  const intro = document.getElementById("scene-intro");
  const rain = document.getElementById("rain");
  const scene = storyScenes[state.storyIndex];

  // mood: ฉาก 1-4 = ฝน (mood-rain), ฉาก 5 = กำลังอุ่น, ฉาก 6 = อุ่นเต็มที่
  let moodClass = "mood-rain";
  if (state.storyIndex === 4) moodClass = "mood-warm-1";
  else if (state.storyIndex >= 5) moodClass = "mood-warm-2";
  intro.className = `scene active ${moodClass}`;

  // ฝนหยุดตอนเข้าร้าน (ฉาก 5-6)
  const steam = document.getElementById("steam");
  if (state.storyIndex >= 4) {
    rain.classList.add("stopped");
    steam.classList.add("active");  // กลิ่น/ควันชาลอยขึ้น
  } else {
    rain.classList.remove("stopped");
    steam.classList.remove("active");
  }

  // โชว์รูปเจ้าของร้านเฉพาะฉากสุดท้าย (ตอนทักทายหน้าร้าน)
  const avatar = document.getElementById("storyAvatar");
  if (avatar) {
    avatar.classList.toggle("show", state.storyIndex === 5);
  }

  // โชว์ SVG หน้าร้านตอนเจอป้าย (intro 4, index 3)
  const shopIllu = document.getElementById("shopIllustration");
  if (shopIllu) {
    shopIllu.classList.toggle("show", state.storyIndex === 3);
  }

  // อัปเดต label ปุ่มตามสถานการณ์
  const nextBtn = document.getElementById("storyNext");
  if (nextBtn) {
    nextBtn.textContent = scene.cta || "ต่อไป";
  }

  // ปุ่ม "เดินกลับ" โชว์เฉพาะฉากที่เจอป้ายร้าน (index 3) — decision point
  const backBtn = document.getElementById("storyBack");
  if (backBtn) {
    backBtn.hidden = state.storyIndex !== 3;
  }

  renderDots();
  typeWriter(textEl, scene.text);
}

document.getElementById("storyBack").addEventListener("click", () => {
  location.href = "index.html";
});

document.getElementById("storyNext").addEventListener("click", () => {
  // กดขณะพิมพ์ = ข้ามไป show เต็มเลย
  if (typing) {
    clearInterval(typewriterTimer);
    document.getElementById("storyText").innerHTML =
      storyScenes[state.storyIndex].text;
    typing = false;
    return;
  }
  state.storyIndex++;
  if (state.storyIndex >= storyScenes.length) {
    flashToChat();
  } else {
    renderStory();
  }
});

function flashToChat() {
  const flash = document.getElementById("flash");
  flash.classList.remove("active");
  void flash.offsetWidth; // restart animation
  flash.classList.add("active");
  // สลับซีนตอนจอขาวพีค (~450ms) — ก่อนที่แสงจะจาง
  setTimeout(() => startChat(), 450);
}

function flashToResult() {
  const flash = document.getElementById("flash");
  flash.classList.remove("active");
  void flash.offsetWidth;
  flash.classList.add("active");
  setTimeout(() => showResult(), 450);
}

// render first scene on load
renderStory();

/* ============================================
   CHAT HELPERS
   ============================================ */
function addNpcMessage(text) {
  const container = document.getElementById("chatMessages");
  const div = document.createElement("div");
  div.className = "msg npc";
  // รองรับ markdown เบาๆ: *text* = italic
  div.innerHTML = text.replace(/\*(.+?)\*/g, "<i>$1</i>");
  container.appendChild(div);
  const scroller = document.getElementById("chatScroll") || container;
  scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
}

function addUserMessage(text) {
  const container = document.getElementById("chatMessages");
  const div = document.createElement("div");
  div.className = "msg user";
  div.textContent = text;
  container.appendChild(div);
  const scroller = document.getElementById("chatScroll") || container;
  scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
}

function addTypingIndicator() {
  const container = document.getElementById("chatMessages");
  const div = document.createElement("div");
  div.className = "msg npc typing";
  div.id = "typingIndicator";
  div.innerHTML = "<span></span><span></span><span></span>";
  container.appendChild(div);
  const scroller = document.getElementById("chatScroll") || container;
  scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
}

function removeTypingIndicator() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

function renderChoices(choices, onSelect) {
  const container = document.getElementById("chatChoices");
  container.innerHTML = "";
  choices.forEach((c, i) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = c.text;
    btn.addEventListener("click", () => onSelect(c, i));
    container.appendChild(btn);
  });
  // scroll ให้ choices ที่เพิ่งขึ้นมาอยู่ในสายตา
  const scroller = document.getElementById("chatScroll");
  if (scroller) scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
}

function clearChoices() {
  document.getElementById("chatChoices").innerHTML = "";
}

function renderTextInput(onSubmit) {
  const container = document.getElementById("chatChoices");
  container.innerHTML = `
    <div class="text-input-wrap">
      <textarea id="userInput" placeholder="พิมพ์อะไรก็ได้... หรือเว้นว่างไว้ก็ได้" rows="3" maxlength="500"></textarea>
      <button class="choice-btn submit-btn" id="submitBtn">ส่ง</button>
    </div>
  `;
  const input = document.getElementById("userInput");
  input.focus();
  document.getElementById("submitBtn").addEventListener("click", () => {
    const text = input.value.trim();
    container.innerHTML = "";
    onSubmit(text);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function npcSpeak(messages) {
  for (const msg of messages) {
    addTypingIndicator();
    await sleep(700 + Math.min(msg.length * 25, 1400));
    removeTypingIndicator();
    addNpcMessage(msg);
    await sleep(400);
  }
}

/* ============================================
   CHAT FLOW ENGINE
   ============================================ */
async function startChat() {
  showScene("scene-chat");
  // เคลียร์ข้อความเก่า (ถ้ามี) — เผื่อ restart
  document.getElementById("chatMessages").innerHTML = "";
  clearChoices();
  await runStep("intro");
}

async function runStep(stepId) {
  if (stepId === "analysis") {
    return startAnalysis();
  }
  if (stepId === "result") {
    return flashToResult();
  }

  const step = chatScript[stepId];
  if (!step) return;

  // NPC messages
  if (step.npc && step.npc.length) {
    await npcSpeak(step.npc);
  }

  // Text input
  if (step.input) {
    renderTextInput(async (text) => {
      if (text) addUserMessage(text);
      await sleep(500);
      // เลือก response ตามความยาว
      let resp;
      if (!text || text.length < 2) resp = textInputResponses.empty;
      else if (text.length < 30) resp = textInputResponses.short;
      else resp = textInputResponses.long;
      await npcSpeak(resp);
      await runStep(step.next);
    });
    return;
  }

  // No choices = auto advance
  if (!step.choices) {
    if (step.next) await runStep(step.next);
    return;
  }

  // Render choices
  renderChoices(step.choices, async (choice) => {
    addUserMessage(choice.text);
    clearChoices();
    await sleep(500);
    if (choice.response && choice.response.length) {
      await npcSpeak(choice.response);
    }
    await runStep(choice.next);
  });
}

/* ============================================
   ANALYSIS QUESTIONS (scored)
   ============================================ */
async function startAnalysis() {
  state.analysisIndex = 0;
  await askAnalysisQuestion();
}

async function askAnalysisQuestion() {
  const q = analysisQuestions[state.analysisIndex];
  if (!q) {
    // จบหมด → เข้า outro (บทปิด) → flash → result
    return runStep("outro");
  }
  await npcSpeak([q.question]);
  renderChoices(q.choices, async (choice) => {
    addUserMessage(choice.text);
    clearChoices();
    addScore(choice.axis, choice.score);
    state.analysisIndex++;
    await sleep(600);
    await askAnalysisQuestion();
  });
}

/* ============================================
   SCORING
   ============================================ */
function addScore(axis, score) {
  state.scores[axis] = (state.scores[axis] || 0) + score;
}

function calculateType() {
  const s = state.scores;
  return [
    s.E >= s.I ? "E" : "I",
    s.S >= s.N ? "S" : "N",
    s.T >= s.F ? "T" : "F",
    s.J >= s.P ? "J" : "P"
  ].join("");
}

/* ============================================
   SHOW RESULT
   ============================================ */
/* ข้อความเจ้าของร้านปิดท้าย (random ต่อครั้ง) */
const shopkeeperClosings = [
  "ดูแลกันและกันให้ดีๆ นะ ขอให้โชคดี",
  "เจ้าฮู้กมองออกตั้งแต่แรกแล้วล่ะ ว่าเข้ากันได้",
  "พากลับบ้านไปได้เลย มันเลือกเราเอง",
  "ถ้าเหงาเมื่อไหร่ มันจะอยู่ข้างๆ เสมอ",
  "มีอะไรอยากเล่า บอกมันได้นะ สัตว์เก็บความลับเก่งกว่าคน"
];

function showResult() {
  const type = calculateType();
  const char = characters[type];
  document.getElementById("resultImage").src = char.image;
  document.getElementById("resultImage").alt = char.name;
  document.getElementById("resultName").textContent = char.name;
  document.getElementById("resultTagline").textContent = char.tagline || "";
  document.getElementById("resultPetIs").textContent = char.petIs || "";
  document.getElementById("resultYouAre").textContent = char.youAre || "";
  document.getElementById("resultGentle").textContent = char.gentle || "";

  // Traits chips
  const traitsEl = document.getElementById("resultTraits");
  traitsEl.innerHTML = (char.traits || [])
    .map(t => `<span class="trait-chip">${t}</span>`).join("");

  // Compatible pets
  const compatEl = document.getElementById("resultCompatible");
  compatEl.innerHTML = (char.compatible || [])
    .map(t => {
      const c = characters[t];
      if (!c) return "";
      return `
        <div class="compat-card">
          <img src="${c.image}" alt="${c.name}"/>
          <div class="compat-name">${c.name}</div>
        </div>`;
    }).join("");

  // ข้อความปิดจากเจ้าของร้าน
  const closing = shopkeeperClosings[Math.floor(Math.random() * shopkeeperClosings.length)];
  document.getElementById("resultNpcLine").textContent = closing;

  // ผูกปุ่มบันทึกภาพ
  const shareBtn = document.getElementById("btnShare");
  shareBtn.onclick = () => saveResultImage(char);
  shareBtn.classList.remove("copied");
  shareBtn.textContent = "📸 บันทึกภาพ";

  showScene("scene-result");
}

function populateExportCard(char) {
  document.getElementById("exportImage").src = char.image;
  document.getElementById("exportImage").alt = char.name;
  document.getElementById("exportName").textContent = char.name;
  document.getElementById("exportTagline").textContent = char.tagline || "";
  document.getElementById("exportPetIs").textContent = char.petIs || "";
  document.getElementById("exportYouAre").textContent = char.youAre || "";
  document.getElementById("exportGentle").textContent = char.gentle || "";

  document.getElementById("exportTraits").innerHTML = (char.traits || [])
    .map(t => `<span>${t}</span>`).join("");

  document.getElementById("exportCompatible").innerHTML = (char.compatible || [])
    .map(t => {
      const c = characters[t];
      if (!c) return "";
      return `
        <div class="export-compat-card">
          <img src="${c.image}" alt="${c.name}"/>
          <div class="export-compat-name">${c.name}</div>
        </div>`;
    }).join("");
}

async function saveResultImage(char) {
  const btn = document.getElementById("btnShare");
  const target = document.getElementById("exportCard");
  if (!target || typeof html2canvas === "undefined") {
    alert("บันทึกภาพไม่ได้ ลองรีโหลดแล้วลองอีกครั้งนะ");
    return;
  }

  const originalText = btn.textContent;
  btn.textContent = "⏳ กำลังบันทึก...";
  btn.disabled = true;

  // เติมข้อมูลลง export card แล้วย้ายมาแสดง (off-screen z-index -1)
  populateExportCard(char);
  target.classList.add("capturing");

  // รอให้รูปโหลดเสร็จก่อน capture
  const img = document.getElementById("exportImage");
  if (img && !img.complete) {
    await new Promise(res => {
      img.onload = img.onerror = res;
    });
  }
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  try {
    const canvas = await html2canvas(target, {
      backgroundColor: "#fff5e3",
      scale: 2,
      useCORS: true,
      logging: false
    });

    const link = document.createElement("a");
    const safeName = (char.name || "result").replace(/[^\u0E00-\u0E7Fa-zA-Z0-9]/g, "_");
    link.download = `pet-shop-${safeName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    btn.textContent = "✅ บันทึกแล้ว!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove("copied");
      btn.disabled = false;
    }, 2000);
  } catch (e) {
    console.error(e);
    alert("บันทึกภาพไม่ได้ ลองใหม่อีกครั้งนะ");
    btn.textContent = originalText;
    btn.disabled = false;
  } finally {
    target.classList.remove("capturing");
  }
}

/* ============================================
   DEV SHORTCUTS (สำหรับเทส)
   ============================================
   URL params:
     ?result=penguin-chess → ข้ามไปหน้า result (ใช้ slug ชื่อตัวละคร)
     ?skip=chat            → ข้าม intro ไปที่แชทเลย
     ?skip=analysis        → ข้าม warm-up ไปข้อคะแนนเลย

   Console (F12):
     goResult("puppy-firework") → กระโดดไปหน้า result
     goChat()           → ไปแชทเลย
     goAnalysis()       → ไปข้อคะแนนเลย
============================================ */
const TYPES = Object.keys(characters);

// หา type จาก slug (ชื่อตัวละคร)
function resolveType(input) {
  if (!input) return null;
  const s = String(input).toLowerCase();
  for (const [t, c] of Object.entries(characters)) {
    if (c.slug && c.slug.toLowerCase() === s) return t;
  }
  return null;
}

function goResult(input) {
  const type = resolveType(input);
  if (!type) {
    console.warn(`ไม่มี "${input}" — ใช้ turtle-library แทน`);
  }
  const finalType = type || "ISTJ";
  // hack คะแนนให้ออกเป็น type ที่ต้องการ
  state.scores = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };
  for (const ch of finalType) state.scores[ch] = 10;
  showResult();
}

function goChat() { startChat(); }
function goAnalysis() { startChat().then(() => startAnalysis()); }

// expose ให้เรียกจาก console ได้
window.goResult = goResult;
window.goChat = goChat;
window.goAnalysis = goAnalysis;

// อ่าน URL param ตอนโหลดหน้า
(function handleDevParams() {
  const p = new URLSearchParams(location.search);
  const result = p.get("result");
  const skip = p.get("skip");
  if (result) {
    setTimeout(() => goResult(result), 50);
  } else if (skip === "chat") {
    setTimeout(() => goChat(), 50);
  } else if (skip === "analysis") {
    setTimeout(() => goAnalysis(), 50);
  }
})();
