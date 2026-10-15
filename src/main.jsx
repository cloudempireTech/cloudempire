import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Clock3, Facebook, Globe2, Instagram, Layers3, Menu, ShieldCheck, Sparkles, X, Zap } from 'lucide-react';
import { DeviceVisual } from './DeviceVisual.jsx';
import { articles as seedArticles, processSteps as seedProcessSteps, projects as seedProjects, services as seedServices } from './content.mjs';
import './styles.css';
import './pages.css';
import './interaction.css';
import './home-motion.css';
import './telemetry.js';

const siteRoot = window.location.pathname.startsWith('/cloudempire/') ? '/cloudempire/' : '/';
const url = path => `${siteRoot}${path}`;
const asset = name => /^https?:\/\//.test(name) ? name : name.startsWith('api/media.php?') ? `https://cloudempire.tech/${name}` : url(name);
const segments = window.location.pathname.slice(siteRoot.length).split('/').filter(Boolean);
const route = segments[0] === 'app.html' || segments[0] === 'index.html' ? [] : segments;
let articles=seedArticles,processSteps=seedProcessSteps,projects=seedProjects,services=seedServices;
let siteCopy={heroTitle:'Build what’s',heroAccent:'next.',heroDescription:'AI that thinks ahead. Websites that stand apart. Android and iOS apps that feel effortless. We bring ambitious ideas to life.',finaleTitle:'Everything you need.',finaleAccent:'One team to make it happen.',finaleDescription:'From strategy and design to cloud, Salesforce, security, and long-term support, we’re ready to build what comes next with you.',footerTitle:'Let’s make',footerAccent:'what’s next.',footerDescription:'One conversation can change everything. Tell us what you’re building.'};
function applyContent(content){
  if(!content || !['articles','processSteps','projects','services'].every(key=>Array.isArray(content[key])))return;
  ({articles,processSteps,projects,services}=content);
  siteCopy={...siteCopy,...content.siteCopy};
}

const focus = [
  {label:'02 / OUR FOCUS',eyebrow:'ARTIFICIAL INTELLIGENCE',title:<>One partner.<br/><em>Every possibility.</em></>,description:'Useful intelligence, built into the moments that matter. We turn data and automation into better decisions and better experiences.',link:'ai-analytics',number:'01'},
  {label:'03 / WEB EXPERIENCES',eyebrow:'WEBSITES & WEB APPS',title:<>The web,<br/><em>reimagined.</em></>,description:'Expressive websites and powerful platforms, built for clarity, speed, and the people who use them.',link:'web-development',number:'02'},
  {label:'04 / ANDROID',eyebrow:'ANDROID APPLICATIONS',title:<>Made for<br/><em>every moment.</em></>,description:'Thoughtful Android experiences that feel effortless in the hand and dependable behind the scenes.',link:'app-development',number:'03'},
  {label:'05 / IOS',eyebrow:'IOS APPLICATIONS',title:<>A little more<br/><em>extraordinary.</em></>,description:'Considered iPhone experiences that pair elegant interactions with robust engineering.',link:'app-development',number:'04'},
];

function Reveal({children,className=''}) {
  const ref=useRef(null);
  useEffect(()=>{
    const element=ref.current;
    if(!element)return;
    let visible=false;
    const finish=()=>{if(visible)return;visible=true;element.classList.add('is-visible');observer.disconnect();window.removeEventListener('scroll',check);window.removeEventListener('resize',check);};
    const check=()=>{const rect=element.getBoundingClientRect();if(rect.bottom>0&&rect.top<window.innerHeight)finish();};
    const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting)finish();},{threshold:.01,rootMargin:'0px 0px 10% 0px'});
    observer.observe(element);
    window.addEventListener('scroll',check,{passive:true});
    window.addEventListener('resize',check);
    check();
    return()=>{observer.disconnect();window.removeEventListener('scroll',check);window.removeEventListener('resize',check);};
  },[]);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

