const $ = selector => document.querySelector(selector);
const tabs = ['overview','articles','services','projects','processSteps','messages','analytics','utm','database','users','files'];
const labels = {overview:'Dashboard',articles:'Blog posts',services:'Services',projects:'Portfolio',processSteps:'Process',messages:'Inquiries',analytics:'Analytics',utm:'UTM campaigns',database:'Database & media',users:'Admin users',files:'Site copy'};
let authenticated = false;
let isOwner = false;
let csrf = '';
let data = null;
let contentRevision = 0;
let currentTab = 'overview';
let selected = -1;
let metrics = null;
const dashboardUrl = new URL('../../api/dashboard.php', import.meta.url);
const setupUrl = new URL('../../api/setup.php', import.meta.url);
const mediaUrl = new URL('../../api/media.php', import.meta.url);
const authUrl = new URL('../../api/auth.php', import.meta.url);
const contentUrl = new URL('../../api/content.php', import.meta.url);
const usersUrl = new URL('../../api/users.php', import.meta.url);
const storageUrl = new URL('../../api/storage.php', import.meta.url);
let inviteToken = location.hash.startsWith('#invite=') ? location.hash.slice(8) : '';

function notice(message, error=false) {
  const box = $('#notice');
  box.textContent = message;
  box.classList.toggle('error', error);
  box.hidden = false;
}
async function api(endpoint,options={}) {
  const headers={Accept:'application/json',...(options.body && !(options.body instanceof FormData) ? {'Content-Type':'application/json'} : {}),...(options.method && options.method !== 'GET' && csrf ? {'X-CSRF-Token':csrf} : {})};
  const response = await fetch(endpoint,{...options,credentials:'same-origin',headers});
  let result={};
  try { result=await response.json(); } catch {}
  if (!response.ok) {
    if (response.status===401 && authenticated) { authenticated=false; $('#workspace').hidden=true; $('#signin').hidden=false; }
    throw new Error(result.error || 'Request failed (' + response.status + ').');
  }
  return result;
}
async function loadContent() {
  const file = await api(contentUrl);
  contentRevision = file.revision;
  data = file.content;
}
async function openWorkspace() {
  authenticated=true;
  $('#signin').hidden=true;
  $('#bootstrap').hidden=true;
  $('#invite').hidden=true;
  $('#workspace').hidden=false;
  $('#connection').textContent='Connected to CloudEmpire';
  document.querySelectorAll('[data-owner-only]').forEach(element=>element.hidden=!isOwner);
  try {
    await loadContent();
    switchTab('overview');
  } catch (error) { notice(error.message,true); }
  loadMetrics();
  if(isOwner)loadSetupStatus();
}
async function initialize() {
  if(inviteToken){$('#signin').hidden=true;$('#bootstrap').hidden=true;$('#invite').hidden=false;return;}
  try {
    const state=await api(authUrl);
    if (state.loggedIn) { csrf=state.csrf;isOwner=state.isOwner; await openWorkspace(); }
    else { $('#signin').hidden=state.setupRequired; $('#bootstrap').hidden=!state.setupRequired; }
  } catch(error) { $('#signin').hidden=true; $('#bootstrap').hidden=true; $('#connection').textContent=error.message; }
}
function switchTab(tab) {
  if (!tabs.includes(tab) || !authenticated) return;
  if (!isOwner && ['database','users'].includes(tab)) return;
  if (!data && ['articles','services','projects','processSteps','files'].includes(tab)) { notice('Content is unavailable. Check the database connection.',true); return; }
  currentTab = tab;
  selected = -1;
  document.querySelectorAll('.sidebar nav button').forEach(button => button.classList.toggle('active',button.dataset.tab===tab));
  document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
  $('#page-title').textContent = labels[tab];
  const panelId = ['articles','services','projects','processSteps'].includes(tab) ? 'editor-panel' : tab;
  $('#' + panelId).classList.add('active');
  if (panelId === 'editor-panel') renderList();
  if (tab === 'messages' || tab === 'analytics') loadMetrics();
  if (tab === 'utm') loadMetrics();
  if (tab === 'database') {loadSetupStatus();loadStorage();}
  if (tab === 'users') loadUsers();
  if (tab === 'files') renderSiteCopy();
}
function renderList() {
  $('#list-title').textContent = labels[currentTab];
  const list = $('#item-list');
  list.replaceChildren();
  data[currentTab].forEach((item,index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = selected === index ? 'selected' : '';
    button.textContent = item.title || item.slug || ('Step ' + item.number);
    const small = document.createElement('small');
    small.textContent = item.category || item.slug || item.description?.slice(0,35) || '';
    button.append(small);
    button.addEventListener('click',() => {selected=index;renderList();renderForm();});
    list.append(button);
  });
  if (selected < 0) {
    $('#form-title').textContent = 'Select an item';
    $('#fields').replaceChildren();
    $('#content-form').hidden = true;
    $('#delete-item').hidden = true;
  }
}
const fields = {
  articles:[['slug','URL slug'],['title','Title'],['category','Category'],['description','SEO description','textarea'],['date','Publication date','date'],['readTime','Reading time'],['intro','Introduction','textarea'],['sections','Sections (JSON)','json'],['takeaways','Key takeaways (one per line)','lines'],['relatedService','Related service slug'],['image','Cover image path'],['imageAlt','Cover image alt text'],['upload','Upload cover image','file']],
  services:[['slug','URL slug'],['title','Title'],['category','Category'],['lead','Lead statement'],['description','Description','textarea'],['deliverables','Deliverables (one per line)','lines'],['outcome','Outcome','textarea'],['icon','Icon']],
  projects:[['slug','Slug'],['title','Title'],['category','Category'],['location','Location'],['description','Description','textarea'],['theme','Theme']],
  processSteps:[['number','Step number'],['title','Title'],['description','Description','textarea']]
};
function renderForm() {
  if (selected < 0) return;
  const item = data[currentTab][selected];
  $('#content-form').hidden = false;
  $('#form-title').textContent = item.title || 'New item';
  $('#delete-item').hidden = false;
  const container = $('#fields');
  container.replaceChildren();
  for (const [key,label,type] of fields[currentTab]) {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-field';
    const caption = document.createElement('label');
    caption.textContent = label;
    caption.htmlFor = 'field-' + key;
    let control = type === 'textarea' || type === 'json' || type === 'lines' ? document.createElement('textarea') : document.createElement('input');
    control.id = 'field-' + key;
    control.name = key;
    if (type === 'file') {
      control.type = 'file';
      control.accept = 'image/png,image/jpeg,image/webp';
    } else {
      if (type === 'date') control.type = 'date';
      control.value = type === 'json' ? JSON.stringify(item[key] || [],null,2) : type === 'lines' ? (item[key] || []).join('\n') : item[key] || '';
      if (type === 'json') control.rows = 12;
      else if (type === 'textarea') control.rows = 4;
    }
    wrapper.append(caption,control);
    if (key === 'sections') {
      const help = document.createElement('p');
      help.className = 'field-help';
      help.textContent = 'Each section needs a heading and a paragraphs array.';
      wrapper.append(help);
    }
    container.append(wrapper);
  }
}
function readForm() {
  const original = data[currentTab][selected];
  const item = {...original};
  for (const [key,,type] of fields[currentTab]) {
    if (type === 'file') continue;
    const value = $('#field-' + key).value.trim();
    if (type === 'json') item[key] = JSON.parse(value);
    else if (type === 'lines') item[key] = value.split('\n').map(v => v.trim()).filter(Boolean);
    else item[key] = value;
  }
  if (!item.title || ('slug' in item && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug))) throw new Error('Enter a title and a valid lowercase URL slug.');
  if (currentTab === 'articles' && (!Array.isArray(item.sections) || item.sections.some(section => !section.heading || !Array.isArray(section.paragraphs)))) throw new Error('Sections must be a JSON array with heading and paragraphs.');
  if ('slug' in item && data[currentTab].some((entry,index) => index !== selected && entry.slug === item.slug)) throw new Error('This URL slug already exists.');
  return item;
}
async function uploadImage(file) {
  if (!file) return '';
  if (file.size > 3*1024*1024 || !['image/png','image/jpeg','image/webp'].includes(file.type)) throw new Error('Choose a PNG, JPEG or WebP image under 3 MB.');
  const body = new FormData();
  body.append('image', file);
  const result = await api(mediaUrl,{method:'POST',body});
  return result.path;
}
async function save(event) {
  event.preventDefault();
  const button = $('#content-form button[type=submit]');
  button.disabled = true;
  try {
    const item = readForm();
    if (currentTab === 'articles') {
      const file = $('#field-upload').files[0];
      if (file) item.image = await uploadImage(file);
    }
    const updated={...data,[currentTab]:data[currentTab].map((entry,index)=>index===selected?item:entry)};
    const response = await api(contentUrl,{method:'PUT',body:JSON.stringify({content:updated,revision:contentRevision})});
    data=updated;
    contentRevision = response.revision;
    notice('Saved to MySQL. Changes are live now.');
    renderList();
    renderForm();
  } catch(error) { notice(error.message,true); }
  finally { button.disabled = false; }
}
async function loadMetrics() {
  if (!authenticated) return;
  try {
    metrics = await api(dashboardUrl);
    renderMetrics();
  } catch(error) {
    $('#messages-content').textContent = 'Live inquiries are unavailable here. Hostinger must run PHP and allow a private writable data directory.';
    $('#analytics-cards').replaceChildren();
    $('#analytics-pages').textContent = 'Live analytics are unavailable here. They are not supported on GitHub Pages preview.';
  }
}
async function loadSetupStatus() {
  if (!authenticated) return;
  try {
    const result = await api(setupUrl);
    $('#database-status').textContent = result.configured ? 'Connected. Site content, inquiries, and analytics use MySQL.' : 'Database connection needed before the admin can edit live content.';
  } catch(error) { $('#database-status').textContent = error.message; }
}
function renderMetrics() {
  if (!metrics) return;
  $('#connection').textContent = metrics.storage === 'mysql' ? 'Signed in · Hostinger MySQL' : 'Signed in · Hostinger files';
  const messages = $('#messages-content');
  messages.replaceChildren();
  if (!metrics.messages.length) messages.textContent = 'No inquiries yet.';
  else {
    const wrap = document.createElement('div'); wrap.className='table-wrap';
    const table = document.createElement('table'); table.className='data-table';
    const head = document.createElement('tr');
    for (const label of ['Date','Name','Contact','Service','Message']) { const cell=document.createElement('th');cell.textContent=label;head.append(cell); }
    table.append(head);
    for (const row of metrics.messages) {
      const tr=document.createElement('tr');
      for (const value of [row.date,row.name || '—',(row.email || '') + (row.phone ? ' / ' + row.phone : ''),row.service || '—',row.message || '—']) { const td=document.createElement('td');td.textContent=value;tr.append(td); }
      table.append(tr);
    }
    wrap.append(table);messages.append(wrap);
  }
  const cards=$('#analytics-cards');cards.replaceChildren();
  for (const [value,label] of [[metrics.views,'Views in 30 days'],[metrics.today,'Views today'],[metrics.messages.length,'Inquiries']]) {
    const box=document.createElement('div');box.className='metric';
    const strong=document.createElement('strong');strong.textContent=value;
    const caption=document.createElement('span');caption.textContent=label;
    box.append(strong,caption);cards.append(box);
  }
  const pages=$('#analytics-pages');pages.replaceChildren();
  const max=metrics.pages[0]?.count || 1;
  for (const row of metrics.pages) {
    const line=document.createElement('div');line.style.margin='18px 0';
    const title=document.createElement('span');title.textContent=row.path + ' · ' + row.count;
    const bar=document.createElement('div');bar.className='bar';
    const fill=document.createElement('i');fill.style.width=(row.count/max*100)+'%';
    bar.append(fill);line.append(title,bar);pages.append(line);
  }
  if (!metrics.pages.length) pages.textContent='No page views recorded yet.';
  renderDashboard();
  renderUTM();
}
function metricCard(value,label){
  const card=document.createElement('div');card.className='metric';
  const number=document.createElement('strong');number.textContent=Number(value||0).toLocaleString();
  const caption=document.createElement('span');caption.textContent=label;
  card.append(number,caption);return card;
}
function renderTrend(selector,rows){
  const chart=$(selector);chart.replaceChildren();chart.classList.remove('empty');
  const counts=new Map((rows||[]).map(row=>[String(row.day).slice(0,10),Number(row.count)]));
  const days=Array.from({length:30},(_,i)=>{const date=new Date();date.setUTCDate(date.getUTCDate()-(29-i));return date.toISOString().slice(0,10)});
  const max=Math.max(...days.map(day=>counts.get(day)||0),1);
  if(!days.some(day=>counts.get(day))){chart.classList.add('empty');chart.textContent='No visits recorded yet.';return;}
  for(const day of days){const bar=document.createElement('div');const count=counts.get(day)||0;bar.style.height=Math.max(count/max*100,2)+'%';bar.title=`${day}: ${count} visits`;bar.setAttribute('aria-label',bar.title);chart.append(bar);}
}
function renderDashboard(){
  if(!metrics)return;
  const summary=$('#summary');summary.replaceChildren(metricCard(metrics.views,'Visits · 30 days'),metricCard(metrics.today,'Visits today'),metricCard(metrics.inquiries30,'Inquiries · 30 days'),metricCard(metrics.utmViews,'UTM visits · 30 days'));
  renderTrend('#overview-trend',metrics.daily);
  const recent=$('#overview-inquiries');recent.replaceChildren();
  if(!metrics.messages.length)recent.textContent='No inquiries yet.';
  for(const item of metrics.messages.slice(0,5)){
    const row=document.createElement('div');row.className='data-row';
    const text=document.createElement('div');const name=document.createElement('strong');name.textContent=item.name||item.email||'Visitor';const detail=document.createElement('small');detail.textContent=(item.service||'General inquiry')+' · '+item.date;text.append(name,detail);row.append(text);recent.append(row);
  }
  const content=$('#overview-content');content.replaceChildren();
  for(const [value,label] of [[data?.articles?.length||0,'Blog posts'],[data?.services?.length||0,'Services'],[data?.projects?.length||0,'Projects'],[data?.processSteps?.length||0,'Process steps']]){const chip=document.createElement('span');chip.textContent=`${value} ${label}`;content.append(chip);}
}
function renderRanking(selector,rows,emptyText){
  const target=$(selector);target.replaceChildren();
  if(!rows?.length){target.textContent=emptyText;return;}
  for(const item of rows){const row=document.createElement('div');row.className='data-row';const label=document.createElement('span');label.textContent=item.label||'(not set)';const value=document.createElement('strong');value.textContent=Number(item.count).toLocaleString();row.append(label,value);target.append(row);}
}
function renderUTM(){
  if(!metrics)return;
  $('#utm-cards').replaceChildren(metricCard(metrics.utmViews,'Tagged visits · 30 days'),metricCard(metrics.utmSources?.length,'Sources'),metricCard(metrics.utmCampaigns?.length,'Campaign groups'));
  renderRanking('#utm-sources',metrics.utmSources,'No tagged traffic yet.');
  renderRanking('#utm-mediums',metrics.utmMediums,'No tagged traffic yet.');
  renderRanking('#utm-landings',metrics.utmLandings,'No tagged landing pages yet.');
  const campaigns=$('#utm-campaigns');campaigns.replaceChildren();
  if(!metrics.utmCampaigns?.length)campaigns.textContent='No campaigns recorded yet. Generate a tagged link below to start tracking.';
  for(const item of metrics.utmCampaigns||[]){const row=document.createElement('div');row.className='data-row';const text=document.createElement('div');const name=document.createElement('strong');name.textContent=item.label||'(not set)';const detail=document.createElement('small');detail.textContent=`${item.source||'(no source)'} / ${item.medium||'(no medium)'}`;text.append(name,detail);const value=document.createElement('strong');value.textContent=Number(item.count).toLocaleString();row.append(text,value);campaigns.append(row);}
  renderTrend('#utm-trend',metrics.utmDaily);
}
async function loadStorage(){
  if(!isOwner)return;
  try{
    const result=await api(storageUrl);
    $('#storage-summary').replaceChildren(metricCard(result.contentRevision,'Content revision'),metricCard(result.mediaCount,'Images'),metricCard(result.viewsTotal,'All page views'),metricCard(result.inquiriesTotal,'All inquiries'));
    const list=$('#media-list');list.replaceChildren();
    if(!result.recentMedia.length)list.textContent='No uploaded images yet.';
    for(const item of result.recentMedia){
      const card=document.createElement('div');card.className='media-item';
      const img=document.createElement('img');img.src='../../api/media.php?id='+item.id;img.alt=item.name;img.loading='lazy';
      const details=document.createElement('div');const name=document.createElement('strong');name.textContent=item.name;const size=document.createElement('small');size.textContent=(Number(item.bytes)/1024).toFixed(0)+' KB · '+item.created_at;
      const copy=document.createElement('button');copy.type='button';copy.textContent='Copy image path';copy.addEventListener('click',async()=>{await navigator.clipboard.writeText('api/media.php?id='+item.id);notice('Image path copied.');});
      details.append(name,size,copy);card.append(img,details);list.append(card);
    }
  }catch(error){notice(error.message,true);}
}
async function loadUsers(){
  if(!isOwner)return;
  try{
    const result=await api(usersUrl);
    const users=$('#users-list');users.replaceChildren();
    for(const user of result.users){const row=document.createElement('div');row.className='data-row';const text=document.createElement('div');const email=document.createElement('strong');email.textContent=user.email;const detail=document.createElement('small');detail.textContent=(Number(user.id)===1?'Account owner':'Admin')+' · Joined '+user.created_at;text.append(email,detail);row.append(text);if(Number(user.id)!==1){const button=document.createElement('button');button.type='button';button.textContent='Remove';button.addEventListener('click',()=>removeAdmin('user',Number(user.id),user.email));row.append(button);}users.append(row);}
    const invites=$('#invites-list');invites.replaceChildren();
    if(!result.invites.length)invites.textContent='No pending invitations.';
    for(const invite of result.invites){const row=document.createElement('div');row.className='data-row';const text=document.createElement('div');const email=document.createElement('strong');email.textContent=invite.email;const detail=document.createElement('small');detail.textContent='Expires '+invite.expires_at+' UTC';text.append(email,detail);const button=document.createElement('button');button.type='button';button.textContent='Revoke';button.addEventListener('click',()=>removeAdmin('invite',Number(invite.id),invite.email));row.append(text,button);invites.append(row);}
  }catch(error){notice(error.message,true);}
}
async function removeAdmin(kind,id,email){
  if(!confirm(`${kind==='user'?'Remove admin access for':'Revoke the invitation for'} ${email}?`))return;
  try{await api(usersUrl,{method:'DELETE',body:JSON.stringify({kind,id})});notice(kind==='user'?'Admin access removed.':'Invitation revoked.');await loadUsers();}catch(error){notice(error.message,true);}
}
document.querySelectorAll('.sidebar nav button').forEach(button => button.addEventListener('click',() => switchTab(button.dataset.tab)));
$('#login-form').addEventListener('submit',async event => {
  event.preventDefault();
  const button=$('#login'); button.disabled=true;
  try {
    const result=await api(new URL('?action=login',authUrl),{method:'POST',body:JSON.stringify({email:$('#login-email').value,password:$('#login-password').value})});
    csrf=result.csrf;isOwner=result.isOwner; $('#login-password').value=''; await openWorkspace();
  } catch(error) { alert(error.message); }
  finally { button.disabled=false; }
});
$('#bootstrap-form').addEventListener('submit',async event => {
  event.preventDefault();
  if ($('#setup-password').value !== $('#setup-confirm').value) { alert('Passwords do not match.'); return; }
  const button=$('#bootstrap-form button[type=submit]'); button.disabled=true;
  try {
    const result=await api(new URL('?action=bootstrap',authUrl),{method:'POST',body:JSON.stringify({email:$('#setup-email').value,password:$('#setup-password').value})});
    csrf=result.csrf;isOwner=true; $('#setup-password').value=''; $('#setup-confirm').value=''; await openWorkspace();
  } catch(error) { alert(error.message); }
  finally { button.disabled=false; }
});
$('#invite-form').addEventListener('submit',async event=>{
  event.preventDefault();
  if($('#invite-password').value!==$('#invite-confirm').value){alert('Passwords do not match.');return;}
  const button=$('#invite-form button[type=submit]');button.disabled=true;
  try{
    const result=await api(new URL('?action=accept-invite',authUrl),{method:'POST',body:JSON.stringify({token:inviteToken,password:$('#invite-password').value})});
    csrf=result.csrf;isOwner=false;inviteToken='';history.replaceState(null,'',location.pathname+location.search);
    $('#invite-password').value='';$('#invite-confirm').value='';await openWorkspace();
  }catch(error){alert(error.message);}finally{button.disabled=false;}
});
$('#logout').addEventListener('click',async () => {
  try { await api(new URL('?action=logout',authUrl),{method:'POST',body:'{}'}); } catch {}
  authenticated=false; isOwner=false; csrf=''; data=null; metrics=null; $('#workspace').hidden=true; $('#signin').hidden=false; $('#connection').textContent='Sign in required';
});
$('#add-item').addEventListener('click',() => {
  const defaults={articles:{slug:'new-article',title:'New article',category:'INSIGHTS',description:'',date:new Date().toISOString().slice(0,10),readTime:'5 min read',intro:'',sections:[{heading:'Section heading',paragraphs:['Write the article here.']}],takeaways:[],relatedService:'ai-analytics'},services:{slug:'new-service',title:'New service',category:'SERVICE',lead:'',description:'',deliverables:[],outcome:'',icon:'✦'},projects:{slug:'new-project',title:'New project',category:'PROJECT',location:'',description:'',theme:'campus'},processSteps:{number:String(data.processSteps.length+1).padStart(2,'0'),title:'New step',description:''}};
  data[currentTab].push(defaults[currentTab]);selected=data[currentTab].length-1;renderList();renderForm();
});
$('#delete-item').addEventListener('click',async () => {
  if (selected<0 || !confirm('Delete this item from the site?')) return;
  const removed=data[currentTab][selected];
  const updated={...data,[currentTab]:data[currentTab].filter((_,index)=>index!==selected)};
  try {
    const result=await api(contentUrl,{method:'PUT',body:JSON.stringify({content:updated,revision:contentRevision})});
    data=updated; selected=-1; contentRevision=result.revision;notice('Removed from the live site.');renderList();
  } catch(error) {notice(error.message,true);renderList();}
});
$('#content-form').addEventListener('submit',save);
$('#database-form').addEventListener('submit',async event => {
  event.preventDefault();
  const password=$('#database-password').value;
  const button=$('#database-form button[type=submit]');
  button.disabled=true;
  try {
    await api(setupUrl,{method:'POST',body:JSON.stringify({password})});
    $('#database-password').value='';
    notice('MySQL connected. Existing inquiries and page views were imported.');
    await loadSetupStatus();
    await loadMetrics();
  } catch(error) { notice(error.message,true); }
  finally { button.disabled=false; }
});
const siteCopyFields=[['heroTitle','Home headline'],['heroAccent','Home highlighted word'],['heroDescription','Home introduction'],['finaleTitle','Final section headline'],['finaleAccent','Final section highlighted line'],['finaleDescription','Final section description'],['footerTitle','Footer headline'],['footerAccent','Footer highlighted line'],['footerDescription','Footer invitation']];
function renderSiteCopy() {
  const form=$('#site-copy-form');form.replaceChildren();
  for (const [key,label] of siteCopyFields) {
    const field=document.createElement('div');field.className='form-field';
    const caption=document.createElement('label');caption.htmlFor='copy-'+key;caption.textContent=label;
    const control=document.createElement('textarea');control.id='copy-'+key;control.rows=2;control.value=data.siteCopy?.[key] || '';
    field.append(caption,control);form.append(field);
  }
  const button=document.createElement('button');button.className='primary';button.type='submit';button.textContent='Save site copy';form.append(button);
}
$('#site-copy-form').addEventListener('submit',async event=>{
  event.preventDefault();
  const siteCopy={...(data.siteCopy||{})};
  for(const [key] of siteCopyFields)siteCopy[key]=$('#copy-'+key).value.trim();
  try {const updated={...data,siteCopy};const result=await api(contentUrl,{method:'PUT',body:JSON.stringify({content:updated,revision:contentRevision})});data=updated;contentRevision=result.revision;notice('Site copy saved to MySQL and is live now.');}
  catch(error){notice(error.message,true);}
});
$('#user-invite-form').addEventListener('submit',async event=>{
  event.preventDefault();
  const button=$('#user-invite-form button[type=submit]');button.disabled=true;
  try{
    const result=await api(usersUrl,{method:'POST',body:JSON.stringify({email:$('#invite-email').value})});
    $('#invite-link').value=result.inviteUrl;$('#invite-link-box').hidden=false;$('#invite-email').value='';
    notice('Invitation created. Share the link privately with '+result.email+'.');await loadUsers();
  }catch(error){notice(error.message,true);}finally{button.disabled=false;}
});
$('#copy-invite-link').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText($('#invite-link').value);notice('Invitation link copied.');}catch{ $('#invite-link').select();notice('Select and copy the invitation link.'); }
});
$('#utm-builder').addEventListener('submit',event=>{
  event.preventDefault();
  const fields=new FormData(event.currentTarget);
  try{
    const target=new URL(String(fields.get('path')||'/'),location.origin);
    if(target.origin!==location.origin)throw new Error('Use a path on this website.');
    for(const key of ['source','medium','campaign'])target.searchParams.set('utm_'+key,String(fields.get(key)||'').trim());
    $('#utm-link').textContent=target.href;
  }catch(error){notice(error.message,true);}
});
$('#media-form').addEventListener('submit',async event=>{
  event.preventDefault();const file=$('#media-file').files[0];if(!file)return;
  const button=$('#media-form button');button.disabled=true;
  try{const path=await uploadImage(file);$('#media-file').value='';notice('Image uploaded. Path: '+path);await loadStorage();}catch(error){notice(error.message,true);}finally{button.disabled=false;}
});
if (location.hostname === 'cloudempiretech.github.io') location.replace('https://cloudempire.tech/admin/');
else initialize();
