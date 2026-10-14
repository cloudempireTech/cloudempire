import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';

const featureTypes = ['ai','web','android','ios'];
const featureTags = ['ARTIFICIAL INTELLIGENCE','WEB EXPERIENCES','ANDROID APPS','iOS APPS'];
const featureNumbers = ['01','02','03','04'];

export function DeviceVisual({ active }) {
  return <div className={`device-world device-${featureTypes[active]}`} aria-label={`${featureTags[active]} product illustration`} role="img">
    <div className="world-halo" />
    <div className="world-grid" />
    <div className="visual-label"><span className="live-dot" /> CLOUDEMPIRE / {featureTags[active]}</div>
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
    <div className="visual-index">{featureNumbers[active]} <span>/</span> 04</div>
  </div>;
}
