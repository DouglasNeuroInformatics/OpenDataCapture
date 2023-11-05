export function generateBundle(source: string) {
  const transpiler = new Bun.Transpiler({
    deadCodeElimination: false,
    loader: 'tsx',
    minifyWhitespace: true,
    target: 'browser'
  });

  // Throw an error if the source code contains any imports or non-default exports
  const { exports, imports } = transpiler.scan(source);
  if (imports.length > 0) {
    throw new Error(`Unexpected import token '${imports[0]!.kind}' with path '${imports[0]!.path}'`);
  } else if (exports.length !== 1 || exports[0] !== 'default') {
    throw new Error(
      `Unexpected non-default exports: ${exports
        .filter((s) => s !== 'default')
        .map((s) => `'${s}'`)
        .join(', ')}`
    );
  }

  let output = source;
  output = output.replace('export default', 'const __instrument__ =');
  output = `(({ z }) => {
        ${output}
        return __instrument__
      })`;
  output = transpiler.transformSync(output);
  return output;
}

export async function resolveInstrumentSource(path: string) {
  const filepath = Bun.resolveSync(`@open-data-capture/instruments/${path}`, import.meta.dir);
  const file = Bun.file(filepath);
  return file.text();
}
