let D,S={},isSample=false;const app=$('#app');
const cats=a=>[...new Set(a.map(x=>x.category||x.type).filter(Boolean))];
const pcard=p=>`<a class="card" href="#/project/${esc(p.id)}">${img(p.cover,p.title,'cover')}<div class="pad"><div class="row">${pill(p.status)}<span class="muted">${esc(p.category)}</span></div><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p>${bar(p.progress)}<div class="row"><b>${Number(p.progress)||0}%</b><span class="muted">เริ่ม ${fmt(p.startDate)} · อัปเดต ${fmt(p.updatedAt)}</span></div></div></a>`;
const bcard=b=>`<a class="card" href="#/business/${esc(b.id)}">${img(b.cover,b.name,'cover')}<div class="pad"><div class="row"><span class="pill">${esc(b.status)}</span><span class="muted">${esc(b.type)}</span></div><h3>${esc(b.name)}</h3><p>${esc(b.summary)}</p></div></a>`;
const prodCard=s=>{const b=D.businesses.find(x=>x.id===s.businessId)||{};return`<button class="card" data-p="${esc(s.id)}">${img(s.image,s.name,'cover')}<div class="pad"><div class="row"><span class="muted">${esc(s.kind)}</span><span class="muted">${esc(b.name)}</span></div><h3>${esc(s.name)}</h3><b>${esc(s.price)||'สอบถามราคา'}</b></div></button>`};
const sec=(t,href,body,empty)=>`<section class="sec wrap"><div class="sh"><h2>${t}</h2>${href?`<a href="${href}">ดูทั้งหมด</a>`:''}</div>${body||`<div class="empty muted">${empty}</div>`}</section>`;
const grid=(a,f)=>a.length?`<div class="grid">${a.map(f).join('')}</div>`:'';
function home(){const P=D.projects,on=P.filter(p=>p.status==='กำลังดำเนินการ'),dn=P.filter(p=>p.status==='เสร็จสิ้น');
 return`<section class="hero wrap"><h1>${esc(S.tagline||'พันรัฐ')}</h1><p class="lead">${esc(S.intro)}</p>
 <form class="search" id="hs"><input name="q" placeholder="ค้นหาโครงการ" aria-label="ค้นหาโครงการ"><button class="btn">ค้นหา</button></form>
 <div class="chips">${cats(P).map(c=>`<a class="chip" href="#/projects?cat=${encodeURIComponent(c)}">${esc(c)}</a>`).join('')}</div></section>`
 +sec('ธุรกิจและบริการหลัก','#/businesses',grid(D.businesses.slice(0,3),bcard),'ยังไม่มีข้อมูลธุรกิจ')
 +sec('โครงการที่กำลังดำเนินการ','#/projects?st='+encodeURIComponent('กำลังดำเนินการ'),grid(on.slice(0,3),pcard),'ยังไม่มีโครงการที่กำลังดำเนินการ')
 +sec('โครงการที่เสร็จสิ้นแล้ว','#/projects?st='+encodeURIComponent('เสร็จสิ้น'),grid(dn.slice(0,3),pcard),'ยังไม่มีโครงการที่เสร็จสิ้น')
 +sec('ร้านค้า สินค้า และบริการ','#/businesses',grid(D.products.slice(0,4),prodCard),'ยังไม่มีสินค้าและบริการ')
 +(S.hq_name?`<section class="sec wrap"><div class="card hq">${img(S.hq_image,S.hq_name,'cover')}<div class="pad"><h2>${esc(S.hq_name)}</h2><p>${esc(S.hq_text)}</p><p class="muted">${esc(S.hq_address)}</p><a class="btn o" href="#/about">เกี่ยวกับพันรัฐ</a></div></div></section>`:'')}
