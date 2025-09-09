import { $InstrumentKind } from '@opendatacapture/schemas/instrument';
import { capitalize } from 'lodash-es';

import { $InstrumentCategory } from '@/models/instrument-repository.model';
import type { InstrumentRepository } from '@/models/instrument-repository.model';
import { loadAssetAsBase64 } from '@/utils/load';

// Instruments in development
const EXCLUDED_LABELS: string[] = [];

const textFiles: { [key: string]: string } = import.meta.glob('./**/*.{css,js,jsx,json,ts,tsx,svg,html}', {
  eager: true,
  import: 'default',
  query: '?raw'
});

const binaryFiles: { [key: string]: string } = import.meta.glob('./**/*.{jpg,jpeg,png,webp,mp4,mp3}', {
  eager: true,
  import: 'default',
  query: '?url'
});

for (const filepath in binaryFiles) {
  binaryFiles[filepath] = await loadAssetAsBase64(binaryFiles[filepath]!);
}

const defaultInstruments: InstrumentRepository[] = [];
for (const [filename, content] of Object.entries({ ...binaryFiles, ...textFiles })) {
  const segments = filename.split('/').filter(Boolean);
  const category = await $InstrumentCategory.parseAsync(capitalize(segments[1]));
  const kind = await $InstrumentKind.parseAsync(segments[2]!.toUpperCase());
  const label = segments[3]!.replaceAll('-', ' ');
  const name = segments.slice(4, segments.length).join('/');

  if (EXCLUDED_LABELS.includes(label)) {
    continue;
  }

  let instrument = defaultInstruments.find((instrument) => {
    return instrument.category === category && instrument.kind === kind && instrument.label === label;
  });
  if (!instrument) {
    instrument = { category, files: [], id: crypto.randomUUID(), kind, label };
    defaultInstruments.push(instrument);
  }
  instrument.files.push({
    content,
    name
  });
}

export const defaultSelectedInstrument = defaultInstruments.find((item) => item.label === 'Unilingual Form')!;

export { defaultInstruments };
