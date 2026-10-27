/* พันรัฐ — Google Apps Script API (Web App). ดูขั้นตอนตั้งค่าใน README.md */
const H={Projects:['id','title','summary','description','category','status','progress','startDate','dueDate','updatedAt','cover','gallery','published'],
Timeline:['id','projectId','date','title','detail','image'],
Businesses:['id','name','type','summary','description','location','contact','logo','cover','status','published'],
Products:['id','businessId','name','kind','price','description','image','published'],
Settings:['key','value']};
const PFX={Projects:'P',Timeline:'T',Businesses:'B',Products:'S'};
const ST=['วางแผน','กำลังดำเนินการ','พักไว้','เสร็จสิ้น'];
function setup(){const ss=SpreadsheetApp.getActive();
 for(const n in H){const s=ss.getSheetByName(n)||ss.insertSheet(n);
  s.getRange(1,1,s.getMaxRows(),H[n].length).setNumberFormat('@');
  s.getRange(1,1,1,H[n].length).setValues([H[n]]).setFontWeight('bold');s.setFrozenRows(1);}
 const P=PropertiesService.getScriptProperties();
 if(!P.getProperty('ADMIN_PASSWORD'))P.setProperty('ADMIN_PASSWORD','เปลี่ยนรหัสนี้ก่อนใช้งาน');}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function read_(n,admin){const v=SpreadsheetApp.getActive().getSheetByName(n).getDataRange().getValues(),h=v.shift();
 return v.filter(r=>r[0]!=='').map(r=>{const o={};h.forEach((k,i)=>o[k]=r[i] instanceof Date?Utilities.formatDate(r[i],'Asia/Bangkok','yyyy-MM-dd'):String(r[i]));return o})
  .filter(o=>admin||o.published===undefined||o.published==='TRUE')}
function all_(a){const P=read_('Projects',a),B=read_('Businesses',a),pi=P.map(x=>x.id),bi=B.map(x=>x.id);
 return{projects:P,businesses:B,timeline:read_('Timeline',a).filter(t=>pi.indexOf(t.projectId)>=0),
  products:read_('Products',a).filter(t=>bi.indexOf(t.businessId)>=0),settings:read_('Settings',a)}}
function doGet(){try{return json_({ok:true,data:all_(false)})}catch(x){return json_({ok:false,error:String(x.message||x)})}}
function doPost(e){try{
 const b=JSON.parse(e.postData.contents),P=PropertiesService.getScriptProperties(),C=CacheService.getScriptCache();
 if(b.action==='login'){
  if(b.password&&b.password===P.getProperty('ADMIN_PASSWORD')){const t=Utilities.getUuid();C.put('t_'+t,'1',21600);return json_({ok:true,token:t})}
  Utilities.sleep(1500);return json_({ok:false,error:'รหัสผ่านไม่ถูกต้อง'})}
 if(!b.token||!C.get('t_'+b.token))return json_({ok:false,error:'หมดเวลาเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่'});
 const L=LockService.getScriptLock();L.waitLock(20000);
 try{
  if(b.action==='all')return json_({ok:true,data:all_(true)});
  if(b.action==='save')return json_({ok:true,row:save_(b.sheet,b.row||{})});
  if(b.action==='delete'){del_(b.sheet,b.id);return json_({ok:true})}
  if(b.action==='upload')return json_({ok:true,url:upload_(b)});
  throw new Error('ไม่รู้จักคำสั่ง');
 }finally{L.releaseLock()}
}catch(x){return json_({ok:false,error:String(x.message||x)})}}
function find_(s,k,id){const v=s.getDataRange().getValues(),c=H[s.getName()].indexOf(k);
 for(let i=1;i<v.length;i++)if(String(v[i][c])===String(id))return i+1;return 0}
