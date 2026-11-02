import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { InstrumentInstructions } from '../InstrumentInstructions';

describe('InstrumentInstructions', () => {
  afterEach(cleanup);

  it('should render each instruction in its own paragraph', () => {
    render(<InstrumentInstructions instructions={['Step one', 'Step two']} />);
    expect(screen.getByText('Step one').tagName).toBe('P');
    expect(screen.getByText('Step two').tagName).toBe('P');
    expect(screen.queryByText('Step one, Step two')).toBeNull();
  });

  it('should render repeated instructions as separate paragraphs', () => {
    render(<InstrumentInstructions instructions={['Repeat me', 'Repeat me']} />);
    expect(screen.getAllByText('Repeat me')).toHaveLength(2);
  });

  it('should keep the line breaks within an instruction', () => {
    const { container } = render(<InstrumentInstructions instructions={['Answer\nhonestly.']} />);
    const paragraph = container.querySelector('p')!;
    expect(paragraph.textContent).toBe('Answer\nhonestly.');
    expect(paragraph.className).toContain('whitespace-pre-line');
  });

  it('should render nothing when there are no instructions', () => {
    const { container } = render(<InstrumentInstructions instructions={[]} />);
    expect(container.childElementCount).toBe(0);
  });
});
