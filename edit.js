const ad=$('#ad');let tok=sessionStorage.getItem('phtok'),D=null,tab='Projects',busy=false;
const SCH={
Projects:{label:'โครงการ',f:[['title','ชื่อโครงการ','text',1],['summary','คำอธิบายสั้น','text'],['category','หมวดหมู่','text'],['status','สถานะ','status'],['progress','ความคืบหน้า (0–100%)','num'],['startDate','วันเริ่มต้น','date'],['dueDate','กำหนดการ','date'],['cover','รูปปก','img'],['description','รายละเอียดและวัตถุประสงค์','area'],['gallery','ภาพประกอบ (บรรทัดละ 1 URL)','imgs']]},
Businesses:{label:'ธุรกิจ',f:[['name','ชื่อธุรกิจ','text',1],['type','ประเภทธุรกิจ','text'],['status','สถานะการดำเนินงาน','bst'],['summary','คำอธิบายสั้น','text'],['description','รายละเอียด','area'],['location','ที่ตั้ง','text'],['contact','ช่องทางติดต่อ','text'],['logo','โลโก้','img'],['cover','ภาพหน้าปก','img']]},
Products:{label:'สินค้าและบริการ',f:[['businessId','ธุรกิจ','biz',1],['name','ชื่อรายการ','text',1],['kind','ประเภท','kind'],['price','ราคา/รายละเอียดราคา','text'],['description','รายละเอียด','area'],['image','รูปภาพ','img']]},
Timeline:{label:'เหตุการณ์',f:[['date','วันที่','date',1],['title','หัวข้อ','text',1],['detail','รายละเอียด','area'],['image','รูปประกอบ','img']]}};
const SET=[['tagline','ข้อความหลักหน้าแรก'],['intro','แนะนำบริษัท'],['company_note','หมายเหตุสถานะบริษัท'],['phone','โทรศัพท์'],['email','อีเมล'],['hq_name','ชื่อสำนักงานใหญ่'],['hq_address','ที่อยู่สำนักงานใหญ่'],['hq_text','คำอธิบายสำนักงาน'],['hq_image','รูปสำนักงาน (URL)'],['about_history','ประวัติความเป็นมา'],['about_vision','วิสัยทัศน์'],['about_departments','ส่วนงาน (บรรทัดละ 1 รายการ)'],['about_activities','กิจกรรมของบริษัท']];
const BST=['เปิดให้บริการ','ปิดชั่วคราว','เร็วๆ นี้'],KIND=['สินค้า','บริการ'];
function toast(m,err){const t=$('#toast');t.textContent=m;t.className=err?'err':'';t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,3500)}
async function call(b){if(!API)throw new Error('ยังไม่ได้ตั้งค่า PHANRAT_API ใน config.js');
 const j=await(await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...b,token:tok})})).json();
 if(!j.ok){if(/หมดเวลา/.test(j.error)){sessionStorage.removeItem('phtok');tok=null}throw new Error(j.error)}return j}
function login(){ad.innerHTML=`<form class="card login" id="lf"><div class="pad fl"><h2>เข้าสู่ระบบแอดมิน</h2><label>รหัสผ่าน<input type="password" id="pw" autocomplete="current-password" required></label><button class="btn">เข้าสู่ระบบ</button></div></form>`;$('#lo').hidden=true;
 $('#lf').onsubmit=async e=>{e.preventDefault();const b=$('#lf button');b.disabled=true;
  try{const j=await call({action:'login',password:$('#pw').value});tok=j.token;sessionStorage.setItem('phtok',tok);start()}catch(x){toast(x.message,1);b.disabled=false}}}
$('#lo').onclick=()=>{sessionStorage.removeItem('phtok');tok=null;login()};
async function start(){try{D=(await call({action:'all'})).data;$('#lo').hidden=false;list()}catch(x){toast(x.message,1);login()}}
function list(){const t=SCH[tab];
 ad.innerHTML=`<h1>จัดการข้อมูล</h1><div class="tabs">${[...Object.keys(SCH).filter(k=>k!=='Timeline'),'Settings'].map(k=>`<button class="chip${k===tab?' on':''}" data-t="${k}">${k==='Settings'?'ตั้งค่าเว็บไซต์':SCH[k].label}</button>`).join('')}</div><div id="body"></div>`;
 ad.querySelector('.tabs').onclick=e=>{const b=e.target.closest('[data-t]');if(b){tab=b.dataset.t;list()}};
 if(tab==='Settings')return settings();
 const rows=tab==='Projects'?D.projects:tab==='Businesses'?D.businesses:D.products,nm=r=>r.title||r.name;
 $('#body').innerHTML=`<div class="ac" style="margin:0 0 12px"><button class="btn" id="add">เพิ่ม${t.label}</button></div>${rows.length?`<table class="tbl"><tr><th>ชื่อ</th><th class="hm">สถานะ</th><th class="hm">เผยแพร่</th><th></th></tr>${rows.map(r=>`<tr><td>${esc(nm(r))}</td><td class="hm">${esc(r.status||r.kind||'')}${r.progress!==undefined?' · '+esc(r.progress)+'%':''}</td><td class="hm">${r.published==='TRUE'?'เผยแพร่แล้ว':'ฉบับร่าง'}</td><td class="act"><button class="btn o sm" data-e="${esc(r.id)}">แก้ไข</button><button class="btn o sm" data-d="${esc(r.id)}">ลบ</button></td></tr>`).join('')}</table>`:'<div class="empty muted">ยังไม่มีรายการ กดปุ่มเพิ่มเพื่อเริ่มต้น</div>'}`;
 $('#add').onclick=()=>form(tab,{});
 $('#body').onclick=async e=>{const id=e.target.dataset.e,del=e.target.dataset.d;
  if(id)form(tab,rows.find(r=>r.id===id));
  if(del&&confirm('ลบรายการนี้? '+(tab==='Projects'?'เหตุการณ์ในไทม์ไลน์ของโครงการจะถูกลบด้วย':tab==='Businesses'?'สินค้าของธุรกิจนี้จะถูกลบด้วย':'')))remove(tab,del)}}
