import NextSitePage from '../src/NextSitePage.jsx';
import { isPreview, pageInfo, pageSchema } from '../src/next-seo.mjs';

export async function getStaticProps() {
  const page=pageInfo([]);
  return {props:{route:[],page,schema:pageSchema(page),preview:isPreview}};
}

export default NextSitePage;
