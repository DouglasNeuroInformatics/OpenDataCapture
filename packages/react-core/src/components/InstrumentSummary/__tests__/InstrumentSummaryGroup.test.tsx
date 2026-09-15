import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { InstrumentSummaryGroup } from '../InstrumentSummaryGroup';

describe('InstrumentSummaryGroup', () => {
  afterEach(cleanup);

  it('should stringify a scalar value directly', () => {
    render(<InstrumentSummaryGroup items={[{ label: 'Score', value: 42 }]} title="Results" />);
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('should stringify a boolean and a Date directly', () => {
    render(
      <InstrumentSummaryGroup
        items={[
          { label: 'Passed', value: true },
          { label: 'Recorded', value: new Date('2024-01-01T00:00:00.000Z') }
        ]}
        title="Results"
      />
    );
    expect(screen.getByText('true')).toBeTruthy();
    expect(screen.getByText(new Date('2024-01-01T00:00:00.000Z').toString())).toBeTruthy();
  });

  it('should JSON-stringify an array value', () => {
    render(<InstrumentSummaryGroup items={[{ label: 'Answers', value: [1, 2, 3] }]} title="Results" />);
    expect(screen.getByText('[1,2,3]')).toBeTruthy();
  });

  it("should render 'NA' for a nullish value", () => {
    render(<InstrumentSummaryGroup items={[{ label: 'Missing', value: null }, { label: 'Absent' }]} title="Results" />);
    expect(screen.getAllByText('NA')).toHaveLength(2);
  });

  it('should JSON-stringify an object value that matches no other pattern', () => {
    render(<InstrumentSummaryGroup items={[{ label: 'Details', value: { nested: true } }]} title="Results" />);
    expect(screen.getByText('{"nested":true}')).toBeTruthy();
  });

  it('should skip a null item entirely', () => {
    render(<InstrumentSummaryGroup items={[null, { label: 'Score', value: 1 }]} title="Results" />);
    expect(screen.getAllByRole('term')).toHaveLength(1);
  });
});