function Count({value,suffix=''}) {
  const ref=useRef(null),[count,setCount]=useState(0);
  useEffect(()=>{
    const observer=new IntersectionObserver(([entry])=>{
      if(!entry.isIntersecting)return;
      observer.disconnect();
      if(matchMedia('(prefers-reduced-motion: reduce)').matches){setCount(value);return;}
      const start=performance.now();
      const tick=now=>{const p=Math.min((now-start)/1400,1);setCount(Math.round(value*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(tick);};
      requestAnimationFrame(tick);
    },{threshold:.4});
    if(ref.current)observer.observe(ref.current);
    return()=>observer.disconnect();
  },[value]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function Header(){
  const [open,setOpen]=useState(false);
  const nav=[['Home',''],['About','about/'],['Services','services/'],['Work','work/'],['Process','process/'],['Blog','blog/'],['Contact','contact/']];
  return <header className="site-header multi-header">
    <a className="brand" href={url('')} aria-label="CloudEmpire home"><img src={asset('logo-light.png')} alt="CloudEmpire"/></a>
    <nav className={`nav-links ${open?'is-open':''}`} aria-label="Main navigation">{nav.map(([label,path])=><a key={label} href={url(path)} className={(path===''?route.length===0:route[0]===path.slice(0,-1))?'current':''}>{label}</a>)}</nav>
    <a className="nav-cta" href={url('contact/')}>Let’s talk <ArrowUpRight size={16}/></a>
    <button className="menu-toggle" type="button" onClick={()=>setOpen(!open)} aria-expanded={open} aria-label={open?'Close menu':'Open menu'}>{open?<X size={23}/>:<Menu size={23}/>}</button>
  </header>;
}

function Footer(){return <footer className="multi-footer"><div className="container"><div className="footer-invite"><div><span className="footer-kicker"><span className="live-dot"/> READY WHEN YOU ARE</span><h2>{siteCopy.footerTitle}<br/><em>{siteCopy.footerAccent}</em></h2><p>{siteCopy.footerDescription}</p></div><a className="footer-invite-link" href={url('contact/')} aria-label="Start a project with CloudEmpire"><ArrowUpRight size={35}/></a></div><div className="footer-directory"><div className="footer-brand"><a href={url('')} aria-label="CloudEmpire home"><img src={asset('logo-light.png')} alt="CloudEmpire"/></a><p>Intelligent products. Thoughtful design.<br/>Technology made for people.</p><div className="footer-socials" aria-label="CloudEmpire social media"><a href="https://www.instagram.com/cloudempire.tech/" target="_blank" rel="noopener noreferrer" aria-label="CloudEmpire on Instagram"><Instagram size={18}/></a><a href="https://www.facebook.com/profile.php?id=61595421568280" target="_blank" rel="noopener noreferrer" aria-label="CloudEmpire on Facebook"><Facebook size={18}/></a></div></div><div className="footer-links"><div><span>EXPLORE</span><a href={url('about/')}>About us</a><a href={url('services/')}>Services</a><a href={url('work/')}>Selected work</a><a href={url('process/')}>Our process</a></div><div><span>INSIGHTS</span><a href={url('blog/')}>Journal</a><a href={url('services/ai-analytics/')}>Artificial intelligence</a><a href={url('services/web-development/')}>Web development</a><a href={url('services/app-development/')}>Mobile apps</a></div><div><span>CONNECT</span><a href={url('contact/')}>Contact us</a><a href="mailto:contact@cloudempire.tech">Email</a><a href="https://wa.me/919475639634" target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight size={13}/></a><a href="tel:+919475639634">+91 94756 39634</a></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} CloudEmpire. Made for what’s next.</span><span>Kolkata, India · Working everywhere</span><a href="#top" onClick={e=>{if(route.length){e.preventDefault();window.location.href=url('');}}}>Back to top ↑</a></div></div></footer>}

function Home(){
  const [active,setActive]=useState(0);
  useEffect(()=>{
    document.documentElement.classList.add('snap-home');
    const targets=[...document.querySelectorAll('.home-section')];
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0;
    const update=()=>{
      frame=0;
      const height=window.innerHeight;
      let current=0;
      let settling=false;
      for(const target of targets){
        const top=target.getBoundingClientRect().top;
        const progress=Math.max(0,Math.min(1,(1-top/height-.04)/.83));
        const desired=reduced.matches ? 1 : progress*progress*(3-2*progress);
        const previous=Number(target.dataset.motion ?? (target.dataset.scene==='0' ? 1 : 0));
        const eased=reduced.matches ? 1 : previous+(desired-previous)*.19;
        if(Math.abs(desired-eased)>.002)settling=true;
        target.dataset.motion=String(eased);
        target.style.setProperty('--scene-opacity',eased.toFixed(3));
        target.style.setProperty('--scene-shift',`${Math.round((1-eased)*92)}px`);
        target.style.setProperty('--scene-art-shift',`${Math.round((1-eased)*145)}px`);
        target.style.setProperty('--scene-scale',(0.88+eased*.12).toFixed(3));
        if(target.dataset.scene==='5')target.dataset.motionReady=progress>.4 || reduced.matches ? 'true' : 'false';
        if(top<height*.54)current=Number(target.dataset.scene);
      }
      if(document.querySelector('.multi-footer')?.getBoundingClientRect().top<height*.55)current=6;
      setActive(previous=>previous===current?previous:current);
      if(settling)frame=requestAnimationFrame(update);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    update();
    let lockedUntil=0;
    const goScene=direction=>{
      const height=window.innerHeight;
      const footer=document.querySelector('.multi-footer');
      let sceneTop=0;
      const positions=[...targets.map(target=>{const top=sceneTop;sceneTop+=target.offsetHeight;return top;}),footer?.offsetTop ?? sceneTop];
      const nearest=positions.reduce((best,position,index)=>Math.abs(position-window.scrollY)<Math.abs(positions[best]-window.scrollY)?index:best,0);
      const current=window.scrollY>positions[nearest]+height*.18 && nearest<positions.length-1 ? nearest+1 : nearest;
      const next=Math.max(0,Math.min(positions.length-1,current+direction));
      window.scrollTo({top:positions[next],behavior:reduced.matches?'instant':'smooth'});
    };
    const onWheel=event=>{
      if(reduced.matches || Math.abs(event.deltaY)<4 || event.ctrlKey)return;
      if(window.scrollY>targets.reduce((total,target)=>total+target.offsetHeight,0)-window.innerHeight*.45 && event.deltaY>0)return;
      event.preventDefault();
      if(performance.now()<lockedUntil)return;
      lockedUntil=performance.now()+850;
      goScene(event.deltaY>0?1:-1);
    };
    const onKey=event=>{
      if(reduced.matches || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||'') || event.altKey || event.ctrlKey || event.metaKey)return;
      const direction=['ArrowDown','PageDown',' '].includes(event.key)?1:['ArrowUp','PageUp'].includes(event.key)?-1:0;
      if(!direction)return;
      event.preventDefault();
      if(performance.now()<lockedUntil)return;
      lockedUntil=performance.now()+850;
      goScene(direction);
    };
    window.addEventListener('wheel',onWheel,{passive:false});
    window.addEventListener('keydown',onKey);
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule);
    reduced.addEventListener('change',schedule);
    return()=>{document.documentElement.classList.remove('snap-home');window.removeEventListener('wheel',onWheel);window.removeEventListener('keydown',onKey);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);reduced.removeEventListener('change',schedule);cancelAnimationFrame(frame);};
  },[]);
  return <main className="home-main">
    <section className="hero home-hero home-section" style={{zIndex:1}} data-scene="0" id="top"><div className="hero-noise"/><div className="hero-orb"><div className="orb-core"/><div className="orb-ring ring-one"/><div className="orb-ring ring-two"/><div className="orb-highlight"/></div><div className="container hero-content"><div className="eyebrow"><span className="eyebrow-line"/> DIGITAL EXPERIENCES, ENGINEERED FOR TOMORROW</div><h1>{siteCopy.heroTitle}<br/><span>{siteCopy.heroAccent}</span></h1><p>{siteCopy.heroDescription}</p><div className="hero-actions"><a className="button button-primary" href={url('contact/')}>Start a project <ArrowUpRight size={18}/></a><a className="text-link" href="#focus-1">Explore our focus <ArrowDown size={17}/></a></div></div><div className="hero-bottom container"><span>TECHNOLOGY WITH PURPOSE. IMPACT WITHOUT LIMITS.</span><a href="#focus-1"><span>SCROLL TO EXPLORE</span><ArrowDown size={16}/></a></div></section>
    {focus.map((item,i)=><section key={item.number} style={{zIndex:i+2}} className={`home-section home-focus focus-${i} ${active===i+1?'is-active':''}`} data-scene={i+1} id={`focus-${i+1}`}><div className="container focus-layout"><div className="focus-copy"><div className="section-label"><span>{item.label}</span><i/></div><span className="focus-eyebrow">{item.eyebrow}</span><h2>{item.title}</h2><p>{item.description}</p><a href={url(`services/${item.link}/`)} className="inline-link">Explore this service <ArrowUpRight size={18}/></a><div className="focus-count">{item.number} <span>/ 04</span></div></div><div className="focus-art"><DeviceVisual active={i}/></div></div></section>)}
    <section className="home-section home-finale" style={{zIndex:6}} data-scene="5" id="future"><div className="container"><div className="section-label"><span>06 / THE NEXT STEP</span><i/></div><h2>{siteCopy.finaleTitle}<br/><em>{siteCopy.finaleAccent}</em></h2><p>{siteCopy.finaleDescription}</p><div className="hero-actions"><a className="button button-primary" href={url('services/')}>See every service <ArrowUpRight size={18}/></a><a className="text-link" href={url('contact/')}>Start a conversation <ArrowRight size={18}/></a></div></div></section>
    <nav className={`home-progress ${active===6?'is-hidden':''}`} aria-label="Home scenes">{['top','focus-1','focus-2','focus-3','focus-4','future'].map((id,i)=><a key={id} className={active===i?'active':''} href={`#${id}`} aria-label={`Go to scene ${i+1}`}/>)}</nav>
  </main>;
}

function PageHero({kicker,title,accent,description,small=false}){return <section className={`page-hero ${small?'page-hero-small':''}`}><div className="page-hero-glow"/><div className="container"><div className="section-label"><span>{kicker}</span><i/></div><h1>{title}{accent&&<><br/><em>{accent}</em></>}</h1><p>{description}</p></div></section>}
function PageCta({title='Have an idea in mind?',description='Let’s build the right solution together.'}){return <section className="page-cta"><div className="container"><span>LET’S CREATE WHAT’S NEXT</span><h2>{title}</h2><p>{description}</p><a className="button button-primary" href={url('contact/')}>Start a conversation <ArrowUpRight size={18}/></a></div></section>}
function Stats(){return <div className="stats-grid"><div><strong><Count value={85} suffix="+"/></strong><span>Happy clients</span></div><div><strong><Count value={150} suffix="+"/></strong><span>Finished projects</span></div><div><strong><Count value={200} suffix="+"/></strong><span>Skilled experts</span></div><div><strong><Count value={96} suffix="%"/></strong><span>Client satisfaction</span></div></div>}

function AboutPage(){return <main className="inner-main"><PageHero kicker="ABOUT CLOUDEMPIRE" title="Ideas deserve" accent="extraordinary execution." description="We’re a global technology partner helping organizations turn complex challenges into clear, human digital experiences."/><section className="page-section about-story"><div className="container split-layout"><Reveal><div className="section-label"><span>WHO WE ARE</span><i/></div><h2>Built on curiosity.<br/><em>Driven by progress.</em></h2></Reveal><Reveal><p className="lead-copy">CloudEmpire is a global IT solutions provider committed to innovation, efficiency, and transformation.</p><p>We combine expertise in cloud computing, enterprise software, AI-driven solutions, and digital infrastructure. Our work helps businesses unlock opportunities, improve agility, and grow with confidence.</p><p>Our mission is to deliver technology that solves today’s challenges while preparing organizations for what comes next.</p></Reveal></div></section><section className="page-section value-section"><div className="container"><div className="section-label"><span>WHAT GUIDES US</span><i/></div><div className="value-grid"><Reveal><Globe2/><h3>Global reach</h3><p>We serve organizations across industries and borders with solutions shaped for their context.</p></Reveal><Reveal><ShieldCheck/><h3>Trusted expertise</h3><p>Strategists, designers, and engineers bring clear thinking to complex technology decisions.</p></Reveal><Reveal><Zap/><h3>Innovation-driven</h3><p>We use emerging technology purposefully, with measurable outcomes in mind.</p></Reveal></div></div></section><section className="page-section about-numbers"><div className="container"><div className="section-label"><span>CLOUDEMPIRE IN NUMBERS</span><i/></div><Stats/></div></section><PageCta title="Let’s move forward, together."/></main>}

function ServiceCard({service,index}){return <Reveal className="service-page-card"><div className="service-page-card-head"><span className="service-glyph">{service.icon}</span><span>{String(index+1).padStart(2,'0')}</span></div><span className="service-category">{service.category}</span><h3>{service.title}</h3><p>{service.description}</p><a href={url(`services/${service.slug}/`)} aria-label={`Explore ${service.title}`}><span>Explore service</span><ArrowUpRight size={19}/></a></Reveal>}
function ServicesPage(){return <main className="inner-main"><PageHero kicker="OUR SERVICES" title="Expertise for" accent="every ambition." description="Explore the full CloudEmpire service catalog, from AI, web, Android, and iOS to the systems and support behind lasting growth."/><section className="page-section"><div className="container"><div className="service-page-intro"><div className="section-label"><span>13 WAYS WE HELP</span><i/></div><p>Start with the outcome you want. We’ll bring the right disciplines together.</p></div><div className="service-page-grid">{services.map((service,i)=><ServiceCard key={service.slug} service={service} index={i}/>)}</div></div></section><PageCta title="The right expertise, together." description="Tell us where you want to go and we’ll help shape the path."/></main>}
function ServiceDetail({service}){const related=services.filter(item=>item.slug!==service.slug).slice(0,3);return <main className="inner-main"><section className="page-hero detail-hero"><div className="container"><a className="breadcrumb" href={url('services/')}>Services <ArrowRight size={14}/> {service.title}</a><div className="section-label"><span>{service.category}</span><i/></div><h1>{service.title}</h1><p>{service.description}</p><a className="button button-primary" href={url('contact/')}>Discuss your project <ArrowUpRight size={17}/></a></div></section><section className="page-section"><div className="container detail-layout"><Reveal><span className="detail-glyph">{service.icon}</span><h2>{service.lead}</h2><p>{service.outcome}</p></Reveal><Reveal className="deliverables"><div className="section-label"><span>WHAT YOU GET</span><i/></div>{service.deliverables.map((item,i)=><div key={item} className="deliverable"><span>{String(i+1).padStart(2,'0')}</span><h3>{item}</h3><Check size={18}/></div>)}</Reveal></div></section><section className="page-section detail-approach"><div className="container"><div className="section-label"><span>HOW WE WORK</span><i/></div><h2>From understanding<br/><em>to lasting impact.</em></h2><div className="approach-grid">{processSteps.slice(0,3).map(step=><div key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.description}</p></div>)}</div><a className="inline-link" href={url('process/')}>See our complete process <ArrowUpRight size={17}/></a></div></section><section className="page-section related-section"><div className="container"><div className="section-label"><span>EXPLORE MORE</span><i/></div><h2>Connected expertise.</h2><div className="related-grid">{related.map(item=><a key={item.slug} href={url(`services/${item.slug}/`)}><span>{item.category}</span><h3>{item.title}</h3><ArrowUpRight size={20}/></a>)}</div></div></section><PageCta title="Make your next move count."/></main>}

