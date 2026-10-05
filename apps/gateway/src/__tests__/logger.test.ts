import { afterEach, describe, expect, it, vi } from 'vitest';

import { logger } from '../logger';

describe('logger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should write each entry to stdout as indented JSON on its own line, so logs are readable in a terminal', () => {
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    logger.info('hello');
    const output = write.mock.calls[0]![0];
    expect(output).toMatch(/^\{\n {2}"level": 30,\n[\s\S]*\n\}\n$/);
    expect(JSON.parse(String(output))).toMatchObject({ level: 30, msg: 'hello' });
  });
});
