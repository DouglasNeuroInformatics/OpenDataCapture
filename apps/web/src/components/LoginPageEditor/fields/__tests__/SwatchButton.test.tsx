import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SwatchButton } from '../SwatchButton';

describe('SwatchButton', () => {
  afterEach(cleanup);

  it('should call onClick when pressed', () => {
    const onClick = vi.fn();
    render(<SwatchButton isSelected={false} label="Ocean" style={{}} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ocean' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should not submit a surrounding form, since picking a theme is not saving it', () => {
    render(<SwatchButton isSelected={false} label="Ocean" style={{}} onClick={vi.fn()} />);
    expect(screen.getByRole('button').getAttribute('type')).toBe('button');
  });

  it('should ring the selected swatch, so the active theme stands out', () => {
    render(<SwatchButton isSelected label="Ocean" style={{}} onClick={vi.fn()} />);
    expect([...screen.getByRole('button').classList]).toEqual(expect.arrayContaining(['border-primary', 'ring-2']));
  });

  it('should leave an unselected swatch without the ring', () => {
    render(<SwatchButton isSelected={false} label="Ocean" style={{}} onClick={vi.fn()} />);
    expect([...screen.getByRole('button').classList]).not.toContain('ring-2');
  });

  it('should paint the swatch with the given style', () => {
    render(<SwatchButton isSelected={false} label="Ocean" style={{ background: 'red' }} onClick={vi.fn()} />);
    expect(screen.getByRole('button').querySelector('span')!.style.background).toBe('red');
  });
});
