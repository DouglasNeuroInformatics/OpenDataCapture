import { format } from 'oxfmt';

import config from '../oxfmt.config.ts';

export async function formatSource(filePath: string, source: string): Promise<string> {
  const { code, errors } = await format(filePath, source, config);
  if (errors.length > 0) {
    throw new Error(`Failed to format '${filePath}': ${errors.map((error) => error.message).join('; ')}`);
  }
  return code;
}
