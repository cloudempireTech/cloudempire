// The Hostinger PHP endpoint accepts anonymous page views and contact form
// submissions. sendBeacon lets the WhatsApp handoff happen without waiting.
const siteRoot = location.pathname.startsWith('/cloudempire/') ? '/cloudempire/' : '/';
const endpoint = siteRoot + 'api/collect.php';
function send(payload) {
  if (typeof navigator.sendBeacon !== 'function') return;
  navigator.sendBeacon(endpoint,new Blob([JSON.stringify(payload)],{type:'application/json'}));
}
if (!location.pathname.includes('/admin/')) {
  const query=new URLSearchParams(location.search);
  const utm={};
  for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']) utm[key]=(query.get(key)||'').slice(0,150);
  send({kind:'view',path:location.pathname.slice(siteRoot.length-1),...utm});
  document.addEventListener('submit',event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.querySelector('#email')) return;
    const data = new FormData(form);
    send({
      kind:'message',
      name:data.get('name') || '',
      email:data.get('email') || '',
      phone:data.get('phone') || '',
      service:data.get('service') || '',
      datePreferred:data.get('date') || '',
      timePreferred:data.get('time') || '',
      message:data.get('message') || '',
      website:data.get('website') || ''
    });
  },true);
}
