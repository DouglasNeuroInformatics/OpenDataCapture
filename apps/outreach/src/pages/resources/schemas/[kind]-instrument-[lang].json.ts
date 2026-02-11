import {
  $$AnyInstrument,
  $$FormInstrument,
  $$InteractiveInstrument,
  $$SeriesInstrument
} from '@opendatacapture/schemas/instrument';
import type { APIRoute, GetStaticPaths, InferGetStaticParamsType, InferGetStaticPropsType } from 'astro';
import z from 'zod/v4';

import { getSchemaProps } from '@/lib/instrument-schemas';

type Params = InferGetStaticParamsType<typeof getStaticPaths>;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const getStaticPaths = (() => {
  const schemaFactories = {
    any: $$AnyInstrument,
    form: $$FormInstrument,
    interactive: $$InteractiveInstrument,
    series: $$SeriesInstrument
  } as const;
  return getSchemaProps().map(({ meta, params }) => ({
    params,
    props: { schema: z.toJSONSchema(schemaFactories[params.kind](meta.language)) }
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props, Params> = ({ props }) => {
  return new Response(JSON.stringify(props.schema, null, 2));
};
