import type { StarlightPlugin } from '@astrojs/starlight/types';
import type { TypeDocOptions } from 'typedoc';

import { getSidebarFromReflections, getSidebarGroupPlaceholder } from './starlight';
import { generateTypeDoc } from './typedoc';

import type { TypeDocConfig } from './typedoc';

export type StarlightTypeDocSidebarOptions = {
  /**
   * Whether the generated documentation sidebar group should be collapsed by default.
   * Note that nested sidebar groups are always collapsed.
   * @default false
   */
  collapsed?: boolean;
  /**
   * The generated documentation sidebar group label.
   * @default 'API'
   */
  label?: string;
};

export type StarlightTypeDocOptions = {
  /**
   * The path(s) to the entry point(s) to document.
   */
  entryPoints: TypeDocOptions['entryPoints'];
  /**
   * The locale where the documentation should be generated. For example, if you pass 'en', the documentation will be generated
   * relative to `src/content/docs/en/`
   */
  locale?: string;
  /**
   * The output directory containing the generated documentation markdown files relative to the `src/content/docs/`
   * directory.
   * @default 'api'
   */
  output?: string;
  /**
   * Whether the footer should include previous and next page links for the generated documentation.
   * @default false
   */
  pagination?: boolean;
  /**
   * The sidebar configuration for the generated documentation.
   */
  sidebar?: StarlightTypeDocSidebarOptions;
  /**
   * The path to the `tsconfig.json` file to use for the documentation generation.
   */
  tsconfig: TypeDocOptions['tsconfig'];
  /**
   * Additional TypeDoc configuration.
   * @see https://typedoc.org/options
   */
  typeDoc?: TypeDocConfig;
  /**
   * Whether to watch the entry point(s) for changes and regenerate the documentation when needed.
   * @default false
   */
  watch?: boolean;
};

export const starlightTypeDocSidebarGroup = getSidebarGroupPlaceholder();

export function starlightTypeDocPlugin(options: StarlightTypeDocOptions): StarlightPlugin {
  return {
    hooks: {
      async setup({ astroConfig, config, logger, updateConfig }) {
        const { baseOutputDirectory, reflections } = await generateTypeDoc(options, astroConfig, logger);
        const sidebar = getSidebarFromReflections(
          config.sidebar,
          starlightTypeDocSidebarGroup,
          options.sidebar,
          reflections,
          baseOutputDirectory
        );
        updateConfig({ sidebar });
      }
    },
    name: 'starlight-plugin-typedoc'
  };
}
