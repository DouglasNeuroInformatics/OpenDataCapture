import * as url from 'node:url';

import { generateMetadata, RUNTIME_VERSIONS } from '@opendatacapture/runtime-meta';
import type { APIRoute, GetStaticPaths, InferGetStaticParamsType, InferGetStaticPropsType } from 'astro';
import * as Astro from 'astro:config/server';

type Params = InferGetStaticParamsType<typeof getStaticPaths>;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const getStaticPaths = (async () => {
  const metadata = await generateMetadata({ rootDir: url.fileURLToPath(Astro.root) });
  return RUNTIME_VERSIONS.map((version) => {
    const entry = metadata.get(version);
    return {
      params: {
        version
      },
      props: {
        packages: entry!.packages
      }
    };
  });
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props, Params> = ({ props }) => {
  return new Response(JSON.stringify(props, null, 2));
};
