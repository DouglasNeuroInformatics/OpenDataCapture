import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { InstanceCard } from '../InstanceCard';

describe('InstanceCard', () => {
  afterEach(cleanup);

  it("should replace libui's own surface, so every card in the instance shares one color", () => {
    render(<InstanceCard data-testid="instance-card" />);
    const { className } = screen.getByTestId('instance-card');
    expect(className).toContain('bg-[color:var(--instance-card-fill,transparent)]');
    expect(className).toContain('border-[color:var(--instance-card-border,transparent)]');
    expect(className).not.toContain('bg-card');
    expect(className).not.toContain('shadow-sm');
  });

  it('should keep the layout a caller asks for', () => {
    render(<InstanceCard className="flex p-6" data-testid="instance-card" />);
    expect(screen.getByTestId('instance-card').className).toContain('flex p-6');
  });

  it('should mark itself, so a page can be checked for having one', () => {
    render(<InstanceCard data-testid="instance-card" />);
    expect(screen.getByTestId('instance-card').hasAttribute('data-instance-card')).toBe(true);
  });
});
