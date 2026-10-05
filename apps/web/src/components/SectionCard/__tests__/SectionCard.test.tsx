import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SectionCard } from '../SectionCard';

const contents = 'Contents';

describe('SectionCard', () => {
  afterEach(cleanup);

  it('should render its children inside the card', () => {
    render(
      <SectionCard data-testid="card">
        <p>{contents}</p>
      </SectionCard>
    );
    expect(screen.getByTestId('card').textContent).toBe('Contents');
  });

  it("should merge a caller's class over the defaults, so a conflicting utility wins", () => {
    render(
      <SectionCard className="p-2" data-testid="card">
        {null}
      </SectionCard>
    );
    const classes = [...screen.getByTestId('card').classList];
    expect(classes).toContain('p-2');
    expect(classes).not.toContain('p-6');
  });
});
