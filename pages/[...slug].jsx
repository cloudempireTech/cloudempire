import NextSitePage from '../src/NextSitePage.jsx';
import { isPreview, pageInfo, pageSchema, routePaths } from '../src/next-seo.mjs';

export async function getStaticPaths(){
  return {paths:routePaths.map(slug=>({params:{slug}})),fallback:false};
}

export async function getStaticProps({params}){
  const route=params.slug;
  const page=pageInfo(route);
  return {props:{route,page,schema:pageSchema(page),preview:isPreview}};
}

export default NextSitePage;
