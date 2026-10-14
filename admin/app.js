const $ = selector => document.querySelector(selector);
const tabs = ['overview','articles','services','projects','processSteps','messages','analytics','database','files'];
const labels = {overview:'Overview',articles:'Blog posts',services:'Services',projects:'Portfolio',processSteps:'Process',messages:'Inquiries',analytics:'Analytics',database:'Database & storage',files:'Other content'};
let authenticated = false;
let csrf = '';
let data = null;
let contentSha = '';
let currentTab = 'overview';
let selected = -1;
let metrics = null;
const dashboardUrl = new URL('../../api/dashboard.php', import.meta.url);
const setupUrl = new URL('../../api/setup.php', import.meta.url);
const mediaUrl = new URL('../../api/media.php', import.meta.url);
const authUrl = new URL('../../api/auth.php', import.meta.url);
const contentUrl = new URL('../../api/content.php', import.meta.url);

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
  contentSha = file.sha;
  data = file.content;
}
async function openWorkspace() {
  authenticated=true;
  $('#signin').hidden=true;
  $('#bootstrap').hidden=true;
  $('#workspace').hidden=false;
  $('#connection').textContent='Connected to CloudEmpire';
  try {
    await loadContent();
    $('#summary').replaceChildren();
    for (const [value,label] of [[data.articles.length,'Blog posts'],[data.services.length,'Services'],[data.projects.length,'Projects']]) {
      const card = document.createElement('div');
      card.className = 'metric';
      const count = document.createElement('strong');
      count.textContent = value;
      const caption = document.createElement('span');
      caption.textContent = label;
      card.append(count,caption);
      $('#summary').append(card);
    }
    switchTab('overview');
  } catch (error) { notice(error.message,true); }
  loadMetrics();
  loadSetupStatus();
}
async function initialize() {
  try {
    const state=await api(authUrl);
    if (state.loggedIn) { csrf=state.csrf; await openWorkspace(); }
    else { $('#signin').hidden=state.setupRequired; $('#bootstrap').hidden=!state.setupRequired; }
  } catch(error) { $('#signin').hidden=true; $('#bootstrap').hidden=true; $('#connection').textContent=error.message; }
}
function switchTab(tab) {
  if (!tabs.includes(tab) || !authenticated) return;
  if (!data && ['articles','services','projects','processSteps'].includes(tab)) { notice('Content is unavailable. Update the GitHub publishing token in Database & storage.',true); return; }
  currentTab = tab;
  selected = -1;
  document.querySelectorAll('.sidebar nav button').forEach(button => button.classList.toggle('active',button.dataset.tab===tab));
  document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
  $('#page-title').textContent = labels[tab];
  const panelId = ['articles','services','projects','processSteps'].includes(tab) ? 'editor-panel' : tab;
  $('#' + panelId).classList.add('active');
  if (panelId === 'editor-panel') renderList();
  if (tab === 'messages' || tab === 'analytics') loadMetrics();
  if (tab === 'database') loadSetupStatus();
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
    const response = await api(contentUrl,{method:'PUT',body:JSON.stringify({message:'Update ' + currentTab + ': ' + item.title,content:updated,sha:contentSha})});
    data=updated;
    contentSha = response.sha;
    notice('Saved to GitHub. Publishing is running; check Actions for the build and Hostinger for deployment.');
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
    $('#database-status').textContent = result.configured ? 'Database settings saved. Inquiries and analytics use MySQL.' : 'Database connection needed. Until then, inquiries and analytics are saved in private hosting files.';
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
}
document.querySelectorAll('.sidebar nav button').forEach(button => button.addEventListener('click',() => switchTab(button.dataset.tab)));
$('#login-form').addEventListener('submit',async event => {
  event.preventDefault();
  const button=$('#login'); button.disabled=true;
  try {
    const result=await api(new URL('?action=login',authUrl),{method:'POST',body:JSON.stringify({email:$('#login-email').value,password:$('#login-password').value})});
    csrf=result.csrf; $('#login-password').value=''; await openWorkspace();
  } catch(error) { alert(error.message); }
  finally { button.disabled=false; }
});
$('#bootstrap-form').addEventListener('submit',async event => {
  event.preventDefault();
  if ($('#setup-password').value !== $('#setup-confirm').value) { alert('Passwords do not match.'); return; }
  const button=$('#bootstrap-form button[type=submit]'); button.disabled=true;
  try {
    const result=await api(new URL('?action=bootstrap',authUrl),{method:'POST',body:JSON.stringify({email:$('#setup-email').value,password:$('#setup-password').value,githubToken:$('#setup-token').value})});
    csrf=result.csrf; $('#setup-password').value=''; $('#setup-confirm').value=''; $('#setup-token').value=''; await openWorkspace();
  } catch(error) { alert(error.message); }
  finally { button.disabled=false; }
});
$('#logout').addEventListener('click',async () => {
  try { await api(new URL('?action=logout',authUrl),{method:'POST',body:'{}'}); } catch {}
  authenticated=false; csrf=''; data=null; metrics=null; $('#workspace').hidden=true; $('#signin').hidden=false; $('#connection').textContent='Sign in required';
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
    const result=await api(contentUrl,{method:'PUT',body:JSON.stringify({message:'Remove ' + currentTab + ': ' + removed.title,content:updated,sha:contentSha})});
    data=updated; selected=-1; contentSha=result.sha;notice('Removed from GitHub. Publishing is running.');renderList();
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
$('#publishing-form').addEventListener('submit',async event => {
  event.preventDefault();
  const button=$('#publishing-form button[type=submit]'); button.disabled=true;
  try {
    await api(new URL('?action=token',authUrl),{method:'POST',body:JSON.stringify({password:$('#publishing-password').value,githubToken:$('#publishing-token').value})});
    $('#publishing-password').value=''; $('#publishing-token').value=''; notice('Publishing token updated.');
  } catch(error) { notice(error.message,true); }
  finally { button.disabled=false; }
});
if (location.hostname === 'cloudempiretech.github.io') location.replace('https://cloudempire.tech/admin/');
else initialize();
