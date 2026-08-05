/**
 * A bundle imports a runtime module by its served URL, so the specifiers it contains are the ones its
 * source asked for. The JSX runtime is a separate module and is exempt: elements cross module
 * instances freely, whereas a hook only reaches the React instance whose dispatcher owns the render.
 */
const REACT_MODULE_PATTERN = /["'](\/runtime\/v1\/react(?:-dom)?@[^"'/]+(\/[^"']*)?)["']/g;

const JSX_RUNTIME_SUBPATHS = new Set(['/jsx-dev-runtime', '/jsx-dev-runtime.js', '/jsx-runtime', '/jsx-runtime.js']);

/** Returns the first React module the bundle imports for anything other than JSX, if there is one */
export function findReactImport(bundle: string): null | string {
  for (const [, specifier, subpath] of bundle.matchAll(REACT_MODULE_PATTERN)) {
    if (!subpath || !JSX_RUNTIME_SUBPATHS.has(subpath)) {
      return specifier!;
    }
  }
  return null;
}
