import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowRight, ArrowUpRight, BrainCircuit, Check, ChevronDown, Code2, Database, Globe2, Layers3, Menu, ShieldCheck, Smartphone, Sparkles, X, Zap } from 'lucide-react';
import './styles.css';

const assetUrl = name => `${import.meta.env.BASE_URL}${name}`;

const serviceGroups = [
  { title: 'AI & intelligence', icon: BrainCircuit, description: 'Turn data into decisive action with intelligent products, analytics, and automation.', items: ['AI-Powered Analytics', 'Business Process Automation'], url: 'ai-analytics' },
  { title: 'Web experiences', icon: Globe2, description: 'Fast, distinctive digital experiences built to move your business forward.', items: ['Web Design & Development', 'E-Commerce Development', 'Search Engine Optimization', 'UI/UX Design & Research'], url: 'web-development' },
  { title: 'Android & iOS', icon: Smartphone, description: 'Thoughtful mobile apps that feel at home on every device and scale with demand.', items: ['Mobile App Development'], url: 'app-development' },
  { title: 'Cloud & enterprise', icon: Database, description: 'The resilient foundation behind ambitious ideas and growing organizations.', items: ['Cloud Infrastructure & Migration', 'Salesforce CRM Solutions', 'IT Strategy & Consulting'], url: 'cloud-solutions' },
  { title: 'Security & support', icon: ShieldCheck, description: 'Keep your systems protected, reliable, and ready for what comes next.', items: ['Cybersecurity Solutions', 'Maintenance & Support'], url: 'cyber-security' },
  { title: 'People & capability', icon: Layers3, description: 'Equip teams with the skills and support to make transformation last.', items: ['Corporate Training & Skill Development'], url: 'training' },
];

const features = [
  { number: '01', tag: 'ARTIFICIAL INTELLIGENCE', title: <>Intelligence,<br /><em>built in.</em></>, description: 'From predictive insight to useful automation, we make AI work in the real world — for your team and your customers.', bullets: ['AI-powered analytics', 'Intelligent workflows', 'Human-centered outcomes'], type: 'ai' },
  { number: '02', tag: 'WEB EXPERIENCES', title: <>The web,<br /><em>reimagined.</em></>, description: 'Expressive websites and powerful platforms, engineered for speed, clarity, and the moments that matter.', bullets: ['Brand-led design', 'Fast, scalable builds', 'Conversion-focused UX'], type: 'web' },
  { number: '03', tag: 'ANDROID APPS', title: <>Made for<br /><em>every moment.</em></>, description: 'Native-feeling Android experiences built to be effortless in the hand and dependable behind the scenes.', bullets: ['Purposeful interactions', 'Performance at scale', 'Seamless integrations'], type: 'android' },
  { number: '04', tag: 'iOS APPS', title: <>A little more<br /><em>extraordinary.</em></>, description: 'Elegant iPhone experiences that combine considered design with robust engineering.', bullets: ['Intuitive journeys', 'Beautiful interface systems', 'Built for longevity'], type: 'ios' },
];

const projects = [
  { category: 'WEB PLATFORM', name: 'A better campus experience.', description: 'A tailored web application simplifying academic management and student engagement for U.S. universities.', className: 'campus', number: '01', link: 'portfolio.php' },
  { category: 'SALESFORCE APP', name: 'Campaigns, simplified.', description: 'A custom Salesforce Marketing Cloud app designed to make campaign creation and delivery easier.', className: 'campaign', number: '02', link: 'portfolio.php' },
  { category: 'ENTERPRISE SYSTEM', name: 'Smarter lending journeys.', description: 'An education loan management system for Australian institutions, from applications to compliance.', className: 'lending', number: '03', link: 'portfolio.php' },
  { category: 'IN PROGRESS', name: 'Finance without friction.', description: 'A Salesforce-based platform streamlining the lending lifecycle, from origination to repayment.', className: 'finance', number: '04', link: 'portfolio.php' },
];

