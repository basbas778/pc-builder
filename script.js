// เบื้องต้น: ฐานข้อมูลชิ้นส่วนแบบง่าย ๆ (ตัวอย่าง)
const ratios = {CPU:0.28, GPU:0.32, RAM:0.12, Storage:0.08, PSU:0.06, Mainboard:0.08, Case:0.06};
const alloc = {};
for(const k of Object.keys(ratios)){
alloc[k] = Math.round(budget * ratios[k]);
}
// ปรับให้ยอดรวมเท่ากับงบ (แก้เศษ)
let total = Object.values(alloc).reduce((a,b)=>a+b,0);
let diff = budget - total;
// แจกเพิ่มให้ GPU หรือ CPU ถ้ามีเศษ
const giveOrder = ['GPU','CPU','Mainboard','RAM','Storage','PSU','Case'];
let i = 0;
while(diff>0){ alloc[giveOrder[i%giveOrder.length]] += 1; diff--; i++; }
return alloc;
}


function pickPart(category, subBudget){
const candidates = partsDB.filter(p=>p.category===category).sort((a,b)=>a.price-b.price);
// เลือกชิ้นที่ราคาไม่เกิน subBudget แต่ใกล้เคียงที่สุด
let chosen = null;
for(let i=candidates.length-1;i>=0;i--){
if(candidates[i].price <= subBudget){ chosen = candidates[i]; break; }
}
// ถ้าไม่มีตัวไหนพอดี ให้เลือกถูกสุด (แล้วจะแจ้งว่าต้องเพิ่มงบ)
if(!chosen) chosen = candidates[0] || {name:'ไม่มีข้อมูล', price:0};
return chosen;
}


function buildConfig(budget){
const alloc = allocateBudget(budget);
const result = [];
let used = 0;
for(const cat of priority){
const part = pickPart(cat, alloc[cat]);
result.push({category:cat, item:part});
used += part.price;
}
return {parts:result, used, budget};
}


// --- UI ---
const buildBtn = document.getElementById('buildBtn');
const budgetInput = document.getElementById('budgetInput');
const resultArea = document.getElementById('resultArea');


function renderResult(obj){
resultArea.innerHTML = '';
const summary = document.createElement('div');
summary.className = 'part';
summary.innerHTML = `<h3>สรุปงบ: ใช้จริง ${obj.used} / งบที่ให้ ${obj.budget} บาท</h3>`;
resultArea.appendChild(summary);


obj.parts.forEach(p=>{
const el = document.createElement('div');
el.className = 'part';
el.innerHTML = `<h3>${p.category}</h3><div>${p.item.name} — ${p.item.price} บาท</div>`;
resultArea.appendChild(el);
});


const note = document.createElement('div');
note.className = 'part';
note.innerHTML = '<strong>หมายเหตุ:</strong> ฐานข้อมูลตัวอย่างน้อย สามารถแก้เพิ่มใน script.js ให้ตรงรุ่น/ราคา และปรับอัลกอริธึมให้ละเอียดขึ้น';
resultArea.appendChild(note);
}


buildBtn.addEventListener('click', ()=>{
const b = parseInt(budgetInput.value, 10);
if(!b || b < 1000){
resultArea.innerHTML = '<p class="hint">กรอกงบที่เป็นตัวเลขและมากกว่า 1000 บาท</p>';
return;
}
const out = buildConfig(b);
renderResult(out);
});


// Enter key
budgetInput.addEventListener('keypress', (e)=>{ if(e.key === 'Enter') buildBtn.click(); });
