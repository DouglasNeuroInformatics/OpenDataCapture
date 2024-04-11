import { describe, expect, it } from 'vitest';

import { $UpdateAssignmentData } from './assignment.js';

describe('$UpdateAssignmentData', () => {
  it('should throw if the data is defined, but the status is not complete', async () => {
    await expect($UpdateAssignmentData.safeParseAsync({ data: [], status: 'EXPIRED' })).resolves.toMatchObject({
      success: false
    });
  });
});
