import { describe, expect, it } from 'vitest';

import { $AuditLogsQueryParams, AUDIT_LOGS_MAX_PAGE_SIZE, AUDIT_LOGS_PAGE_SIZE } from '../audit.js';

describe('$AuditLogsQueryParams', () => {
  it('should read the page and limit from their query string form', () => {
    expect($AuditLogsQueryParams.parse({ limit: '25', page: '3' })).toMatchObject({ limit: 25, page: 3 });
  });

  it('should default to the first page of the standard size, newest first', () => {
    expect($AuditLogsQueryParams.parse({})).toEqual({ limit: AUDIT_LOGS_PAGE_SIZE, page: 1, sortOrder: 'desc' });
  });

  it.each(['', 'ten', '0', '-1', '1.5', String(AUDIT_LOGS_MAX_PAGE_SIZE + 1)])(
    'should reject %j as the limit, rather than read it as some other size',
    (limit) => {
      expect($AuditLogsQueryParams.safeParse({ limit }).success).toBe(false);
    }
  );

  it('should accept the largest limit', () => {
    expect($AuditLogsQueryParams.parse({ limit: String(AUDIT_LOGS_MAX_PAGE_SIZE) }).limit).toBe(
      AUDIT_LOGS_MAX_PAGE_SIZE
    );
  });

  it.each(['', 'two', '0', '-1', '1.5'])(
    'should reject %j as the page, rather than read it as some other page',
    (page) => {
      expect($AuditLogsQueryParams.safeParse({ page }).success).toBe(false);
    }
  );
});
