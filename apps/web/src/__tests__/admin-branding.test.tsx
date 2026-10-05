import type { ReactNode } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LoginPageEditor } from '@/components/LoginPageEditor';
import { Route as BrandingRoute } from '@/routes/_app/admin/branding/index';
import { Route as LoginPageRoute } from '@/routes/_app/admin/branding/login-page';

import '@/services/i18n';

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Link: ({ children, className, to }: { children: ReactNode; className?: string; to: string }) => (
    <a className={className} href={to}>
      {children}
    </a>
  )
}));
vi.mock('@/components/LoginPageEditor', () => ({ LoginPageEditor: () => null }));

afterEach(cleanup);

describe('branding route', () => {
  const BrandingPage = BrandingRoute.options.component!;

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
    expect(Array.from(logos, (logo) => logo.getAttribute('class'))).toEqual([
      expect.stringContaining('fill-slate-300'),
      expect.stringContaining('dark:fill-slate-300')
    ]);
  });
});

describe('login page branding route', () => {
  it('should render the login page editor, so the route adds nothing around it', () => {
    expect(LoginPageRoute.options.component).toBe(LoginPageEditor);
  });
});
