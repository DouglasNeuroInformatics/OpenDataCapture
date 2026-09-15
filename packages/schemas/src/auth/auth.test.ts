import { describe, expect, it } from 'vitest';

import { $LoginCredentials } from './auth.js';

describe('$LoginCredentials', () => {
  it('should accept a non-empty username and password', () => {
    expect($LoginCredentials.safeParse({ password: 'hunter2', username: 'admin' }).success).toBe(true);
  });
  it('should reject an empty username', () => {
    expect($LoginCredentials.safeParse({ password: 'hunter2', username: '' }).success).toBe(false);
  });
  it('should reject an empty password', () => {
    expect($LoginCredentials.safeParse({ password: '', username: 'admin' }).success).toBe(false);
  });
});
