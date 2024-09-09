import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import type { AstroConfig, AstroIntegrationLogger } from 'astro';
import { Application, PageEvent, ParameterType, RendererEvent, TSConfigReader } from 'typedoc';
import type { Reflection, TypeDocOptions } from 'typedoc';
import type { MarkdownPageEvent, PluginOptions } from 'typedoc-plugin-markdown';

import { StarlightTypeDocLogger } from './logger';
import { addFrontmatter } from './markdown';
import { getStarlightTypeDocOutputDirectory } from './starlight';
import { StarlightTypeDocTheme } from './theme';

import type { StarlightTypeDocOptions } from './index';

const defaultTypeDocConfig: TypeDocConfig = {
  excludeInternal: true,
  excludePrivate: true,
  excludeProtected: true,
  githubPages: false,
  readme: 'none',
  theme: 'starlight-typedoc'
};

const markdownPluginConfig: TypeDocConfig = {
  hideBreadcrumbs: true,
  hidePageHeader: true,
  hidePageTitle: true
};

export async function generateTypeDoc(
  options: StarlightTypeDocOptions,
  config: AstroConfig,
  logger: AstroIntegrationLogger
) {
  const baseOutputDirectory = options.output ?? 'api';
  const outputDirectory = options.locale ? `${options.locale}/${baseOutputDirectory}` : baseOutputDirectory;

  const app = await bootstrapApp(
    options.entryPoints,
    options.tsconfig,
    options.typeDoc,
    outputDirectory,
    options.pagination ?? false,
    config.base,
    logger
  );
  const reflections = await app.convert();

  if (
    (!reflections?.groups || reflections.groups.length === 0) &&
    !reflections?.children?.some((child) => (child.groups ?? []).length > 0)
  ) {
    throw new Error('Failed to generate TypeDoc documentation.');
  }

  const outputPath = path.join(url.fileURLToPath(config.srcDir), 'content/docs', outputDirectory);

  if (options.watch) {
    app.convertAndWatch(async (reflections) => {
      await app.generateDocs(reflections, outputPath);
    });
  } else {
    await app.generateDocs(reflections, outputPath);
  }

  return { baseOutputDirectory, outputDirectory, reflections };
}

async function bootstrapApp(
  entryPoints: TypeDocOptions['entryPoints'],
  tsconfig: TypeDocOptions['tsconfig'],
  config: TypeDocConfig = {},
  outputDirectory: string,
  pagination: boolean,
  base: string,
  logger: AstroIntegrationLogger
) {
  const pagesToRemove: string[] = [];

  const app = await Application.bootstrapWithPlugins({
    ...defaultTypeDocConfig,
    ...markdownPluginConfig,
    ...config,
    entryPoints,
    // typedoc-plugin-markdown must be applied here so that it isn't overwritten by any additional applied plugins
    plugin: [...(config.plugin ?? []), 'typedoc-plugin-markdown'],
    tsconfig
  });
  app.logger = new StarlightTypeDocLogger(logger);
  app.options.addReader(new TSConfigReader());
  // @ts-expect-error - inherited code
  app.renderer.defineTheme('starlight-typedoc', StarlightTypeDocTheme);
  app.renderer.on(PageEvent.BEGIN, (event: PageEvent<Reflection>) => {
    // @ts-expect-error - inherited code
    onRendererPageBegin(event, pagination);
  });
  app.renderer.on(PageEvent.END, (event: PageEvent<Reflection>) => {
    // @ts-expect-error - inherited code
    const shouldRemovePage = onRendererPageEnd(event, pagination);
    if (shouldRemovePage) {
      pagesToRemove.push(event.filename);
    }
  });
  app.renderer.on(RendererEvent.END, () => {
    onRendererEnd(pagesToRemove);
  });
  app.options.addDeclaration({
    defaultValue: getStarlightTypeDocOutputDirectory(outputDirectory, base),
    help: 'The starlight-typedoc output directory containing the generated documentation markdown files relative to the `src/content/docs/` directory.',
    name: 'starlight-typedoc-output',
    type: ParameterType.String
  });

  return app;
}

function onRendererPageBegin(event: MarkdownPageEvent, pagination: boolean) {
  if (event.frontmatter) {
    event.frontmatter.editUrl = false;
    event.frontmatter.next = pagination;
    event.frontmatter.prev = pagination;
    event.frontmatter.title = event.model.name;
  }
}

// Returning `true` will delete the page from the filesystem.
function onRendererPageEnd(event: MarkdownPageEvent, pagination: boolean) {
  if (!event.contents) {
    return false;
  } else if (/^.+[/\\]README\.md$/.test(event.url)) {
    // Do not save `README.md` files for multiple entry points.
    // It is no longer supported in TypeDoc 0.26.0 to call `event.preventDefault()` to prevent the file from being saved.
    // https://github.com/TypeStrong/typedoc/commit/6e6b3b662c92b3d4bc24b6c6c0c6e227e063c759
    // event.preventDefault()
    return true;
  }

  if (!event.frontmatter) {
    event.contents = addFrontmatter(event.contents, {
      editUrl: false,
      next: pagination,
      prev: pagination,
      // Wrap in quotes to prevent issue with special characters in frontmatter
      title: `"${event.model.name}"`
    });
  }

  return false;
}

function onRendererEnd(pagesToRemove: string[]) {
  for (const page of pagesToRemove) {
    fs.rmSync(page, { force: true });
  }
}

export type TypeDocConfig = Partial<Omit<TypeDocOptions, 'entryPoints' | 'tsconfig'> & PluginOptions>;