function WorkPage(){return <main className="inner-main"><PageHero kicker="SELECTED WORK" title="Proof in the" accent="possibilities." description="Explore recent CloudEmpire work across web development, Salesforce, education, and financial services."/><section className="page-section"><div className="container work-page-grid">{projects.map((project,i)=><Reveal className="case-card" key={project.slug}><div className={`case-art case-${project.theme}`}><span>CLOUDEMPIRE / {String(i+1).padStart(2,'0')}</span><div className="case-shape"><small>{project.category}</small><strong>{project.title}</strong><i>✦</i></div></div><div className="case-copy"><span>{project.category} · {project.location}</span><h2>{project.title}</h2><p>{project.description}</p></div></Reveal>)}</div></section><PageCta title="Your story could be next."/></main>}
function ProcessPage(){return <main className="inner-main"><PageHero kicker="OUR PROCESS" title="Great work happens" accent="together." description="A clear, collaborative path from the first conversation to launch and long-term growth."/><section className="page-section process-page"><div className="container"><div className="section-label"><span>FROM IDEA TO IMPACT</span><i/></div><div className="process-page-list">{processSteps.map(step=><Reveal className="process-page-step" key={step.number}><span>{step.number}</span><div><h2>{step.title}</h2><p>{step.description}</p></div><ArrowUpRight size={26}/></Reveal>)}</div></div></section><PageCta title="Let’s start with a conversation."/></main>}