function save_(n,r){if(!H[n])throw new Error('ไม่รู้จักชีต');
 const k=n==='Settings'?'key':'id',s=SpreadsheetApp.getActive().getSheetByName(n),o={};
 H[n].forEach(c=>{const v=r[c];o[c]=v==null?'':String(v).slice(0,5000)});
 if('published' in o)o.published=(r.published===true||r.published==='TRUE'||r.published==='true')?'TRUE':'FALSE';
 if(n==='Settings'&&!o.key)throw new Error('ไม่มีชื่อการตั้งค่า');
 if(n==='Projects'){const p=Number(o.progress);
  if(!o.title)throw new Error('กรุณากรอกชื่อโครงการ');
  if(o.progress===''||!(p>=0&&p<=100))throw new Error('ความคืบหน้าต้องอยู่ระหว่าง 0–100');
  if(ST.indexOf(o.status)<0)throw new Error('สถานะไม่ถูกต้อง');
  if((o.status==='เสร็จสิ้น'&&p!==100)||(o.status==='วางแผน'&&p!==0)||(o.status==='กำลังดำเนินการ'&&(p<1||p>99)))throw new Error('สถานะไม่สอดคล้องกับเปอร์เซ็นต์ความคืบหน้า');
  o.progress=String(Math.round(p));o.updatedAt=Utilities.formatDate(new Date(),'Asia/Bangkok','yyyy-MM-dd')}
 if(n==='Timeline'){if(!o.title||!o.date||find_(SpreadsheetApp.getActive().getSheetByName('Projects'),'id',o.projectId)===0)throw new Error('ข้อมูลเหตุการณ์ไม่ครบ')}
 if(n==='Businesses'&&!o.name)throw new Error('กรุณากรอกชื่อธุรกิจ');
 if(n==='Products'&&(!o.name||find_(SpreadsheetApp.getActive().getSheetByName('Businesses'),'id',o.businessId)===0))throw new Error('ข้อมูลสินค้าไม่ครบ');
 if(!o[k])o[k]=PFX[n]+Date.now().toString(36);
 const row=find_(s,k,o[k])||s.getLastRow()+1;
 s.getRange(row,1,1,H[n].length).setValues([H[n].map(c=>o[c])]);
 if(n==='Timeline'){const pr=find_(SpreadsheetApp.getActive().getSheetByName('Projects'),'id',o.projectId),ps=SpreadsheetApp.getActive().getSheetByName('Projects');
  ps.getRange(pr,H.Projects.indexOf('updatedAt')+1).setValue(Utilities.formatDate(new Date(),'Asia/Bangkok','yyyy-MM-dd'))}
 return o}
function del_(n,id){if(!H[n])throw new Error('ไม่รู้จักชีต');const k=n==='Settings'?'key':'id',ss=SpreadsheetApp.getActive(),s=ss.getSheetByName(n),r=find_(s,k,id);
 if(!r)throw new Error('ไม่พบรายการ');
 const casc={Projects:['Timeline','projectId'],Businesses:['Products','businessId']}[n];
 if(casc){const c=ss.getSheetByName(casc[0]),v=c.getDataRange().getValues(),ci=H[casc[0]].indexOf(casc[1]);
  for(let i=v.length-1;i>=1;i--)if(String(v[i][ci])===String(id))c.deleteRow(i+1)}
 s.deleteRow(r)}
function upload_(b){if(!/^image\/(png|jpe?g|webp|gif)$/.test(b.mime||''))throw new Error('รองรับเฉพาะไฟล์รูปภาพ');
 if(String(b.data).length>7e6)throw new Error('ไฟล์ใหญ่เกิน 5 MB');
 const f=DriveApp.getFoldersByName('Phanrat Uploads'),d=f.hasNext()?f.next():DriveApp.createFolder('Phanrat Uploads');
 const file=d.createFile(Utilities.newBlob(Utilities.base64Decode(b.data),b.mime,Date.now()+'-'+String(b.name||'img').replace(/[^\w.-]/g,'')));
 file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
 return 'https://lh3.googleusercontent.com/d/'+file.getId()}
