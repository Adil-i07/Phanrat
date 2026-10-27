const API=window.PHANRAT_API||'';
const STATUS=['วางแผน','กำลังดำเนินการ','พักไว้','เสร็จสิ้น'];
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=d=>{if(!d)return'-';const t=new Date(d);return isNaN(t)?esc(d):t.toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'})};
const img=(src,alt,cls='')=>src?`<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="this.outerHTML='<div class=&quot;ph ${cls}&quot;>พันรัฐ</div>'">`:`<div class="ph ${cls}">พันรัฐ</div>`;
const pill=s=>`<span class="pill s${STATUS.indexOf(s)}">${esc(s)}</span>`;
const bar=n=>{n=Math.max(0,Math.min(100,Number(n)||0));return`<div class="bar" role="progressbar" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="100"><i style="width:${n}%"></i></div>`};
const sortAsc=a=>[...a].sort((x,y)=>String(x.date).localeCompare(String(y.date)));
function projectView(p,tl){const t=sortAsc(tl),n=Number(p.progress)||0,g=String(p.gallery||'').split(/[\n|]/).map(x=>x.trim()).filter(Boolean);
 return`<div class="wrap pv"><a class="back" href="#/projects">← โครงการทั้งหมด</a>
 <div>${pill(p.status)} <span class="muted">${esc(p.category)}</span></div><h1>${esc(p.title)}</h1><p class="lead">${esc(p.summary)}</p>
 ${img(p.cover,p.title,'cover big')}
 <div class="pvg"><div><h2>รายละเอียดและวัตถุประสงค์</h2><p class="pre">${esc(p.description)}</p>
 ${g.length?`<h2>ภาพประกอบและผลงาน</h2><div class="gal">${g.map(u=>img(u,p.title,'cover gi')).join('')}</div>`:''}
 <h2>ลำดับเหตุการณ์</h2>${t.length?`<ol class="tl">${t.map((e,i)=>`<li${i==t.length-1?' class="now"':''}><time>${fmt(e.date)}</time><h3>${esc(e.title)}</h3><p class="pre">${esc(e.detail)}</p>${e.image?img(e.image,e.title,'cover ti'):''}</li>`).join('')}</ol>`:'<p class="muted">ยังไม่มีบันทึกความคืบหน้า</p>'}</div>
 <aside class="card side"><div class="pad"><div class="big-n">${n}%</div>${bar(n)}<dl><dt>สถานะ</dt><dd>${esc(p.status)}</dd><dt>วันเริ่มต้น</dt><dd>${fmt(p.startDate)}</dd><dt>กำหนดการ</dt><dd>${fmt(p.dueDate)}</dd><dt>อัปเดตล่าสุด</dt><dd>${fmt(p.updatedAt)}</dd></dl></div></aside></div></div>`}
// ไอคอนเว็บ: วาดคำว่า "พันรัฐ" ด้วยฟอนต์ SaoChingcha หลังฟอนต์โหลดเสร็จ
(async()=>{try{await document.fonts.load("700 48px SaoChingcha");const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
 x.fillStyle='#fafafa';x.fillRect(0,0,128,128);x.strokeStyle='#000';x.lineWidth=6;x.strokeRect(3,3,122,122);
 x.fillStyle='#000';x.font="700 44px SaoChingcha";x.textAlign='center';x.textBaseline='middle';x.fillText('พันรัฐ',64,70);
 let l=document.querySelector('link[rel=icon]');if(!l){l=document.createElement('link');l.rel='icon';document.head.appendChild(l)}l.href=c.toDataURL('image/png')}catch(e){}})();
