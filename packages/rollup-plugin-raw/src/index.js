/** @return {import('rollup').Plugin} */
const raw = () => {
  return {
    async load(id) {
      if (id.endsWith('?raw')) {
        const module = await this.load({ id: id.replace('?raw', '') });
        return { code: `export default ${JSON.stringify(module.code)}` };
      }
      return null;
    },
    name: 'raw',
    async resolveId(source, importer) {
      if (source.endsWith('?raw')) {
        const abspath = await this.resolve(source.slice(0, source.length - 4), importer);
        return abspath.id + '?raw';
      }
      return null;
    }
  };
};

export default raw;
