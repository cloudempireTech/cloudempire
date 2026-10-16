import { articles, services } from './content.mjs';
import seoPages from './seo-pages.json' with { type: 'json' };

export const siteUrl = process.env.SITE_URL || 'https://cloudempire.tech/';
export const siteBase = process.env.SITE_BASE || '/';
export const isPreview = siteBase !== '/';

export const routePaths = [
  ['about'], ['services'],
  ...services.map(item=>['services',item.slug]),
  ['work'], ['process'], ['blog'],
  ...articles.map(item=>['blog',item.slug]),
  ['contact'],
];

export function pageInfo(route=[]) {
  const path=route.join('/');
  const service=route[0]==='services'&&route.length===2 ? services.find(item=>item.slug===route[1]) : null;
  const article=route[0]==='blog'&&route.length===2 ? articles.find(item=>item.slug===route[1]) : null;
  const staticSeo=seoPages[path] || seoPages[route[0]] || seoPages[''];
  const title=article ? `${article.title} | CloudEmpire Blog` : service ? (service.seoTitle || `${service.title} | CloudEmpire Services`) : staticSeo.title;
  const description=article?.description || service?.seoDescription || service?.description || staticSeo.description;
  const canonical=`${siteUrl}${path ? `${path}/` : ''}`;
  const cover=article?.image ? (/^https?:\/\//.test(article.image) ? article.image : article.image.startsWith('api/media.php?') ? `https://cloudempire.tech/${article.image}` : `${siteUrl}${article.image}`) : null;
  return {path,title,description,canonical,service,article,cover};
}

export function pageSchema(page) {
  const organizationId=`${siteUrl}#organization`;
  const webpageId=`${page.canonical}#webpage`;
  const graph=[
    {'@type':'Organization','@id':organizationId,name:'CloudEmpire',url:siteUrl,logo:`${siteUrl}favicon-192.png`,email:'contact@cloudempire.tech',telephone:'+91-94756-39634',address:{'@type':'PostalAddress',streetAddress:'328, Sahapur Colony, New Alipore',addressLocality:'Kolkata',postalCode:'700053',addressRegion:'West Bengal',addressCountry:'IN'},sameAs:['https://www.instagram.com/cloudempire.tech/','https://www.facebook.com/profile.php?id=61595421568280']},
    {'@type':'WebSite','@id':`${siteUrl}#website`,name:'CloudEmpire',url:siteUrl,publisher:{'@id':organizationId},inLanguage:'en'},
    {'@type':'WebPage','@id':webpageId,name:page.title,description:page.description,url:page.canonical,isPartOf:{'@id':`${siteUrl}#website`},inLanguage:'en'},
  ];
  if(page.path){
    const items=[{name:'Home',item:siteUrl}];
    if(page.service)items.push({name:'Services',item:`${siteUrl}services/`});
    if(page.article)items.push({name:'Blog',item:`${siteUrl}blog/`});
    items.push({name:page.service?.title||page.article?.title||page.title,item:page.canonical});
    graph.push({'@type':'BreadcrumbList','@id':`${page.canonical}#breadcrumbs`,itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,...item}))});
  }
  if(page.service)graph.push({'@type':'Service','@id':`${page.canonical}#service`,name:page.service.title,description:page.service.description,url:page.canonical,provider:{'@id':organizationId}});
  if(page.article)graph.push({'@type':'BlogPosting','@id':`${page.canonical}#article`,headline:page.article.title,description:page.description,datePublished:page.article.date,dateModified:page.article.date,mainEntityOfPage:{'@id':webpageId},author:{'@id':organizationId},publisher:{'@id':organizationId},...(page.cover?{image:page.cover}:{})});
  return {'@context':'https://schema.org','@graph':graph};
}
