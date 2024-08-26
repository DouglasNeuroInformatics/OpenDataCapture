import path from 'node:path';

import type { StarlightPlugin } from '@astrojs/starlight/types';
import { slug } from 'github-slugger';
import { ReferenceReflection, ReflectionKind } from 'typedoc';
import type { DeclarationReflection, ProjectReflection, ReflectionGroup } from 'typedoc';

import type { StarlightTypeDocSidebarOptions } from './index';

const externalLinkRegex = /^(http|ftp)s?:\/\//;

const sidebarDefaultOptions = {
  collapsed: false,
  label: 'API'
} satisfies StarlightTypeDocSidebarOptions;

const starlightTypeDocSidebarGroupLabel = Symbol('StarlightTypeDocSidebarGroupLabel');

export function getSidebarGroupPlaceholder(label = starlightTypeDocSidebarGroupLabel): SidebarGroup {
  return {
    items: [],
    label: label.toString()
  };
}

export function getSidebarFromReflections(
  sidebar: StarlightUserConfigSidebar,
  sidebarGroupPlaceholder: SidebarGroup,
  options: StarlightTypeDocSidebarOptions = {},
  reflections: DeclarationReflection | ProjectReflection,
  baseOutputDirectory: string
): StarlightUserConfigSidebar {
  if (!sidebar || sidebar.length === 0) {
    return sidebar;
  }

  const sidebarGroup = getSidebarGroupFromReflections(options, reflections, baseOutputDirectory, baseOutputDirectory);

  function replaceSidebarGroupPlaceholder(group: SidebarManualGroup): SidebarGroup {
    if (group.label === sidebarGroupPlaceholder.label) {
      return group.badge ? { ...sidebarGroup, badge: group.badge } : sidebarGroup;
    }

    if (isSidebarManualGroup(group)) {
      return {
        ...group,
        items: group.items.map((item) => {
          return isSidebarManualGroup(item) ? replaceSidebarGroupPlaceholder(item) : item;
        })
      };
    }

    return group;
  }

  return sidebar.map((item) => {
    return isSidebarManualGroup(item) ? replaceSidebarGroupPlaceholder(item) : item;
  });
}

function getSidebarGroupFromPackageReflections(
  options: StarlightTypeDocSidebarOptions,
  reflections: DeclarationReflection | ProjectReflection,
  baseOutputDirectory: string
): SidebarGroup {
  const groups = (reflections.children ?? []).map((child) => {
    if (!child.url) {
      return undefined;
    }

    const url = path.parse(child.url);

    return getSidebarGroupFromReflections(
      options,
      child,
      baseOutputDirectory,
      `${baseOutputDirectory}/${url.dir}`,
      child.name
    );
  });

  return {
    collapsed: options.collapsed ?? sidebarDefaultOptions.collapsed,
    items: groups.filter((item): item is SidebarGroup => item !== undefined),
    label: options.label ?? sidebarDefaultOptions.label
  };
}

function getSidebarGroupFromReflections(
  options: StarlightTypeDocSidebarOptions,
  reflections: DeclarationReflection | ProjectReflection,
  baseOutputDirectory: string,
  outputDirectory: string,
  label?: string
): SidebarGroup {
  if ((!reflections.groups || reflections.groups.length === 0) && reflections.children) {
    return getSidebarGroupFromPackageReflections(options, reflections, outputDirectory);
  }

  const groups = reflections.groups ?? [];

  return {
    collapsed: options.collapsed ?? sidebarDefaultOptions.collapsed,
    items: groups
      .flatMap((group) => {
        if (group.title === 'Modules') {
          return group.children.map((child) => {
            if (!child.url) {
              return undefined;
            }

            const url = path.parse(child.url);
            const isParentKindModule = child.parent?.kind === ReflectionKind.Module;

            return getSidebarGroupFromReflections(
              { collapsed: true, label: child.name },
              child as DeclarationReflection,
              baseOutputDirectory,
              `${outputDirectory}/${isParentKindModule ? url.dir.split('/').slice(1).join('/') : url.dir}`
            );
          });
        }

        if (isReferenceReflectionGroup(group)) {
          return getReferencesSidebarGroup(group, baseOutputDirectory);
        }

        const directory = `${outputDirectory}/${slug(group.title.toLowerCase())}`;

        // The groups generated using the `@group` tag do not have an associated directory on disk.
        const isGroupWithDirectory = group.children.some((child) =>
          path.posix.join(baseOutputDirectory, child.url?.replace('\\', '/') ?? '').startsWith(directory)
        );

        if (!isGroupWithDirectory) {
          return undefined;
        }

        return {
          autogenerate: {
            collapsed: true,
            directory
          },
          collapsed: true,
          label: group.title
        };
      })
      .filter((item): item is SidebarGroup => item !== undefined),
    label: label ?? options.label ?? sidebarDefaultOptions.label
  };
}