let F={q:'',cat:'',st:'',pr:''};
function projects(q){F={q:q.get('q')||'',cat:q.get('cat')||'',st:q.get('st')||'',pr:''};
 const opt=(a,v)=>a.map(x=>`<option${x===v?' selected':''}>${esc(x)}</option>`).join('');
 app.innerHTML=`<div class="wrap sec"><h1>โครงการและงาน</h1><div class="filters"><input id="fq" placeholder="ค้นหาชื่อหรือคำอธิบาย" value="${esc(F.q)}" aria-label="ค้นหา">
 <select id="fc"><option value="">ทุกหมวดหมู่</option>${opt(cats(D.projects),F.cat)}</select><select id="fs"><option value="">ทุกสถานะ</option>${opt(STATUS,F.st)}</select>
 <select id="fp"><option value="">ทุกความคืบหน้า</option><option value="a">0–49%</option><option value="b">50–99%</option><option value="c">100%</option></select></div><div id="pg"></div></div>`;
 const draw=()=>{F.q=$('#fq').value.trim().toLowerCase();F.cat=$('#fc').value;F.st=$('#fs').value;F.pr=$('#fp').value;
  const r=D.projects.filter(p=>(!F.q||(p.title+p.summary+p.category).toLowerCase().includes(F.q))&&(!F.cat||p.category===F.cat)&&(!F.st||p.status===F.st)&&(!F.pr||(F.pr==='a'?p.progress<50:F.pr==='b'?p.progress>=50&&p.progress<100:Number(p.progress)===100)));
  $('#pg').innerHTML=r.length?`<p class="muted">พบ ${r.length} โครงการ</p>${grid(r,pcard)}`:'<div class="empty muted">ไม่พบโครงการที่ตรงกับเงื่อนไข ลองล้างตัวกรอง</div>'};
 ['#fq','#fc','#fs','#fp'].forEach(s=>$(s).addEventListener('input',draw));draw()}
function project(id){const p=D.projects.find(x=>x.id===id);app.innerHTML=p?projectView(p,D.timeline.filter(t=>t.projectId===id)):nf()}
const nf=()=>'<div class="wrap sec"><div class="empty">ไม่พบหน้าที่ต้องการ <a href="#/">กลับหน้าแรก</a></div></div>';
function businesses(){const T=cats(D.businesses);
 app.innerHTML=`<div class="wrap sec"><h1>ธุรกิจและร้านค้า</h1><div class="chips" id="bc"><span class="chip on" data-t="">ทั้งหมด</span>${T.map(t=>`<span class="chip" data-t="${esc(t)}">${esc(t)}</span>`).join('')}</div><div id="bg" style="margin-top:20px"></div></div>`;
 const draw=t=>{const r=D.businesses.filter(b=>!t||b.type===t);$('#bg').innerHTML=r.length?grid(r,bcard):'<div class="empty muted">ยังไม่มีธุรกิจในหมวดนี้</div>'};
 $('#bc').onclick=e=>{const c=e.target.closest('.chip');if(!c)return;document.querySelectorAll('#bc .chip').forEach(x=>x.classList.toggle('on',x===c));draw(c.dataset.t)};draw('')}
function business(id){const b=D.businesses.find(x=>x.id===id);if(!b){app.innerHTML=nf();return}
 const pr=D.products.filter(x=>x.businessId===id);
 app.innerHTML=`<div class="wrap pv"><a class="back" href="#/businesses">← ธุรกิจและร้านค้า</a>${img(b.cover,b.name,'cover big')}
 <div class="bh">${img(b.logo,b.name,'logo')}<div><span class="pill">${esc(b.status)}</span> <span class="muted">${esc(b.type)}</span><h1 style="margin:0">${esc(b.name)}</h1></div></div>
 <p class="lead">${esc(b.summary)}</p><p class="pre">${esc(b.description)}</p>
 ${b.location||b.contact?`<dl style="max-width:420px">${b.location?`<dt>ที่ตั้ง</dt><dd>${esc(b.location)}</dd>`:''}${b.contact?`<dt>ติดต่อ</dt><dd>${esc(b.contact)}</dd>`:''}</dl>`:''}
 <h2>สินค้าและบริการ</h2>${grid(pr,prodCard)||'<div class="empty muted">ยังไม่มีรายการสินค้าและบริการ</div>'}</div>`}
