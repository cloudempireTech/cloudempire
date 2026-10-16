import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import Head from 'next/head';

export async function getStaticProps(){
  const template=await readFile(resolve(process.cwd(),'src','admin-template.html'),'utf8');
  const body=template.match(/<body[^>]*>([\s\S]*?)<script type="module"/i)?.[1];
  if(!body)throw new Error('Admin template body was not found');
  return {props:{body}};
}

export default function AdminPage({body}){
  const base=process.env.NEXT_PUBLIC_SITE_BASE||'/';
  return <>
    <Head>
      <title>CloudEmpire Admin</title>
      <meta name="robots" content="noindex,nofollow"/>
      <meta name="referrer" content="no-referrer"/>
    </Head>
    <link rel="stylesheet" href={`${base}admin/admin.css?v=5`}/>
    <link rel="stylesheet" href={`${base}admin/auth.css?v=3`}/>
    <link rel="stylesheet" href={`${base}admin/dashboard.css?v=1`}/>
    <div dangerouslySetInnerHTML={{__html:body}}/>
    <script src={`${base}admin/app.js?v=5`} type="module" defer/>
  </>;
}
