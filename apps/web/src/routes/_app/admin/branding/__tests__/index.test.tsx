import type { ReactNode } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/admin/branding/index';

import '@/services/i18n';

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Link: ({ children, className, to }: { children: ReactNode; className?: string; to: string }) => (
    <a className={className} href={to}>
      {children}
    </a>
  )
}));

afterEach(cleanup);

describe('branding route', () => {
  const BrandingPage = Route.options.component!;

  it('should title the page as the branding section', () => {
    render(<BrandingPage />);
    expect(screen.getByRole('heading', { level: 2, name: 'Branding' })).toBeTruthy();
  });

  it('should link the login page card to its editor', () => {
    render(<BrandingPage />);
    const card = screen.getByRole('link', { name: /Login Page/ });
    expect(card.getAttribute('href')).toBe('/admin/branding/login-page');
  });

  it('should describe what the login page editor customizes', () => {
    render(<BrandingPage />);
    expect(
      screen.getByText('Customize the branding panel, colors, image, and text shown on the login page.')
    ).toBeTruthy();
  });

  it('should preview a light logo on the branding panel and a theme-aware logo on the form', () => {
    render(<BrandingPage />);
    const logos = screen.getByRole('link', { name: /Login Page/ }).querySelectorAll('svg');
    const fillClasses = Array.from(logos, (logo) =>
      Array.from(logo.classList).filter((token) => token.includes('fill-'))
    );
    expect(fillClasses).toEqual([['fill-slate-300'], ['fill-sky-900', 'dark:fill-slate-300']]);
  });
});
