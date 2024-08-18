import { describe, expect, it } from 'vitest';

import { validatePackageName } from '../utils.js';

describe('validatePackageName', () => {
  it('should fail if the name length is zero', () => {
    expect(validatePackageName('')).toEqual({ issue: 'length must be greater than zero', success: false });
  });

  it('should fail if the name starts with a period', () => {
    expect(validatePackageName('.package')).toEqual({ issue: 'cannot start with a period', success: false });
  });

  it('should fail if the name starts with an underscore', () => {
    expect(validatePackageName('_package')).toEqual({ issue: 'cannot start with an underscore', success: false });
  });

  it('should fail if the name contains leading or trailing spaces', () => {
    expect(validatePackageName(' package')).toEqual({
      issue: 'cannot contain leading or trailing spaces',
      success: false
    });
    expect(validatePackageName('package ')).toEqual({
      issue: 'cannot contain leading or trailing spaces',
      success: false
    });
  });

  it('should fail if the name is blacklisted', () => {
    expect(validatePackageName('node_modules')).toEqual({ issue: 'cannot be blacklisted name', success: false });
    expect(validatePackageName('favicon.ico')).toEqual({ issue: 'cannot be blacklisted name', success: false });
  });

  it('should fail if the name is a node core module', () => {
    // Example with 'fs' which is a core module
    expect(validatePackageName('fs')).toEqual({ issue: 'cannot be node core mode', success: false });
  });

  it('should fail if the name is longer than 214 characters', () => {
    const longName = 'a'.repeat(215);
    expect(validatePackageName(longName)).toEqual({ issue: 'cannot contain more than 214 character', success: false });
  });

  it('should fail if the name contains capital letters', () => {
    expect(validatePackageName('Package')).toEqual({ issue: 'cannot contain capital letters', success: false });
  });

  it('should fail if the name contains special characters', () => {
    expect(validatePackageName('package!')).toEqual({
      issue: 'cannot contain special characters ("~\'!()*")',
      success: false
    });
  });

  it('should fail if the name contains non-URL-friendly characters', () => {
    expect(validatePackageName('package@')).toEqual({
      issue: 'must contain only URL-friendly characters',
      success: false
    });
  });

  it('should pass for valid package names', () => {
    expect(validatePackageName('valid-package')).toEqual({ success: true });
    expect(validatePackageName('@scope/valid-package')).toEqual({ success: true });
  });

  it('should fail for invalid scoped package names', () => {
    expect(validatePackageName('@scope/invalid package')).toEqual({
      issue: 'must contain only URL-friendly characters',
      success: false
    });
  });

  it('should pass for valid scoped package names', () => {
    expect(validatePackageName('@scope/valid')).toEqual({ success: true });
  });
});
