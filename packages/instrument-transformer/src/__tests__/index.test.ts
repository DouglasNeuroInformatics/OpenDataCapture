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

  describe('Click Task', () => {
    it('should successfully transpile', async () => {
      expect(transformer.generateBundle(sources.clickTask)).resolves.toBeString();
    });
  });

  describe('Happiness Questionnaire', () => {
    it('should successfully transpile', async () => {
      expect(transformer.generateBundle(sources.happinessQuestionnaire)).resolves.toBeString();
    });
  });
});
