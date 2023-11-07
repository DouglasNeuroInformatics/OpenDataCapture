import fs from 'fs';

export function importInstrumentSource(path: string) {
  const filepath = Bun.resolveSync(`@open-data-capture/instruments/${path}`, import.meta.dir);
  return fs.readFileSync(filepath, 'utf-8');
}
