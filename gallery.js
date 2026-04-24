/* ============================================
   GALLERY — render 16 characters + modal
   อ่าน data.js → characters (16 ตัว keyed ด้วย MBTI)
   ============================================ */

// เรียงลำดับตามหมวด MBTI (IN → IS → EN → ES)
const MBTI_ORDER = [
  "INFJ", "INFP", "INTJ", "INTP",
  "ISFJ", "ISFP", "ISTJ", "ISTP",
  "ENFJ", "ENFP", "ENTJ", "ENTP",
  "ESFJ", "ESFP", "ESTJ", "ESTP"
];

const grid = document.getElementById("galleryGrid");
const modal = document.getElementById("charModal");
const modalBody = document.getElementById("charModalBody");

function renderGrid() {
  if (typeof characters !== "object") return;
  const frag = document.createDocumentFragment();

  MBTI_ORDER.forEach((mbti, idx) => {
    const char = characters[mbti];
    if (!char) return;

    const card = document.createElement("button");
    card.type = "button";
    card.className = "char-card";
    card.style.animationDelay = `${idx * 35}ms`;
    card.setAttribute("aria-label", `ดูรายละเอียด ${char.name}`);

    card.innerHTML = `
      <div class="char-card-img-wrap">
        <img class="char-card-img" src="${char.image}" alt="${char.name}" loading="lazy"/>
      </div>
      <div class="char-card-name">${char.name}</div>
      <div class="char-card-tagline">${char.tagline || ""}</div>
    `;

    card.addEventListener("click", () => openModal(mbti));
    frag.appendChild(card);
  });

  grid.appendChild(frag);
}

function openModal(mbti) {
  const char = characters[mbti];
  if (!char) return;

  const traitsHtml = (char.traits || [])
    .map(t => `<span class="modal-trait">${t}</span>`)
    .join("");

  const compatHtml = (char.compatible || [])
    .map(m => {
      const c = characters[m];
      return c ? `<span class="modal-compat-pill">${c.name}</span>` : "";
    })
    .join("");

  modalBody.innerHTML = `
    <img class="modal-img" src="${char.image}" alt="${char.name}"/>
    <h2 class="modal-name">${char.name}</h2>
    <p class="modal-tagline">${char.tagline || ""}</p>

    ${char.petIs ? `
    <div class="modal-section">
      <div class="modal-section-title">น้องเป็นยังไง</div>
      <p class="modal-text">${char.petIs}</p>
    </div>` : ""}

    ${char.youAre ? `
    <div class="modal-section">
      <div class="modal-section-title">คนที่น้องกำลังรอ</div>
      <p class="modal-text">${char.youAre}</p>
    </div>` : ""}

    ${traitsHtml ? `
    <div class="modal-section">
      <div class="modal-section-title">ลักษณะเด่น</div>
      <div class="modal-traits">${traitsHtml}</div>
    </div>` : ""}

    ${char.gentle ? `
    <div class="modal-section">
      <div class="modal-section-title">โน้ตเล็กๆ จากเจ้าของร้าน</div>
      <div class="modal-gentle">${char.gentle}</div>
    </div>` : ""}

    ${compatHtml ? `
    <div class="modal-section">
      <div class="modal-section-title">เข้ากันดีกับ</div>
      <div class="modal-compat">${compatHtml}</div>
    </div>` : ""}
  `;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  // scroll modal body กลับไปข้างบน
  const box = modal.querySelector(".char-modal-box");
  if (box) box.scrollTop = 0;
}

function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// ปุ่มปิด / คลิก backdrop
modal.addEventListener("click", (e) => {
  if (e.target.matches("[data-close]")) closeModal();
});

// ปิดด้วย Esc
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
});

renderGrid();
