import type { PropsWithChildren } from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Footer } from '../Footer';

import '@/services/i18n';

vi.mock('@/config', () => ({
  config: {
    meta: {
      docsUrl: 'https://docs.example.org',
      githubRepoUrl: 'https://github.example.org/repo',
      licenseUrl: 'https://license.example.org'
    }
  }
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: PropsWithChildren<{ to: string }>) => <a href={to}>{children}</a>
}));

afterEach(cleanup);

describe('Footer', () => {
  it.each([
    ['Documentation', 'https://docs.example.org'],
    ['License', 'https://license.example.org'],
    ['Source Code', 'https://github.example.org/repo']
  ])('should open the %s link from the instance config in a new tab', (name, href) => {
    render(<Footer />);
    const link = screen.getByRole('link', { name });
    expect(link.getAttribute('href')).toBe(href);
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('should link to the in-app contact page', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Contact Us' }).getAttribute('href')).toBe('/contact');
  });

  it('should credit the organization with the current year', () => {
    render(<Footer />);
    expect(screen.getByText(`© ${new Date().getFullYear()} Douglas Neuroinformatics Platform`)).toBeTruthy();
  });
});
