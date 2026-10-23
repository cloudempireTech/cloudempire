// The Hostinger PHP endpoint accepts anonymous page views and contact form
// submissions. sendBeacon lets the WhatsApp handoff happen without waiting.
const siteRoot = location.pathname.startsWith('/cloudempire/') ? '/cloudempire/' : '/';
const endpoint = siteRoot + 'api/collect.php';
const liveHost = location.hostname === 'cloudempire.tech' || location.hostname === 'www.cloudempire.tech';
// First-party page views remain immediate; the larger Google Analytics library
// can wait until after the first paint and the initial interaction window.
function loadGoogleAnalytics() {
  if (!liveHost || location.pathname.includes('/admin/') || window.__cloudEmpireAnalyticsLoaded) return;
  window.__cloudEmpireAnalyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){window.dataLayer.push(arguments);};
  window.gtag('js', new Date());
  window.gtag('config', 'G-93JQKBW9X3');
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-93JQKBW9X3';
  document.head.append(script);
}
if (document.readyState === 'complete') setTimeout(loadGoogleAnalytics, 6000);
else window.addEventListener('load', () => setTimeout(loadGoogleAnalytics, 6000), {once:true});
function send(payload) {
  if (!liveHost || typeof navigator.sendBeacon !== 'function') return;
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
