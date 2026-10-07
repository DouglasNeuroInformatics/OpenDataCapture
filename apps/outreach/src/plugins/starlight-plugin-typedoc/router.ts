import { ReflectionKind } from 'typedoc';
import type { Reflection } from 'typedoc';
import { MemberRouter } from 'typedoc-plugin-markdown';

/**
 * typedoc-plugin-markdown's member router places a namespace exported from the project root under a directory
 * named after the project (`@opendatacapture/namespaces/...`), unlike every other root export.
 */
export class StarlightTypeDocRouter extends MemberRouter {
  override getIdealBaseName(reflection: Reflection): string {
    if (reflection.kindOf(ReflectionKind.Namespace) && reflection.parent?.isProject()) {
      return `namespaces/${this.getReflectionAlias(reflection)}/${this.entryFileName}`;
    }
    return super.getIdealBaseName(reflection);
  }
}