function getReferencesSidebarGroup(
  group: ReflectionGroup,
  baseOutputDirectory: string
): SidebarManualGroup | undefined {
  const referenceItems: LinkItem[] = group.children
    .map((child) => {
      const reference = child as ReferenceReflection;
      let target = reference.tryGetTargetReflectionDeep();

      if (!target) {
        return undefined;
      }

      if (target.kindOf(ReflectionKind.TypeLiteral) && target.parent) {
        target = target.parent;
      }

      if (!target.url) {
        return undefined;
      }

      return {
        label: reference.name,
        link: getRelativeURL(target.url, getStarlightTypeDocOutputDirectory(baseOutputDirectory))
      };
    })
    .filter((item): item is LinkItem => item !== undefined);

  if (referenceItems.length === 0) {
    return undefined;
  }

  return {
    items: referenceItems,
    label: group.title
  };
}

export function getAsideMarkdown(type: AsideType, title: string, content: string) {
  return `:::${type}[${title}]
${content}
:::`;
}

export function getRelativeURL(url: string, baseUrl: string, pageUrl?: string): string {
  if (externalLinkRegex.test(url)) {
    return url;
  }

  const currentDirname = path.dirname(pageUrl ?? '');
  const urlDirname = path.dirname(url);
  const relativeUrl =
    currentDirname === urlDirname ? url : path.posix.join(currentDirname, path.posix.relative(currentDirname, url));

  const filePath = path.parse(relativeUrl);
  const [, anchor] = filePath.base.split('#');
  const segments = filePath.dir
    .split(/[/\\]/)
    .map((segment) => slug(segment))
    .filter((segment) => segment !== '');

  let constructedUrl = typeof baseUrl === 'string' ? baseUrl : '';
  constructedUrl += segments.length > 0 ? `${segments.join('/')}/` : '';
  constructedUrl += slug(filePath.name);
  constructedUrl += '/';
  constructedUrl += anchor && anchor.length > 0 ? `#${anchor}` : '';

  return constructedUrl;
}

export function getStarlightTypeDocOutputDirectory(outputDirectory: string, base = '') {
  return path.posix.join(base, `/${outputDirectory}${outputDirectory.endsWith('/') ? '' : '/'}`);
}

function isSidebarManualGroup(item: NonNullable<StarlightUserConfigSidebar>[number]): item is SidebarManualGroup {
  return typeof item === 'object' && 'items' in item;
}

function isReferenceReflectionGroup(group: ReflectionGroup) {
  return group.children.every((child) => child instanceof ReferenceReflection);
}

export type SidebarGroup =
  | {
      autogenerate: {
        collapsed?: boolean;
        directory: string;
      };
      collapsed?: boolean;
      label: string;
    }
  | SidebarManualGroup;

type SidebarManualGroup = {
  badge?:
    | {
        text: string;
        variant: 'caution' | 'danger' | 'default' | 'note' | 'success' | 'tip';
      }
    | string
    | undefined;
  collapsed?: boolean;
  items: (LinkItem | SidebarGroup)[];
  label: string;
};

type LinkItem = {
  label: string;
  link: string;
};

type AsideType = 'caution' | 'danger' | 'note' | 'tip';

type StarlightUserConfigSidebar = Parameters<StarlightPlugin['hooks']['setup']>[0]['config']['sidebar'];