function about(){const L=t=>String(t||'').split('\n').filter(Boolean),d=L(S.about_departments);
 app.innerHTML=`<div class="wrap pv"><h1>เกี่ยวกับพันรัฐ</h1><p class="lead">${esc(S.company_note)}</p>
 ${img(S.hq_image,S.hq_name||'สำนักงาน','cover big')}
 <h2>ประวัติความเป็นมา</h2><p class="pre">${esc(S.about_history)}</p><h2>วิสัยทัศน์และการดำเนินธุรกิจ</h2><p class="pre">${esc(S.about_vision)}</p>
 <h2>สำนักงานใหญ่</h2><p><b>${esc(S.hq_name)}</b><br>${esc(S.hq_address)}</p><p class="pre">${esc(S.hq_text)}</p>
 ${d.length?`<h2>ส่วนงานของบริษัท</h2><div class="chips">${d.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div>`:''}
 <h2>ธุรกิจในเครือ</h2>${grid(D.businesses,bcard)||'<p class="muted">ยังไม่มีข้อมูล</p>'}
 <h2>กิจกรรมของบริษัท</h2><p class="pre">${esc(S.about_activities)}</p></div>`}
function route(){const[h,qs]=(location.hash||'#/').slice(2).split('?'),[pg,id]=h.split('/'),q=new URLSearchParams(qs||'');
 const m={'':home,projects:()=>projects(q),project:()=>project(id),businesses,business:()=>business(id),about}[pg];
 if(m){if(pg==='')app.innerHTML=home();else m()}else app.innerHTML=nf();
 if(pg==='')bindHome();
 document.querySelectorAll('#nv a').forEach(a=>a.classList.toggle('on',pg.startsWith(a.dataset.k)));
 $('#nv').classList.remove('open');scrollTo(0,0)}
function bindHome(){const f=$('#hs');if(f)f.onsubmit=e=>{e.preventDefault();location.hash='#/projects?q='+encodeURIComponent(f.q.value)}}
app.addEventListener('click',e=>{const c=e.target.closest('[data-p]');if(!c)return;const s=D.products.find(x=>x.id===c.dataset.p),b=D.businesses.find(x=>x.id===s.businessId)||{};
 const d=document.createElement('dialog');d.innerHTML=`${img(s.image,s.name,'cover')}<div class="dp"><span class="muted">${esc(s.kind)} · ${esc(b.name)}</span><h2>${esc(s.name)}</h2><p><b>${esc(s.price)||'สอบถามราคา'}</b></p><p class="pre">${esc(s.description)}</p><div class="ac"><a class="btn o" href="#/business/${esc(b.id)}">ดูธุรกิจ</a><button class="btn" data-x>ปิด</button></div></div>`;
 d.onclick=ev=>{if(ev.target===d||ev.target.dataset.x!==undefined||ev.target.closest('a')){d.close();d.remove()}};document.body.appendChild(d);d.showModal()});
$('#mb').onclick=()=>$('#nv').classList.toggle('open');
async function init(){try{if(!API)throw 0;const j=await(await fetch(API+'?t='+Date.now())).json();if(!j.ok)throw 0;D=j.data}catch(e){D=SAMPLE;isSample=true}
 $('#sample').hidden=!isSample;S=Object.fromEntries(D.settings.map(r=>[r.key,r.value]));
 $('#ft').innerHTML=`<div><h3>พันรัฐ</h3><p class="muted">${esc(S.company_note||S.tagline||'')}</p><p>${esc(S.phone)} ${esc(S.email)}</p></div><div><h3>เมนู</h3><a href="#/projects">โครงการ</a><a href="#/businesses">ธุรกิจและร้านค้า</a><a href="#/about">เกี่ยวกับเรา</a></div><div><h3>สำนักงาน</h3><p>${esc(S.hq_name)}<br>${esc(S.hq_address)}</p></div>`;
 addEventListener('hashchange',route);route()}
init();
