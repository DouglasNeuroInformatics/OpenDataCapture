import { beforeEach, describe, expect, it } from 'bun:test';
import fs from 'fs/promises';
import module from 'module';
import path from 'path';
import url from 'url';

import { InstrumentTransformer } from '../index.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = module.createRequire(__dirname);

const loadSource = (id: string) => fs.readFile(require.resolve(id), 'utf-8');

const sources = {
  clickTask: await loadSource('@open-data-capture/instrument-library/interactive/click-task.tsx'),
  happinessQuestionnaire: await loadSource('@open-data-capture/instrument-library/forms/happiness-questionnaire.ts')
};

describe('InstrumentTransformer', () => {
  let transformer: InstrumentTransformer;

  beforeEach(() => {
    transformer = new InstrumentTransformer();
  });

  describe('generateBundle', () => {
    it('should successfully transpile the click task', async () => {
      expect(transformer.generateBundle(sources.clickTask)).resolves.toBeString();
    });
    it('should successfully transpile the happiness questionnaire', async () => {
      expect(transformer.generateBundle(sources.happinessQuestionnaire)).resolves.toBeString();
    });
    it("should include the same number of substrings 'React*'", async () => {
      const source = sources.clickTask;
      const regex = /\bReact\w*/;
      const sourceMatches = source.match(regex)?.length ?? 0;
      expect(sourceMatches).toBePositive();
      const bundle = await transformer.generateBundle(source);
      const bundleMatches = bundle.match(regex)?.length ?? 0;
      expect(bundleMatches).toBe(sourceMatches);
    });
    it('should reject source including a static import', () => {
      const source = ["import _ from 'lodash';", sources.happinessQuestionnaire].join('\n');
      expect(transformer.generateBundle(source)).rejects.toThrow();
    });
    it('should reject source including a require statement', () => {
      const source = ["const _ = require('lodash');", sources.happinessQuestionnaire].join('\n');
      expect(transformer.generateBundle(source)).rejects.toThrow();
    });
    it('should reject source including a named export', () => {
      const source = [sources.happinessQuestionnaire, 'export const __foo__ = 5'].join('\n');
      expect(transformer.generateBundle(source)).rejects.toThrow();
    });
    it('should reject source including multiple default exports', () => {
      const source = [sources.happinessQuestionnaire, 'export default __foo__ = 5'].join('\n');
      expect(transformer.generateBundle(source)).rejects.toThrow();
    });
  });
});