function BlogCard({article,index}){return <Reveal className="blog-card"><a className={`blog-art blog-art-${index%5} ${article.image?'featured-image':''}`} href={url(`blog/${article.slug}/`)} aria-label={`Read ${article.title}`}>{article.image&&<img className="blog-cover-image" src={asset(article.image)} alt={article.imageAlt||article.title} loading="lazy"/>}<span>THE CLOUDEMPIRE JOURNAL</span><strong>{String(index+1).padStart(2,'0')}</strong><i>✳</i></a><div className="blog-meta">{article.category}<span><Clock3 size={12}/>{article.readTime}</span></div><h2><a href={url(`blog/${article.slug}/`)}>{article.title}</a></h2><p>{article.description}</p><a className="inline-link" href={url(`blog/${article.slug}/`)}>Read article <ArrowUpRight size={16}/></a></Reveal>}
function BlogPage(){return <main className="inner-main"><PageHero kicker="THE CLOUDEMPIRE JOURNAL" title="Ideas worth" accent="sharing." description="Practical perspectives on AI, websites, apps, cloud, design, and digital growth."/><section className="page-section"><div className="container"><div className="blog-index-head"><span>ALL ARTICLES</span><span>{articles.length} INSIGHTS</span></div><div className="blog-page-grid">{articles.map((article,i)=><BlogCard key={article.slug} article={article} index={i}/>)}</div></div></section><PageCta title="Ready to turn ideas into action?"/></main>}
function ArticlePage({article}){const related=articles.filter(item=>item.slug!==article.slug&&item.relatedService===article.relatedService).slice(0,2);if(related.length<2)related.push(...articles.filter(item=>item.slug!==article.slug&&!related.includes(item)).slice(0,2-related.length));return <main className="inner-main"><article><section className="article-hero"><div className="container article-hero-inner"><a className="breadcrumb" href={url('blog/')}>Journal <ArrowRight size={14}/> {article.category}</a><div className="section-label"><span>{article.category}</span><i/></div><h1>{article.title}</h1><p>{article.description}</p><div className="article-byline"><span>CLOUDEMPIRE TEAM</span><span>{new Date(`${article.date}T00:00:00`).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</span><span>{article.readTime}</span></div></div></section>{article.image&&<figure className="article-cover container"><img src={asset(article.image)} alt={article.imageAlt||article.title} loading="eager"/></figure>}<div className="container article-layout"><aside><span>IN THIS ARTICLE</span>{article.sections.map((section,i)=><a key={section.heading} href={`#section-${i+1}`}>{String(i+1).padStart(2,'0')} &nbsp; {section.heading}</a>)}<a href={url('blog/')}>← All articles</a></aside><div className="article-body"><p className="article-intro">{article.intro}</p>{article.sections.map((section,i)=><section key={section.heading} id={`section-${i+1}`}><h2>{section.heading}</h2>{section.paragraphs.map((p,j)=><p key={j}>{p}</p>)}</section>)}<div className="takeaways"><span>KEY TAKEAWAYS</span><ul>{article.takeaways.map(item=><li key={item}><Check size={16}/>{item}</li>)}</ul></div><div className="article-service"><span>RELATED CLOUDEMPIRE SERVICE</span><h3>{services.find(item=>item.slug===article.relatedService)?.title}</h3><a className="inline-link" href={url(`services/${article.relatedService}/`)}>Explore service <ArrowUpRight size={17}/></a></div></div></div></article><section className="page-section article-related"><div className="container"><div className="section-label"><span>KEEP READING</span><i/></div><h2>More useful ideas.</h2><div className="related-grid">{related.map(item=><a key={item.slug} href={url(`blog/${item.slug}/`)}><span>{item.category}</span><h3>{item.title}</h3><ArrowUpRight size={20}/></a>)}</div></div></section></main>}

const faq=[
  ['What services does CloudEmpire offer?','We offer AI-powered analytics, web and mobile development, Salesforce, cybersecurity, cloud migration, automation, e-commerce, SEO, UI/UX, training, consulting, and support.'],
  ['Do you build Android and iOS apps?','Yes. We build Android, iOS, and cross-platform applications, including backend integrations and app-store deployment support.'],
  ['Can you work with our existing systems?','Yes. We can integrate with existing platforms, customize Salesforce, migrate infrastructure, and improve established workflows.'],
  ['Do you provide ongoing support?','Yes. We provide maintenance, monitoring, updates, and optimization after launch.'],
];
function ContactPage(){const[open,setOpen]=useState(0),[formMessage,setFormMessage]=useState('');const submit=e=>{e.preventDefault();const data=new FormData(e.currentTarget);const message=[`Hello CloudEmpire, I'd like to discuss a project.`,`Name: ${data.get('name')||'Not provided'}`,`Email: ${data.get('email')}`,`Phone: ${data.get('phone')||'Not provided'}`,`Service: ${data.get('service')||'Not selected'}`,`Preferred date: ${data.get('date')||'Flexible'}`,`Preferred time: ${data.get('time')||'Flexible'}`,`Project details: ${data.get('message')||'I would like to learn more.'}`].join('\n');window.location.assign(`https://wa.me/919475639634?text=${encodeURIComponent(message)}`);setFormMessage('WhatsApp will open with your message ready. Press Send there to deliver it.');};return <main className="inner-main"><PageHero kicker="CONTACT US" title="Have a big idea?" accent="Let’s make it real." description="Tell us what you’re imagining. We’ll help you find the clearest path from possibility to product." small/><section className="page-section contact-page"><div className="container contact-grid"><Reveal><div className="section-label"><span>LET’S CONNECT</span><i/></div><h2>Start the<br/><em>conversation.</em></h2><p>We’re here to listen, ask useful questions, and build the right next step with you.</p><div className="contact-details"><a href="mailto:contact@cloudempire.tech">contact@cloudempire.tech <ArrowUpRight size={17}/></a><a href="tel:+919475639634">+91 94756 39634 <ArrowUpRight size={17}/></a><a href="https://wa.me/919475639634" target="_blank" rel="noopener noreferrer">Chat on WhatsApp <ArrowUpRight size={17}/></a><span>328, Sahapur Colony, New Alipore<br/>Kolkata 700053, India</span></div><div className="contact-socials" aria-label="CloudEmpire social media"><a href="https://www.instagram.com/cloudempire.tech/" target="_blank" rel="noopener noreferrer" aria-label="CloudEmpire on Instagram"><Instagram size={18}/></a><a href="https://www.facebook.com/profile.php?id=61595421568280" target="_blank" rel="noopener noreferrer" aria-label="CloudEmpire on Facebook"><Facebook size={18}/></a></div></Reveal><Reveal className="form-shell"><div className="form-head"><span>TELL US ABOUT YOUR PROJECT</span><Sparkles size={18}/></div><form onSubmit={submit}><input name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" className="hp-field"/><label htmlFor="name">Your name</label><input id="name" name="name" placeholder="How should we call you?"/><label htmlFor="email">Email address *</label><input id="email" name="email" type="email" placeholder="you@company.com" required/><label htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" placeholder="Your contact number"/><label htmlFor="service">What are you looking for?</label><select id="service" name="service" defaultValue=""><option value="" disabled>Select a service</option>{services.map(service=><option key={service.slug}>{service.title}</option>)}</select><div className="form-row"><div><label htmlFor="date">Preferred date</label><input id="date" name="date" type="date"/></div><div><label htmlFor="time">Preferred time</label><input id="time" name="time" type="time"/></div></div><label htmlFor="message">Tell us about it</label><textarea id="message" name="message" rows="4" placeholder="The idea, the challenge, the big dream..."/><button type="submit" className="button button-primary">Continue in WhatsApp <ArrowUpRight size={18}/></button><p className="form-note" role="status">{formMessage||'Only email is required. Your inquiry is saved for follow-up, then WhatsApp opens with a message ready to send.'}</p></form></Reveal></div></section><section className="page-section contact-faq"><div className="container faq-layout"><div><div className="section-label"><span>GOOD TO KNOW</span><i/></div><h2>Frequently asked<br/><em>questions.</em></h2></div><div className="faq-list">{faq.map(([q,a],i)=><div className={`faq-item ${open===i?'open':''}`} key={q}><button onClick={()=>setOpen(open===i?-1:i)} aria-expanded={open===i}><span>{q}</span><ChevronDown size={19}/></button>{open===i&&<p>{a}</p>}</div>)}</div></div></section></main>}
function NotFound(){return <main className="inner-main"><PageHero kicker="PAGE NOT FOUND" title="This page took" accent="another path." description="The page you’re looking for isn’t here. Let’s get you back to something useful." small/><div className="container not-found-links"><a className="button button-primary" href={url('')}>Back to home <ArrowUpRight size={17}/></a><a className="button button-outline" href={url('services/')}>Explore services <ArrowRight size={17}/></a></div></main>}

function ScrollAnimations(){
  useEffect(()=>{
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const selector='.inner-main .page-hero .section-label, .inner-main .page-hero h1, .inner-main .page-hero p, .inner-main .article-hero .section-label, .inner-main .article-hero h1, .inner-main .article-hero p, .inner-main .page-section > .container > .section-label, .inner-main .page-section > .container > h2, .inner-main .page-cta .container > *, .inner-main .approach-grid > *, .inner-main .related-grid > *, .inner-main .stats-grid > *, .inner-main .deliverable, .inner-main .article-body section, .multi-footer .footer-invite > *, .multi-footer .footer-directory > *';
    const targets=[...document.querySelectorAll(selector)];
    for(const target of targets){
      target.classList.add('scroll-enter');
      target.style.setProperty('--stagger',`${Math.min([...target.parentElement.children].indexOf(target)%5,4)*80}ms`);
    }
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('entered');observer.unobserve(entry.target);}
    },{threshold:.12,rootMargin:'0px 0px -4% 0px'});
    targets.forEach(target=>observer.observe(target));
    const check=()=>{for(const target of targets){if(target.classList.contains('entered'))continue;const rect=target.getBoundingClientRect();if(rect.bottom>0&&rect.top<window.innerHeight*.94){target.classList.add('entered');observer.unobserve(target);}}};
    window.addEventListener('scroll',check,{passive:true});
    window.addEventListener('resize',check);
    check();
    return()=>{observer.disconnect();window.removeEventListener('scroll',check);window.removeEventListener('resize',check);};
  },[]);
  return null;
}

