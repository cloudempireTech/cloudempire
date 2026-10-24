// The homepage HTML is prerendered; only its controls and analytics need JS.
const siteCopy=window.__CLOUDEMPIRE_CONTENT__?.siteCopy || {};

function setHeading(selector,title,accent){
  const heading=document.querySelector(selector);
  if(!heading)return;
  const first=[...heading.childNodes].find(node=>node.nodeType===Node.TEXT_NODE);
  if(first && title)first.textContent=title;
  if(accent)heading.querySelector('em').textContent=accent;
}
setHeading('.home-finale h2',siteCopy.finaleTitle,siteCopy.finaleAccent);
setHeading('.footer-invite h2',siteCopy.footerTitle,siteCopy.footerAccent);
if(siteCopy.finaleDescription)document.querySelector('.home-finale p').textContent=siteCopy.finaleDescription;
if(siteCopy.footerDescription)document.querySelector('.footer-invite p').textContent=siteCopy.footerDescription;

const menu=document.querySelector('.menu-toggle');
const navigation=document.querySelector('.nav-links');
if(menu && navigation){
  const icon=menu.querySelector('svg');
  const menuIcon=icon?.innerHTML;
  menu.addEventListener('click',()=>{
    const open=navigation.classList.toggle('is-open');
    menu.setAttribute('aria-expanded',String(open));
    menu.setAttribute('aria-label',open?'Close menu':'Open menu');
    if(icon)icon.innerHTML=open?'<path d="M18 6 6 18M6 6l12 12"/>':menuIcon;
  });
}

const carousel=document.querySelector('.hero-carousel');
if(carousel){
  const slides=JSON.parse(carousel.dataset.slides || '[]');
  const overrides=[
    ['heroTitle','heroAccent','heroDescription'],
    ['heroAiTitle','heroAiAccent','heroAiDescription'],
    ['heroWebTitle','heroWebAccent','heroWebDescription'],
    ['heroAppsTitle','heroAppsAccent','heroAppsDescription']
  ];
  overrides.forEach((keys,index)=>keys.forEach((key,field)=>{
    if(siteCopy[key])slides[index][['title','accent','description'][field]]=siteCopy[key];
  }));
  const tabs=[...document.querySelectorAll('.hero-slide-tab')];
  let slide=0,visible=false,timer;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  function isPlaying(){return visible && !document.hidden && !motion.matches;}
  function paint(index){
    slide=index;
    const current=slides[index];
    const copy=document.querySelector('.hero-slide-copy');
    if(!current || !copy)return;
    const fresh=copy.cloneNode(true);
    const eyebrow=fresh.querySelector('.eyebrow');
    eyebrow.replaceChildren(eyebrow.querySelector('.eyebrow-line'),document.createTextNode(' '+current.eyebrow));
    const title=fresh.querySelectorAll('.hero-title-inner');
    title[0].textContent=current.title;
    title[1].textContent=current.accent;
    fresh.querySelector('p').textContent=current.description;
    copy.replaceWith(fresh);
    tabs.forEach((tab,i)=>{
      tab.classList.toggle('is-current',i===index);
      tab.classList.toggle('is-playing',isPlaying());
      tab.setAttribute('aria-pressed',String(i===index));
      tab.style.setProperty('--slide-duration',index===0?'6.5s':'4s');
      if(i===index){
        const track=tab.querySelector('.hero-slide-track');
        track.replaceWith(track.cloneNode(true));
      }
    });
    schedule();
  }
  function schedule(){
    clearTimeout(timer);
    tabs.forEach(tab=>tab.classList.toggle('is-playing',isPlaying()));
    if(isPlaying())timer=setTimeout(()=>paint((slide+1)%slides.length),slide===0?6500:4000);
  }
  tabs.forEach((tab,index)=>tab.addEventListener('click',()=>paint(index)));
  tabs[0]?.style.setProperty('--slide-duration','6.5s');
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule();},{threshold:.35}).observe(carousel);
  document.addEventListener('visibilitychange',schedule);
  motion.addEventListener('change',schedule);
  if(Object.keys(siteCopy).some(key=>key.startsWith('hero')))paint(0);
}

const scenes=[...document.querySelectorAll('.home-section')];
const footer=document.querySelector('.multi-footer');
const dots=[...document.querySelectorAll('.home-progress a')];
const progress=document.querySelector('.home-progress');
const sceneObserver=new IntersectionObserver(entries=>{
  for(const entry of entries){
    if(!entry.isIntersecting)continue;
    const index=entry.target===footer?6:Number(entry.target.dataset.scene);
    scenes.forEach((scene,i)=>scene.classList.toggle('is-active',i===index));
    dots.forEach((dot,i)=>dot.classList.toggle('active',i===index));
    progress?.classList.toggle('is-hidden',index===6);
    if(index===5)entry.target.dataset.motionReady='true';
  }
},{rootMargin:'-35% 0px -35% 0px'});
scenes.forEach(scene=>sceneObserver.observe(scene));
if(footer)sceneObserver.observe(footer);

if(location.hostname==='cloudempire.tech' || location.hostname==='www.cloudempire.tech'){
  if(navigator.sendBeacon){
    const query=new URLSearchParams(location.search),utm={};
    for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'])utm[key]=(query.get(key)||'').slice(0,150);
    navigator.sendBeacon('/api/collect.php',new Blob([JSON.stringify({kind:'view',path:location.pathname,...utm})],{type:'application/json'}));
  }
  const analytics=()=>{
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('js',new Date());
    window.gtag('config','G-93JQKBW9X3');
    const script=document.createElement('script');
    script.async=true;
    script.src='https://www.googletagmanager.com/gtag/js?id=G-93JQKBW9X3';
    document.head.append(script);
  };
  if(document.readyState==='complete')setTimeout(analytics,6000);
  else window.addEventListener('load',()=>setTimeout(analytics,6000),{once:true});
}
