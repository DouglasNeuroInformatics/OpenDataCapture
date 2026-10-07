import type { StarlightPlugin } from '@astrojs/starlight/types';
import type { TypeDocOptions } from 'typedoc';

import { getSidebarFromReflections, getSidebarGroupPlaceholder } from './starlight';
import { generateTypeDoc } from './typedoc';

export type StarlightTypeDocSidebarOptions = {
  /**
   * Whether the generated documentation sidebar group should be collapsed by default.
   * Note that nested sidebar groups are always collapsed.
   */
  collapsed: boolean;
  /**
   * The generated documentation sidebar group label.
   */
  label: string;
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
  locale: string;
  /**
   * The output directory containing the generated documentation markdown files relative to the `src/content/docs/`
   * directory.
   */
  output: string;
  /**
   * The sidebar configuration for the generated documentation.
   */
  sidebar: StarlightTypeDocSidebarOptions;
  /**
   * The path to the `tsconfig.json` file to use for the documentation generation.
   */
  tsconfig: TypeDocOptions['tsconfig'];
};

export const starlightTypeDocSidebarGroup = getSidebarGroupPlaceholder();

export function starlightTypeDocPlugin(options: StarlightTypeDocOptions): StarlightPlugin {
  return {
    hooks: {
      async setup({ astroConfig, config, logger, updateConfig }) {
        const { baseOutputDirectory, pageUrls, reflections } = await generateTypeDoc(options, astroConfig, logger);
        const sidebar = getSidebarFromReflections(
          config.sidebar,
          starlightTypeDocSidebarGroup,
          options.sidebar,
          reflections,
          pageUrls,
          baseOutputDirectory
        );
        updateConfig({ sidebar });
      }
    },
    name: 'starlight-plugin-typedoc'
  };
}
