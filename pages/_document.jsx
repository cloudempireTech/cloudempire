import { Html, Head, Main, NextScript } from 'next/document';

export default function CloudEmpireDocument() {
  const base = process.env.NEXT_PUBLIC_SITE_BASE || '/';
  return <Html lang="en"><Head>
    <link rel="icon" type="image/png" href={`${base}favicon-32.png`}/>
    <link rel="preload" href={`${base}fonts/manrope-latin-v20.woff2`} as="font" type="font/woff2" crossOrigin="anonymous" />
    <link rel="preload" href={`${base}fonts/dm-sans-latin-v17.woff2`} as="font" type="font/woff2" crossOrigin="anonymous" />
    <style dangerouslySetInnerHTML={{__html:`@font-face{font-family:'DM Sans';font-style:normal;font-weight:400 700;font-display:swap;src:url('${base}fonts/dm-sans-latin-v17.woff2') format('woff2')}@font-face{font-family:Manrope;font-style:normal;font-weight:400 800;font-display:swap;src:url('${base}fonts/manrope-latin-v20.woff2') format('woff2')}`}} />
  </Head><body><Main/><NextScript/></body></Html>;
}