async function remove(sh,id){if(busy)return;busy=true;try{await call({action:'delete',sheet:sh,id});toast('ลบแล้ว');await reload()}catch(x){toast(x.message,1)}busy=false}
async function reload(){D=(await call({action:'all'})).data;if(window.dlg&&dlg.dataset.sheet==='Projects'&&dlg.dataset.id)form('Projects',D.projects.find(p=>p.id===dlg.dataset.id));else list()}
function settings(){const S=Object.fromEntries(D.settings.map(r=>[r.key,r.value]));
 $('#body').innerHTML=`<form class="fl" id="sf">${SET.map(([k,l])=>`<label>${l}<textarea name="${k}" rows="${/about|intro|hq_text/.test(k)?4:1}">${esc(S[k]||'')}</textarea></label>`).join('')}<div class="ac"><button class="btn">บันทึกการตั้งค่า</button></div></form><p class="muted">อย่าใส่รหัสผ่านหรือข้อมูลลับในส่วนนี้ เพราะข้อมูลทั้งหมดแสดงต่อสาธารณะ</p>`;
 $('#sf').onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;const b=$('#sf button');b.disabled=true;
  try{for(const[k]of SET){const v=e.target[k].value;if(v!==(S[k]||''))await call({action:'save',sheet:'Settings',row:{key:k,value:v}})}toast('บันทึกการตั้งค่าแล้ว');await reload()}catch(x){toast(x.message,1)}busy=false;b.disabled=false}}
function input(f,v,ctx){const[k,l,t]=f,n=`name="${k}"`;let el;
 if(t==='area'||t==='imgs')el=`<textarea ${n} rows="${t==='imgs'?3:5}">${esc(v)}</textarea>`;
 else if(t==='status'||t==='bst'||t==='kind'||t==='biz'){const o=t==='status'?STATUS:t==='bst'?BST:t==='kind'?KIND:D.businesses.map(b=>[b.id,b.name]);
  el=`<select ${n}>${o.map(x=>{const[a,b]=Array.isArray(x)?x:[x,x];return`<option value="${esc(a)}"${a===v?' selected':''}>${esc(b)}</option>`}).join('')}</select>`}
 else el=`<input ${n} type="${t==='num'?'number':t==='date'?'date':'text'}" ${t==='num'?'min="0" max="100" step="1"':''} value="${esc(v)}">`;
 const up=t==='img'||t==='imgs'?`<input type="file" accept="image/*" data-up="${k}" data-m="${t}">`:'';
 return`<label>${l}${f[3]?' *':''}${el}${up}</label>`}
