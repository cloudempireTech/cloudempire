import Head from 'next/head';
import SiteClient from './SiteClient.jsx';

export default function NextSitePage({route,page, schema, preview}) {
  return <>
    <Head>
      <title>{page.title}</title>
      <meta name="description" content={page.description}/>
      <link rel="canonical" href={page.canonical}/>
      {preview&&<meta name="robots" content="noindex, follow"/>}
      <meta property="og:type" content={page.article?'article':'website'}/>
      <meta property="og:title" content={page.title}/>
      <meta property="og:description" content={page.description}/>
      <meta property="og:url" content={page.canonical}/>
      {page.cover&&<meta property="og:image" content={page.cover}/>}
      <meta name="twitter:card" content={page.cover?'summary_large_image':'summary'}/>
      <meta name="theme-color" content="#050810"/>
      <link rel="icon" type="image/png" sizes="32x32" href={`${process.env.NEXT_PUBLIC_SITE_BASE||'/'}favicon-32.png`}/>
      <link rel="apple-touch-icon" href={`${process.env.NEXT_PUBLIC_SITE_BASE||'/'}favicon-192.png`}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
    </Head>
    <SiteClient route={route}/>
  </>;
}
