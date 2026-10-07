import type { DynamicModule, Provider } from '@nestjs/common';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';

import { InstrumentsModule } from '../instruments.module';

import type { InstrumentVirtualizationContext } from '../instruments.service';

/** The context `InstrumentsModule` hands `VirtualizationModule`, read back from the module metadata. */
function getVirtualizationContext(): InstrumentVirtualizationContext {
  const [virtualizationModule] = Reflect.getMetadata(MODULE_METADATA.IMPORTS, InstrumentsModule) as [DynamicModule];
  const optionsProvider = virtualizationModule.providers!.find(
    (provider: Provider) => typeof provider === 'object' && 'useValue' in provider
  ) as { useValue: { context: InstrumentVirtualizationContext } };
  return optionsProvider.useValue.context;
}

describe('InstrumentsModule', () => {
  it('should start with an empty instance cache, so no instrument is served before it is evaluated', () => {
    expect(getVirtualizationContext().instruments.size).toBe(0);
  });

  it('should refuse an import outside the runtime, so an instrument cannot load arbitrary modules', () => {
    expect(() => getVirtualizationContext().__resolveImport('node:fs')).toThrowError(
      'Unexpected non-runtime import: node:fs'
    );
  });

  // Known defect (#1653): the `development` target of `#runtime/v1/*` in apps/api/package.json is
  // `../../runtime/v1/dist/*`, which is not package-relative, so Node rejects it with
  // ERR_INVALID_PACKAGE_TARGET under `--conditions=development`. vitest and worker threads hit it;
  // the `pnpm dev` main thread does not, because libnest resolves through swc-node.
  it.fails('should resolve a runtime import to the built runtime, even under the development condition', () => {
    expect(getVirtualizationContext().__resolveImport('/runtime/v1/@opendatacapture/runtime-core/index.js')).toBe(
      new URL('../../../../../runtime/v1/dist/@opendatacapture/runtime-core/index.js', import.meta.url).href
    );
  });
});
