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
});
