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

  // Vitest runs its workers under the `development` condition, whose workspace-relative target Node rejects
  // (`pnpm dev` resolves it through swc-node's tsconfig `paths` instead), so the specifier Node receives is
  // observable here only through the error naming the subpath import it was looked up as.
  it('should resolve a runtime import through the api #runtime subpath import', () => {
    expect(() =>
      getVirtualizationContext().__resolveImport('/runtime/v1/@opendatacapture/runtime-core/index.js')
    ).toThrowError("'#runtime/v1/*'");
  });
});
