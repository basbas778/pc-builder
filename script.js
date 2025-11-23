// ---------------------------
// ฐานข้อมูลชิ้นส่วน (ตัวอย่าง)
// ---------------------------
const partsDB = [
  { category: "CPU", name: "Intel i3 12100F", price: 3000 },
  { category: "CPU", name: "Intel i5 12400F", price: 4800 },
  { category: "CPU", name: "Ryzen 5 5600", price: 3500 },

  { category: "GPU", name: "GTX 1650", price: 5200 },
  { category: "GPU", name: "RTX 3050", price: 7800 },
  { category: "GPU", name: "RX 6600", price: 7500 },

  { category: "RAM", name: "16GB DDR4 3200", price: 1200 },
  { category: "RAM", name: "32GB DDR4 3200", price: 2200 },

  { category: "Storage", name: "SSD 500GB", price: 900 },
  { category: "Storage", name: "SSD 1TB", price: 1500 },

  { category: "PSU", name: "550W Bronze", price: 900 },
  { category: "PSU", name: "650W Bronze", price: 1200 },

  { category: "Mainboard", name: "B450", price: 1800 },
  { category: "Mainboard", name: "B660", price: 2600 },

  { category: "Case", name: "Case พื้นฐาน", price: 700 },
  { category: "Case", name: "Case กระจก", price: 1200 }
];


// ---------------------------
// ลำดับความสำคัญตอนเลือกชิ้นส่วน
// ---------------------------
const priority = ["CPU", "GPU", "RAM", "Storage", "Mainboard", "PSU", "Case"];


// ---------------------------
// แบ่งงบตามสัดส่วน
// ---------------------------
function allocateBudget(budget) {
  const ratios = {
    CPU: 0.28,
    GPU: 0.32,
    RAM: 0.12,
    Storage: 0.08,
    PSU: 0.06,
    Mainboard: 0.08,
    Case: 0.06,
  };

  const alloc = {};
  for (const k of Object.keys(ratios)) {
    alloc[k] = Math.round(budget * ratios[k]);
  }

  // รวม
  let total = Object.values(alloc).reduce((a, b) => a + b, 0);
  let diff = budget - total;

  // แจกเศษ
  const giveOrder = ["GPU", "CPU", "Mainboard", "RAM", "Storage", "PSU", "Case"];
  let i = 0;

  while (diff > 0) {
    const key = giveOrder[i % giveOrder.length];
    alloc[key] += 1;
    diff--;
    i++;
  }

  return alloc;
}


// ---------------------------
// เลือกอุปกรณ์ตามงบย่อย
// ---------------------------
function pickPart(category, subBudget) {
  const candidates = partsDB
    .filter((p) => p.category === category)
    .sort((a, b) => a.price - b.price);

  let chosen = null;

  for (let i = candidates.length - 1; i >= 0; i--) {
    if (candidates[i].price <= subBudget) {
      chosen = candidates[i];
      break;
    }
  }

  if (!chosen) chosen = candidates[0] || { name: "ไม่มีข้อมูล", price: 0 };

  return chosen;
}


// ---------------------------
// สร้างสเปค
// ---------------------------
function buildConfig(budget) {
  const alloc = allocateBudget(budget);
  const result = [];
  let used = 0;

  for (const cat of priority) {
    const part = pickPart(cat, alloc[cat]);
    result.push({ category: cat, item: part });
    used += part.price;
  }

  return { parts: result, used, budget };
}


// ---------------------------
// UI
// ---------------------------
const buildBtn = document.getElementById("buildBtn");
const budgetInput = document.getElementById("budgetInput");
const resultArea = document.getElementById("resultArea");


function renderResult(obj) {
  resultArea.innerHTML = "";

  const summary = document.createElement("div");
  summary.className = "part";
  summary.innerHTML = `<h3>สรุปงบ: ใช้จริง ${obj.used} / งบที่ให้ ${obj.budget} บาท</h3>`;
  resultArea.appendChild(summary);

  obj.parts.forEach((p) => {
    const el = document.createElement("div");
    el.className = "part";
    el.innerHTML = `<h3>${p.category}</h3><div>${p.item.name} — ${p.item.price} บาท</div>`;
    resultArea.appendChild(el);
  });

  const note = document.createElement("div");
  note.className = "part";
  note.innerHTML =
    "<strong>หมายเหตุ:</strong> ฐานข้อมูลตัวอย่างน้อย เพิ่มรุ่น/ราคาได้ใน script.js";
  resultArea.appendChild(note);
}


buildBtn.addEventListener("click", () => {
  const b = parseInt(budgetInput.value, 10);
  if (!b || b < 1000) {
    resultArea.innerHTML =
      '<p class="hint">กรอกงบที่เป็นตัวเลขและมากกว่า 1000 บาท</p>';
    return;
  }
  const out = buildConfig(b);
  renderResult(out);
});

budgetInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") buildBtn.click();
});
