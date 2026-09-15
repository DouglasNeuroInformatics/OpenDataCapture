import { describe, expect, it } from 'vitest';

import { $UpdateGroupData } from './group.js';

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
      expectedUpdatedAt: '2024-01-01'
    });
    expect(result.success).toBe(true);
  });
  it('should accept an update that omits emailTemplates entirely', () => {
    expect($UpdateGroupData.safeParse({ name: 'New Name' }).success).toBe(true);
  });
});