function form(sh,r){const isNew=!r.id,sc=SCH[sh];window.dlg?.remove();
 if(sh==='Products'&&isNew&&D.businesses.length===0){toast('กรุณาเพิ่มธุรกิจก่อน',1);return}
 if(sh==='Timeline'&&r.projectId==null){}
 const defaults=isNew?{status:sh==='Projects'?'วางแผน':sh==='Businesses'?'เปิดให้บริการ':'',progress:'0',kind:'สินค้า',businessId:D.businesses[0]?.id,...r}:r;
 const d=window.dlg=document.createElement('dialog');d.className='wide';d.dataset.sheet=sh;d.dataset.id=r.id||'';
 const tl=sh==='Projects'&&!isNew?sortAsc(D.timeline.filter(t=>t.projectId===r.id)):[];
 d.innerHTML=`<form class="dp fl" id="df"><h2>${isNew?'เพิ่ม':'แก้ไข'}${sc.label}</h2>${sc.f.map(f=>input(f,defaults[f[0]]??'')).join('')}
 ${sh==='Projects'?`<div><h3>ลำดับเหตุการณ์ (Timeline)</h3>${isNew?'<p class="muted">บันทึกโครงการก่อน แล้วจึงเพิ่มเหตุการณ์ได้</p>':`${tl.map(t=>`<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)"><span>${fmt(t.date)} · ${esc(t.title)}</span><span><button type="button" class="btn o sm" data-te="${esc(t.id)}">แก้ไข</button> <button type="button" class="btn o sm" data-td="${esc(t.id)}">ลบ</button></span></div>`).join('')||'<p class="muted">ยังไม่มีเหตุการณ์</p>'}<button type="button" class="btn o sm" id="tadd" style="margin-top:10px">เพิ่มเหตุการณ์</button>`}</div>`:''}
 <div class="ac"><button type="button" class="btn o" data-x>ปิด</button>${sh==='Projects'?'<button type="button" class="btn o" id="pv">ดูตัวอย่าง</button>':''}
 ${'published'in(D[sh.toLowerCase()]?.[0]||{published:1})&&sh!=='Timeline'?'<button type="button" class="btn o" data-pub="0">บันทึกฉบับร่าง</button><button type="button" class="btn" data-pub="1">เผยแพร่</button>':'<button type="button" class="btn" data-pub="1">บันทึก</button>'}</div></form>`;
 document.body.appendChild(d);d.showModal();
 const f=$('#df',d),get=()=>{const o={...r};for(const x of sc.f)o[x[0]]=f.elements[x[0]].value.trim();if(sh==='Timeline')o.projectId=r.projectId;return o};
 const val=o=>{for(const x of sc.f)if(x[3]&&!o[x[0]])return`กรุณากรอก${x[1]}`;
  if(sh==='Projects'){const p=Number(o.progress);if(o.progress===''||!Number.isInteger(p)||p<0||p>100)return'ความคืบหน้าต้องเป็นจำนวนเต็ม 0–100';
   if((o.status==='เสร็จสิ้น'&&p!==100)||(o.status==='วางแผน'&&p!==0)||(o.status==='กำลังดำเนินการ'&&(p<1||p>99)))return'สถานะไม่สอดคล้องกับเปอร์เซ็นต์ (วางแผน=0, กำลังดำเนินการ=1–99, เสร็จสิ้น=100)';
   if(o.startDate&&o.dueDate&&o.dueDate<o.startDate)return'กำหนดการต้องไม่ก่อนวันเริ่มต้น'}return''};
 d.onclick=async e=>{const t=e.target;
  if(t===d||t.dataset.x!==undefined){d.close();d.remove();window.dlg=null;return}
  if(t.id==='pv'){const o=get(),e2=val(o);if(e2)return toast(e2,1);const v=document.createElement('dialog');v.className='wide';v.innerHTML=`<div class="dp">${projectView(o,D.timeline.filter(x=>x.projectId===o.id))}<div class="ac"><button class="btn" data-x2>ปิดตัวอย่าง</button></div></div>`;v.onclick=ev=>{if(ev.target.dataset.x2!==undefined||ev.target===v){v.close();v.remove()}};document.body.appendChild(v);v.showModal();return}
  if(t.id==='tadd'){form('Timeline',{projectId:r.id,date:new Date().toISOString().slice(0,10)});return}
  if(t.dataset.te){form('Timeline',D.timeline.find(x=>x.id===t.dataset.te));return}
  if(t.dataset.td){if(confirm('ลบเหตุการณ์นี้?'))await remove('Timeline',t.dataset.td).then(()=>{});return}
  if(t.dataset.pub!==undefined){if(busy)return;const o=get(),er=val(o);if(er)return toast(er,1);o.published=t.dataset.pub==='1';
   busy=true;d.querySelectorAll('button').forEach(b=>b.disabled=true);
   try{const j=await call({action:'save',sheet:sh,row:o});toast(sh==='Timeline'||t.dataset.pub==='1'?'บันทึกแล้ว':'บันทึกฉบับร่างแล้ว');
    D=(await call({action:'all'})).data;busy=false;d.close();d.remove();window.dlg=null;
    if(sh==='Timeline')form('Projects',D.projects.find(p=>p.id===o.projectId));else list();return}
   catch(x){toast(x.message,1);d.querySelectorAll('button').forEach(b=>b.disabled=false)}busy=false}};
 d.onchange=async e=>{const i=e.target;if(!i.dataset.up||!i.files[0])return;const file=i.files[0];
  if(file.size>5e6)return toast('ไฟล์ใหญ่เกิน 5 MB',1);toast('กำลังอัปโหลด…');
  try{const data=await new Promise((ok,no)=>{const rd=new FileReader();rd.onload=()=>ok(rd.result.split(',')[1]);rd.onerror=no;rd.readAsDataURL(file)});
   const j=await call({action:'upload',name:file.name,mime:file.type,data}),el=f.elements[i.dataset.up];el.value=i.dataset.m==='imgs'?(el.value?el.value+'\n':'')+j.url:j.url;toast('อัปโหลดแล้ว')}catch(x){toast(x.message,1)}i.value=''}}
tok?start():login();