const process = [
  ['01', 'Discovery', 'We listen, explore your goals, and find the real opportunity.'],
  ['02', 'Strategy', 'We shape a clear roadmap around your business and users.'],
  ['03', 'Development', 'We turn the plan into a purposeful digital product.'],
  ['04', 'Testing', 'We refine and validate performance, security, and stability.'],
  ['05', 'Launch', 'We deploy your solution with care and confidence.'],
  ['06', 'Support', 'We keep improving, optimizing, and moving forward together.'],
];

const journal = [
  { category: 'SALESFORCE', date: '25 OCT 2025', title: 'Salesforce 101: A Practical Guide for SMBs in 2025', href: 'https://cloudempire.tech/blog-details.php?slug=salesforce-101-a-practical-guide-for-smbs-in-2025' },
  { category: 'DEVOPS', date: '16 OCT 2025', title: 'DevOps in 2025 — Building a Culture of Continuous Delivery', href: 'https://cloudempire.tech/blog-details.php?slug=devops-in-2025-building-a-culture-of-continuous-delivery' },
  { category: 'WEB DEVELOPMENT', date: '16 OCT 2025', title: 'Web Development in 2025 — Building Smarter, Faster, and Scalable Apps', href: 'https://cloudempire.tech/blog-details.php?slug=web-development-in-2025-building-smarter-faster-and-scalable-apps' },
];

const faqs = [
  ['What can CloudEmpire build for my business?', 'We design and develop AI solutions, websites, Android and iOS apps, Salesforce systems, cloud infrastructure, and other digital products tailored to your goals.'],
  ['Where is CloudEmpire located?', 'Our head office is at 328, Sahapur Colony, New Alipore, Kolkata 700053, India.'],
  ['How can I contact CloudEmpire for business inquiries?', 'Email contact@cloudempire.tech or call +91 94756 39634. You can also use the inquiry form below to prepare an email.'],
  ['Do you provide Salesforce customization?', 'Yes. We offer Salesforce customization, integration, and automation to improve CRM workflows.'],
  ['What industries do you serve?', 'Our work spans education, healthcare, retail, finance, and IT enterprises.'],
  ['Can you help with cloud migration?', 'Yes. We help organizations move from legacy infrastructure to modern cloud environments including AWS, Azure, and Google Cloud.'],
  ['Do you offer both Android and iOS development?', 'Yes. We build Android, iOS, and cross-platform mobile experiences with a focus on performance and thoughtful user experience.'],
  ['What makes CloudEmpire different?', 'We combine technical expertise with customer-focused strategy to create solutions tailored to measurable results and long-term growth.'],
  ['Can you work with our existing systems?', 'Absolutely. Our team handles integrations, Salesforce customization, cloud migration, and modernization of existing workflows.'],
  ['Do you support products after launch?', 'Yes. We provide ongoing maintenance, optimization, security, and technical support as your product grows.'],
  ['How can I request a project quote?', 'Share your project details through the contact form or email contact@cloudempire.tech and our team will follow up.'],
  ['Are you hiring or offering internships?', 'Opportunities open periodically. Follow CloudEmpire on LinkedIn for updates.'],
  ['What is CloudEmpire’s mission?', 'We help businesses grow through innovative, secure, and scalable technology that makes digital transformation practical.'],
];

function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

function Count({ value, suffix = '' }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) { setDisplay(value); return; }
      const start = performance.now();
      const duration = 1500;
      const tick = now => {
        const p = Math.min((now - start) / duration, 1);
        setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);
  return <span ref={ref}>{display}{suffix}</span>;
}

