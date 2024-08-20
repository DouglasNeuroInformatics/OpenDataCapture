import { randomBytes } from 'node:crypto';

import type { StarlightPlugin } from '@astrojs/starlight/types';
import type { TypeDocOptions } from 'typedoc';

import { getSidebarFromReflections, getSidebarGroupPlaceholder, type SidebarGroup } from './starlight';
import { generateTypeDoc, type TypeDocConfig } from './typedoc';

export const typeDocSidebarGroup = getSidebarGroupPlaceholder();

export function starlightTypeDocPlugin(options: StarlightTypeDocOptions): StarlightPlugin {
  return makeStarlightTypeDocPlugin(typeDocSidebarGroup)(options);
}

export function createStarlightTypeDocPlugin(): [plugin: typeof starlightTypeDocPlugin, sidebarGroup: SidebarGroup] {
  const sidebarGroup = getSidebarGroupPlaceholder(Symbol(randomBytes(24).toString('base64url')));

  return [makeStarlightTypeDocPlugin(sidebarGroup), sidebarGroup];
}

function makeStarlightTypeDocPlugin(sidebarGroup: SidebarGroup): (options: StarlightTypeDocOptions) => StarlightPlugin {
  return function starlightTypeDocPlugin(options: StarlightTypeDocOptions) {
    return {
      hooks: {
        async setup({ astroConfig, config, logger, updateConfig }) {
          const { baseOutputDirectory, reflections } = await generateTypeDoc(options, astroConfig, logger);
          const sidebar = getSidebarFromReflections(
            config.sidebar,
            sidebarGroup,
            options.sidebar,
            reflections,
            baseOutputDirectory
          );
          updateConfig({ sidebar });
        }
      },
      name: 'starlight-plugin-typedoc'
    };
  };
}

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

export type StarlightTypeDocSidebarOptions = {
  /**
   * Wheter the generated documentation sidebar group should be collapsed by default.
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
