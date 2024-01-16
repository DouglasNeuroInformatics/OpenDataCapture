/** @return {import('rollup').Plugin} */
const instrument = () => {
  const suffix = '?instrument';
  const removeSuffix = (filename) => filename.slice(0, filename.length - suffix.length);
  return {
    async load(id) {
      if (id.endsWith(suffix)) {
        const module = await this.load({ id: removeSuffix(id) });
        return { code: `export default ${JSON.stringify(module.code)}` };
      }
      return null;
    },
    name: 'instrument',
    async resolveId(source, importer) {
      if (source.endsWith(suffix)) {
        const abspath = await this.resolve(removeSuffix(source), importer);
        return abspath.id + suffix;
      }
      return null;
    }
  };
};

export default instrument;
