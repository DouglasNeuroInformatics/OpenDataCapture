import { describe, expect, it } from 'vitest';

import { $UpdateGroupData } from '../group.js';

describe('$UpdateGroupData', () => {
  it('should require expectedUpdatedAt when emailTemplates is included', () => {
    const result = $UpdateGroupData.safeParse({
      emailTemplates: [{ body: { en: 'Body' }, id: 'template-1', name: 'Template', subject: { en: 'Subject' } }]
    });
    expect(result.success).toBe(false);
  });
  it('should accept emailTemplates when expectedUpdatedAt is included', () => {
    const result = $UpdateGroupData.safeParse({
      emailTemplates: [{ body: { en: 'Body' }, id: 'template-1', name: 'Template', subject: { en: 'Subject' } }],
      expectedUpdatedAt: '2024-01-01T00:00:00.000Z'
    });
    expect(result.success).toBe(true);
  });
  it('should accept an update that omits emailTemplates entirely', () => {
    expect($UpdateGroupData.safeParse({ name: 'New Name' }).success).toBe(true);
  });
  it.each([null, '2026-01-01T00:00:00.000Z'])(
    'should drop an archivedAt of %o, so a group manager cannot archive or unarchive a group by updating it',
    (archivedAt) => {
      expect($UpdateGroupData.parse({ archivedAt, name: 'New Name' })).not.toHaveProperty('archivedAt');
    }
  );
});
