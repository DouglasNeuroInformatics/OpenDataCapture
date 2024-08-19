import type { StarlightConfig, StarlightPlugin } from '@astrojs/starlight/types';
import { createStarlightTypeDocPlugin, type StarlightTypeDocOptions } from 'starlight-typedoc';
import type { Simplify } from 'type-fest';

const [_starlightTypeDoc, typeDocSidebarGroup] = createStarlightTypeDocPlugin();

type SetupOptions = Parameters<StarlightPlugin['hooks']['setup']>[0];
type SidebarItem = Extract<StarlightConfig['sidebar'], any[]>[number];
type ManualSidebarGroup = Simplify<Extract<SidebarItem, { items: any[] }>>;
type AutoSidebarGroup = Simplify<Extract<SidebarItem, { autogenerate: any }>>;

const starlightTypeDoc = (options: StarlightTypeDocOptions): StarlightPlugin => {
  if (!options.sidebar?.label) {
    throw new Error('The sidebar label is mandatory in patched implementation of starlight-typedoc');
  }
  return new Proxy(_starlightTypeDoc({ ...options, output: `en/${options.output}` }), {
    get(target, prop, receiver) {
      if (prop !== 'hooks') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return Reflect.get(target, prop, receiver);
      }
      return {
        async setup(setupOptions: SetupOptions) {
          await target.hooks.setup({
            ...setupOptions,
            updateConfig: (...args) => {
              const sidebarItem = args[0].sidebar!.find((item) => item.label === options.sidebar!.label) as {
                items: AutoSidebarGroup[];
              } & ManualSidebarGroup;
              sidebarItem.items.forEach((subItem) => {
                subItem.autogenerate.directory = subItem.autogenerate.directory.split('/').slice(1).join('/');
              });
              setupOptions.updateConfig(...args);
            }
          });
        }
      };
    }
  });
};

export { starlightTypeDoc, typeDocSidebarGroup };
