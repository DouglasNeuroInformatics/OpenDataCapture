import { describe, expect, it } from 'vitest';

import { selectLatestEditions } from '../instrument-editions';

const instrument = (id: string, name: string, edition: number) => ({ id, internal: { edition, name } });

describe('selectLatestEditions', () => {
  it('should keep only the highest edition of each instrument, whatever order the editions arrive in', () => {
    const result = selectLatestEditions([
      instrument('hq-2', 'HQ', 2),
      instrument('hq-1', 'HQ', 1),
      instrument('bdi-1', 'BDI', 1)
    ]);
    expect(result.map(({ id }) => id)).toEqual(['hq-2', 'bdi-1']);
  });
});