function DeviceVisual({ active }) {
  return <div className={`device-world device-${features[active].type}`} aria-label={`${features[active].tag} product illustration`} role="img">
    <div className="world-halo" />
    <div className="world-grid" />
    <div className="visual-label"><span className="live-dot" /> CLOUDEMPIRE / {features[active].tag}</div>
    <div className="device-scene" key={active}>
      {active === 0 && <div className="ai-dashboard">
        <div className="dashboard-top"><span className="mini-mark"><Sparkles size={16}/></span><span>Empire Intelligence</span><span className="status-pill">● &nbsp; Live insights</span></div>
        <div className="dashboard-intro"><small>YOUR INTELLIGENCE OVERVIEW</small><strong>Clarity, at a glance.</strong><span>Good morning. Here’s what your data is telling you.</span></div>
        <div className="ai-chart"><div className="chart-top"><span>Growth forecast</span><strong>+24.8% <ArrowUpRight size={16}/></strong></div><div className="chart-bars">{[34,51,44,63,58,74,65,82,74,92,85,100].map((n,i)=><i key={i} style={{height:`${n}%`}} />)}</div><div className="chart-months"><span>JAN</span><span>MAR</span><span>MAY</span><span>JUL</span><span>SEP</span><span>NOV</span></div></div>
        <div className="ai-insight"><div className="insight-icon"><Sparkles size={17}/></div><div><b>Opportunity detected</b><p>Customer engagement is trending upward. Now is the moment to scale.</p></div></div>
      </div>}
      {active === 1 && <div className="web-browser"><div className="browser-bar"><div className="browser-dots"><i/><i/><i/></div><span>your-next-big-thing.com</span><span>↗</span></div><div className="browser-body"><div className="browser-nav"><b>forma<span>.</span></b><span>Discover &nbsp; &nbsp; Collection &nbsp; &nbsp; About</span><i>Explore <ArrowUpRight size={12}/></i></div><div className="browser-copy"><small>DESIGN FOR LIVING</small><h3>Shape a<br/><em>better everyday.</em></h3><p>Thoughtful spaces begin with beautiful details.</p><span className="browser-button">Explore collection <ArrowUpRight size={12}/></span></div><div className="browser-art"><div className="art-disc"/><div className="art-chair"/><div className="art-shadow"/></div><div className="browser-footer">01 / 04 <span>IMAGINED. DESIGNED. DELIVERED.</span></div></div></div>}
      {active === 2 && <div className="phone-set android-set"><div className="phone phone-back"><div className="phone-camera"/><div className="phone-inner"><div className="app-small-top">YOUR DAY <span>● ● ●</span></div><div className="app-card-gradient"><small>DAILY MOMENTUM</small><strong>Keep moving<br/>forward.</strong><div className="app-ring">78%</div></div><div className="app-list"><span>Today’s activity</span><b>12,480 steps</b></div><div className="mini-progress"><i/></div></div></div><div className="phone phone-front"><div className="phone-camera"/><div className="phone-inner"><div className="app-top"><span>9:41</span><span>◕ ▰</span></div><div className="app-greeting">Good morning, Alex <span>✦</span><h3>Make today<br/><em>count.</em></h3></div><div className="activity-orb"><span>YOUR PROGRESS</span><strong>78%</strong><small>of your daily goal</small></div><div className="app-metrics"><div><small>STEPS</small><b>12,480</b></div><div><small>ACTIVE TIME</small><b>68 min</b></div></div><div className="app-bottom">⌂ <span>◫</span> ◉ <span>☻</span></div></div></div></div>}
      {active === 3 && <div className="phone-set ios-set"><div className="phone phone-back"><div className="phone-camera"/><div className="phone-inner ios-back-inner"><div className="app-top"><span>9:41</span><span>◕ ▰</span></div><p>Discover</p><strong>Find your<br/>next escape.</strong><div className="trip-tile"><span>THE HORIZON COLLECTION</span><b>Somewhere<br/>beautiful.</b></div><small>CURATED FOR YOU</small></div></div><div className="phone phone-front"><div className="phone-camera"/><div className="phone-inner ios-front-inner"><div className="app-top"><span>9:41</span><span>◕ ▰</span></div><div className="ios-sun">✳</div><small>YOUR NEXT CHAPTER</small><h3>Go where<br/>you feel <em>alive.</em></h3><p>Exceptional places. Unforgettable moments. All in your pocket.</p><div className="ios-picture"><div className="mountain one"/><div className="mountain two"/><div className="sun"/></div><div className="ios-cta">Explore the world <ArrowUpRight size={13}/></div></div></div></div>}
    </div>
    <div className="visual-index">{features[active].number} <span>/</span> 04</div>
  </div>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [activeFaq, setActiveFaq] = useState(0);
  const [formMessage, setFormMessage] = useState('');
  const featureRefs = useRef([]);
  const storyCopyRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      if (window.matchMedia('(max-width: 760px)').matches) return;
      const line = window.innerHeight * 0.48;
      let closest = 0, distance = Infinity;
      featureRefs.current.forEach((el, i) => {
        if (!el) return;
        const box = el.getBoundingClientRect();
        const d = Math.abs((box.top + box.height / 2) - line);
        if (d < distance) { distance = d; closest = i; }
      });
      setActive(closest);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const onStoryScroll = () => {
    const el = storyCopyRef.current;
    if (el && window.matchMedia('(max-width: 760px)').matches) setActive(Math.round(el.scrollLeft / el.clientWidth));
  };
  const goToFeature = i => {
    if (window.matchMedia('(max-width: 760px)').matches) storyCopyRef.current?.scrollTo({left: i * storyCopyRef.current.clientWidth, behavior: 'smooth'});
    else featureRefs.current[i]?.scrollIntoView({behavior: 'smooth', block: 'center'});
  };
  const closeMenu = () => setMenuOpen(false);
  const submitContact = e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = encodeURIComponent(`Project inquiry: ${data.get('service') || 'New project'}`);
    const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone')}\nService: ${data.get('service')}\nPreferred date: ${data.get('date')}\nPreferred time: ${data.get('time')}\n\n${data.get('message')}`);
    window.location.href = `mailto:contact@cloudempire.tech?subject=${subject}&body=${body}`;
    setFormMessage('Your email app will open with your message ready to send.');
  };
  return <>
    <header className="site-header">
      <a href="#top" className="brand" aria-label="CloudEmpire home" onClick={closeMenu}><img src={assetUrl('logo-light.png')} alt="CloudEmpire" /></a>
      <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Main navigation">
        <a href="#about" onClick={closeMenu}>About</a><a href="#expertise" onClick={closeMenu}>Expertise</a><a href="#work" onClick={closeMenu}>Work</a><a href="#process" onClick={closeMenu}>Process</a><a href="#insights" onClick={closeMenu}>Insights</a>
      </nav>
      <a className="nav-cta" href="#contact">Let’s talk <ArrowUpRight size={16}/></a>
      <button className="menu-toggle" onClick={()=>setMenuOpen(!menuOpen)} aria-label={menuOpen?'Close menu':'Open menu'} aria-expanded={menuOpen}>{menuOpen?<X size={23}/>:<Menu size={23}/>}</button>
    </header>

    <main id="top">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-noise"/><div className="hero-orb"><div className="orb-core"/><div className="orb-ring ring-one"/><div className="orb-ring ring-two"/><div className="orb-highlight"/></div>
        <div className="hero-content container"><div className="eyebrow"><span className="eyebrow-line"/> DIGITAL EXPERIENCES, ENGINEERED FOR TOMORROW</div><h1 id="hero-title">Build what’s<br/><span>next.</span></h1><p>AI that thinks ahead. Websites that stand apart. Android and iOS apps that feel effortless. We bring ambitious ideas to life.</p><div className="hero-actions"><a className="button button-primary" href="#contact">Start a project <ArrowUpRight size={18}/></a><a className="text-link" href="#expertise">Explore what we do <ArrowRight size={18}/></a></div></div>
        <div className="hero-bottom container"><span>TECHNOLOGY WITH PURPOSE. IMPACT WITHOUT LIMITS.</span><a href="#about" aria-label="Scroll to about"><span>SCROLL TO EXPLORE</span><ArrowDown size={16}/></a></div>
      </section>

      <section className="intro section-pad" id="about"><div className="container intro-grid"><Reveal><div className="section-label"><span>01 / ABOUT US</span><i/></div><h2>Ideas deserve<br/><em>extraordinary</em><br/>execution.</h2></Reveal><Reveal className="intro-right"><p className="large-copy">We are CloudEmpire — a global technology partner turning complex challenges into clear, human digital experiences.</p><p>We combine thoughtful strategy, ambitious design, and dependable engineering across AI, cloud, enterprise software, and digital products. The result is technology that helps organizations move with confidence.</p><a className="inline-link" href="#process">How we work <ArrowUpRight size={17}/></a></Reveal></div><div className="container values"><Reveal><span className="value-icon"><Globe2 size={19}/></span><h3>Global perspective</h3><p>Tailored solutions for organizations across industries and borders.</p></Reveal><Reveal><span className="value-icon"><Zap size={19}/></span><h3>Built for progress</h3><p>Future-ready thinking, grounded in real business outcomes.</p></Reveal><Reveal><span className="value-icon"><Layers3 size={19}/></span><h3>End-to-end partner</h3><p>From the first idea to launch, support, and everything after.</p></Reveal></div></section>

      <section className="showcase" id="expertise"><div className="container showcase-head"><Reveal><div className="section-label"><span>02 / OUR FOCUS</span><i/></div><h2>One partner.<br/><em>Every possibility.</em></h2><p>Four disciplines at the heart of the next generation of digital business. Explore each one below.</p></Reveal></div><div className="container story-grid"><div className="story-copy" ref={storyCopyRef} onScroll={onStoryScroll}>{features.map((feature,i)=><article ref={el=>featureRefs.current[i]=el} className={`story-panel ${active===i?'active':''}`} key={feature.number}><div className="story-number">{feature.number} <span>/</span> 04</div><div className="story-tag">{feature.tag}</div><h3>{feature.title}</h3><p>{feature.description}</p><ul>{feature.bullets.map(b=><li key={b}><Check size={15}/>{b}</li>)}</ul><a href="#contact" className="inline-link">Let’s build it <ArrowUpRight size={17}/></a></article>)}</div><div className="sticky-visual"><DeviceVisual active={active}/><div className="visual-rail">{features.map((f,i)=><button key={f.number} className={i===active?'active':''} onClick={()=>goToFeature(i)} aria-label={`View ${f.tag}`}><span/></button>)}</div></div></div></section>

      <section className="all-services section-pad"><div className="container"><Reveal><div className="section-label"><span>THE COMPLETE PICTURE</span><i/></div><div className="section-title-row"><h2>More ways to<br/><em>make it happen.</em></h2><p>From the foundation beneath your platform to the finishing touches customers remember.</p></div></Reveal><div className="service-grid">{serviceGroups.map((s,i)=><Reveal className="service-card" key={s.title}><div className="service-top"><span className="service-icon"><s.icon size={23} strokeWidth={1.6}/></span><span className="service-num">0{i+1}</span></div><h3>{s.title}</h3><p>{s.description}</p><div className="service-list">{s.items.map(item=><span key={item}>{item}</span>)}</div><a href={`https://cloudempire.tech/service-details.php?slug=${s.url}`} target="_blank" rel="noreferrer" aria-label={`Learn more about ${s.title}`} className="service-arrow"><ArrowUpRight size={19}/></a></Reveal>)}</div></div></section>

      <section className="numbers section-pad"><div className="container"><Reveal><div className="section-label"><span>THE NUMBERS</span><i/></div><h2>Progress you can <em>measure.</em></h2></Reveal><div className="stats-grid"><div><strong><Count value={85} suffix="+"/></strong><span>Happy clients</span></div><div><strong><Count value={150} suffix="+"/></strong><span>Finished projects</span></div><div><strong><Count value={200} suffix="+"/></strong><span>Skilled experts</span></div><div><strong><Count value={96} suffix="%"/></strong><span>Client satisfaction</span></div></div></div></section>

      <section className="work section-pad" id="work"><div className="container"><Reveal><div className="section-label"><span>03 / SELECTED WORK</span><i/></div><div className="section-title-row"><h2>Proof in the<br/><em>possibilities.</em></h2><p>Different challenges. Thoughtful solutions. Here’s a glimpse of what we’re creating with our partners.</p></div></Reveal><div className="project-grid">{projects.map(p=><Reveal className={`project-card ${p.className}`} key={p.number}><div className="project-art"><span className="project-art-label">CLOUDEMPIRE <i/> {p.number}</span>{p.className==='campus'&&<div className="project-ui campus-ui"><div className="ui-sidebar">✳<span>◫</span><span>◎</span><span>▤</span></div><div className="ui-content"><small>UNIVERSITY DASHBOARD</small><h4>Welcome back, Alex.</h4><div className="ui-stats"><span><b>08</b>Current courses</span><span><b>92%</b>On track</span></div><div className="ui-line"/><div className="ui-line short"/></div></div>}{p.className==='campaign'&&<div className="project-ui campaign-ui"><div className="campaign-menu"><span>✦</span> Overview &nbsp; / &nbsp; Campaigns &nbsp; / &nbsp; Audience</div><div className="campaign-card"><small>CAMPAIGN PERFORMANCE</small><strong>86.4%</strong><span>↑ 18.2% this month</span><div className="campaign-graph">▂ ▃ ▄ ▃ ▅ ▆ ▅ ▇ █</div></div></div>}{p.className==='lending'&&<div className="project-ui lending-ui"><span>EDUCATION FINANCE</span><strong>Everything<br/>in one place.</strong><div className="lending-circle">72%<small>COMPLETE</small></div><div className="lending-bars"><i/><i/><i/></div></div>}{p.className==='finance'&&<div className="project-ui finance-ui"><span>EMPIRE FINANCE</span><div className="finance-amount"><small>TOTAL PORTFOLIO</small><strong>$2,485,600</strong><em>+ 12.8% this quarter</em></div><div className="finance-blocks"><i/><i/><i/><i/><i/><i/><i/></div></div>}</div><div className="project-copy"><span>{p.category}</span><a href={`https://cloudempire.tech/${p.link}`} target="_blank" rel="noreferrer" aria-label={`View ${p.name}`}><ArrowUpRight size={19}/></a><h3>{p.name}</h3><p>{p.description}</p></div></Reveal>)}</div><a className="button button-outline" href="https://cloudempire.tech/portfolio.php" target="_blank" rel="noreferrer">Explore all work <ArrowUpRight size={17}/></a></div></section>

      <section className="process section-pad" id="process"><div className="container process-layout"><Reveal><div className="section-label"><span>04 / OUR PROCESS</span><i/></div><h2>Great work<br/>happens <em>together.</em></h2><p>Clear steps. Open conversations. A shared commitment to making the right thing, the right way.</p><a className="inline-link" href="#contact">Tell us your idea <ArrowUpRight size={17}/></a></Reveal><div className="process-steps">{process.map(([n,t,d])=><Reveal className="process-step" key={n}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div><ArrowUpRight size={20}/></Reveal>)}</div></div></section>

      <section className="insights section-pad" id="insights"><div className="container"><Reveal><div className="section-label"><span>05 / INSIGHTS</span><i/></div><div className="section-title-row"><h2>Ideas worth<br/><em>sharing.</em></h2><p>Notes from the edge of technology, design, and the work of building better digital experiences.</p></div></Reveal><div className="journal-grid">{journal.map((j,i)=><Reveal className="journal-card" key={j.href}><div className={`journal-art journal-${i}`}><div className="journal-shape">{i===0?<Database size={44} strokeWidth={1}/>:i===1?<Code2 size={46} strokeWidth={1}/>:<Globe2 size={46} strokeWidth={1}/>}</div><span>THE CLOUDEMPIRE JOURNAL</span></div><div className="journal-meta">{j.category}<span>{j.date}</span></div><h3>{j.title}</h3><a href={j.href} target="_blank" rel="noreferrer">Read article <ArrowUpRight size={16}/></a></Reveal>)}</div></div></section>

      <section className="faq section-pad"><div className="container faq-layout"><Reveal><div className="section-label"><span>GOOD TO KNOW</span><i/></div><h2>Curious?<br/><em>We get it.</em></h2><p>A few answers to help you get started.</p></Reveal><div className="faq-list">{faqs.map(([q,a],i)=><div className={`faq-item ${activeFaq===i?'open':''}`} key={q}><button onClick={()=>setActiveFaq(activeFaq===i?-1:i)} aria-expanded={activeFaq===i}><span>{q}</span><ChevronDown size={19}/></button>{activeFaq===i&&<p>{a}</p>}</div>)}</div></div></section>

      <section className="contact section-pad" id="contact"><div className="contact-glow"/><div className="container contact-grid"><Reveal><div className="section-label"><span>06 / LET’S CONNECT</span><i/></div><h2>Have a big idea?<br/><em>Let’s make it real.</em></h2><p>Tell us what you’re imagining. We’ll help you find the clearest path from possibility to product.</p><div className="contact-details"><a href="mailto:contact@cloudempire.tech">contact@cloudempire.tech <ArrowUpRight size={17}/></a><a href="tel:+919475639634">+91 94756 39634 <ArrowUpRight size={17}/></a><span>328, Sahapur Colony, New Alipore<br/>Kolkata 700053, India</span></div></Reveal><Reveal className="form-shell"><div className="form-head"><span>START A CONVERSATION</span><Sparkles size={18}/></div><form onSubmit={submitContact}><label htmlFor="name">Your name</label><input id="name" name="name" placeholder="How should we call you?"/><label htmlFor="email">Email address *</label><input id="email" name="email" type="email" placeholder="you@company.com" required/><label htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" placeholder="Your contact number"/><label htmlFor="service">What are you looking for?</label><select id="service" name="service" defaultValue=""><option value="" disabled>Select a service</option><option>AI & automation</option><option>Website design & development</option><option>Android app development</option><option>iOS app development</option>{serviceGroups.flatMap(s=>s.items).filter(x=>!['AI-Powered Analytics','Web Design & Development','Mobile App Development'].includes(x)).map(x=><option key={x}>{x}</option>)}</select><div className="form-row"><div><label htmlFor="date">Preferred date</label><input id="date" name="date" type="date"/></div><div><label htmlFor="time">Preferred time</label><input id="time" name="time" type="time"/></div></div><label htmlFor="message">Tell us about it</label><textarea id="message" name="message" rows="3" placeholder="The idea, the challenge, the big dream..."/><button type="submit" className="button button-primary">Send your inquiry <ArrowUpRight size={18}/></button><p className="form-note" role="status">{formMessage || 'Only email is required. This opens your email app with your inquiry ready to send.'}</p></form></Reveal></div></section>
    </main>

    <footer><div className="container footer-top"><div><img src={assetUrl('logo-light.png')} alt="CloudEmpire"/><p>Thoughtful technology.<br/>Extraordinary possibilities.</p></div><div className="footer-links"><div><span>EXPLORE</span><a href="#about">About</a><a href="#expertise">Expertise</a><a href="#work">Work</a><a href="#process">Process</a></div><div><span>CONNECT</span><a href="#contact">Contact</a><a href="mailto:contact@cloudempire.tech">Email us</a><a href="https://www.linkedin.com/company/cloudempire" target="_blank" rel="noreferrer">LinkedIn</a></div></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} CloudEmpire. All rights reserved.</span><a href="#top">Back to top ↑</a></div></footer>
  </>;
}

createRoot(document.getElementById('root')).render(<App/>);
