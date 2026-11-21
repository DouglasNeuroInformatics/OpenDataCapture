import { compileCustomFieldPattern } from '@opendatacapture/schemas/subject-identification';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CustomFieldTestBox } from '../CustomFieldTestBox';

import '@/services/i18n';

const renderTestBox = (pattern: null | string = '[A-Z]{2}[0-9]+') => {
  const compiledPattern = pattern === null ? null : compileCustomFieldPattern(pattern);
  render(<CustomFieldTestBox compiledPattern={compiledPattern} idPrefix="test" />);
};

const typeSample = (value: string) => fireEvent.change(screen.getByTestId('test-input'), { target: { value } });

const verdict = () => screen.getByTestId('test-result').dataset.verdict;

describe('CustomFieldTestBox', () => {
  afterEach(cleanup);

  it('should show no result before a value is typed', () => {
    renderTestBox();
    expect(screen.queryByTestId('test-result')).toBeNull();
  });

  it('should show the value as the pattern sees it, uppercased with only letters and digits left', () => {
    renderTestBox();
    typeSample('ab-12 34');
    expect(screen.getByTestId('test-normalized').textContent).toBe('AB1234');
  });

  it('should accept a value whose normalized form the pattern matches in full', () => {
    renderTestBox();
    typeSample('ab-1234');
    expect(verdict()).toBe('accepted');
  });

  it('should reject a value the pattern matches only in part', () => {
    renderTestBox();
    typeSample('ab-1234-x');
    expect(verdict()).toBe('rejected');
  });

  it('should refuse a value with no letters or digits, since the forms refuse it', () => {
    renderTestBox();
    typeSample('- -');
    expect(verdict()).toBe('normalizes-to-nothing');
  });

  it('should refuse a value longer than the forms accept, whatever the pattern says', () => {
    renderTestBox('[A-Z]+');
    typeSample('A'.repeat(201));
    expect(verdict()).toBe('too-long');
  });

  it('should ask for a valid pattern when the field has none to test against', () => {
    renderTestBox(null);
    typeSample('ab-1234');
    expect(verdict()).toBe('no-pattern');
  });
});