function App(){let page;if(route.length===0)page=<Home/>;else if(route[0]==='about'&&route.length===1)page=<AboutPage/>;else if(route[0]==='services'&&route.length===1)page=<ServicesPage/>;else if(route[0]==='services'&&route.length===2)page=services.find(item=>item.slug===route[1])?<ServiceDetail service={services.find(item=>item.slug===route[1])}/>:<NotFound/>;else if(route[0]==='work'&&route.length===1)page=<WorkPage/>;else if(route[0]==='process'&&route.length===1)page=<ProcessPage/>;else if(route[0]==='blog'&&route.length===1)page=<BlogPage/>;else if(route[0]==='blog'&&route.length===2)page=articles.find(item=>item.slug===route[1])?<ArticlePage article={articles.find(item=>item.slug===route[1])}/>:<NotFound/>;else if(route[0]==='contact'&&route.length===1)page=<ContactPage/>;else page=<NotFound/>;return <><Header/>{page}<Footer/><ScrollAnimations/></>}

const root=createRoot(document.getElementById('root'));
const render=()=>root.render(<App/>);
if(window.__CLOUDEMPIRE_CONTENT__){applyContent(window.__CLOUDEMPIRE_CONTENT__);render();}
else if(siteRoot==='/'){fetch('/api/site-content.php',{cache:'no-store'}).then(response=>response.ok?response.json():null).then(result=>applyContent(result?.content)).catch(()=>{}).finally(render);}
else render();
