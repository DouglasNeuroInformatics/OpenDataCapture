import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { BrandingConfig } from '@opendatacapture/schemas/setup';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LoginBrandingPanel } from '../LoginBrandingPanel';

import '@/services/i18n';

vi.mock('@/config', () => ({
  config: { meta: { docsUrl: 'https://docs.example.org', githubRepoUrl: 'https://github.example.org' } }
}));

const LOGO_URL = 'https://cdn.example.org/logo.png';
const UPLOADED_LOGO = 'data:image/png;base64,AAAA';

const renderPanel = (
  branding?: BrandingConfig | null,
  options: { lang?: 'en' | 'es' | 'fr'; preview?: boolean } = {}
) => render(<LoginBrandingPanel branding={branding} {...options} />);

const panel = () => screen.getByTestId('login-branding-panel');
const heading = () => screen.getByRole('heading', { level: 1 });
const logoImage = () => screen.getByRole('img');
const builtInLogo = () => panel().querySelector('svg[viewBox="0 0 320 259"]');
const sourceCodeMark = () =>
  screen.getByRole('link', { name: 'Source Code' }).querySelector('svg[viewBox="0 0 16 16"]')!;
const sectionTexts = () => [...panel().children[1]!.children].map((section) => section.textContent);

describe('LoginBrandingPanel', () => {
  afterEach(() => {
    cleanup();
    i18n.changeLanguage('en');
  });

  describe('instance name', () => {
    it('should fall back to the product name, so an unbranded instance still has a heading', () => {
      renderPanel();
      expect(heading().textContent).toBe('Open Data Capture');
    });

    it('should show the name in the language the caller overrides to, so the setup preview can show any language', () => {
      renderPanel({ instanceName: { en: 'Clinic', fr: 'Clinique' } }, { lang: 'fr' });
      expect(heading().textContent).toBe('Clinique');
    });

    it('should show the name in the interface language when no language is passed', () => {
      i18n.changeLanguage('fr');
      renderPanel({ instanceName: { en: 'Clinic', fr: 'Clinique' } });
      expect(heading().textContent).toBe('Clinique');
    });

    it('should bold the name by default, so a heading stands out without configuration', () => {
      renderPanel();
      expect([...heading().classList]).toContain('font-bold');
    });

    it('should render the name at medium weight when bold is turned off', () => {
      renderPanel({ boldName: false });
      expect([...heading().classList]).toContain('font-medium');
    });

    it('should align the name as configured', () => {
      renderPanel({ nameAlignment: 'right' });
      expect([...heading().classList]).toContain('text-right');
    });

    it('should apply the configured font size, so an admin can enlarge the name', () => {
      renderPanel({ nameFontSize: 48 });
      expect(heading().style.fontSize).toBe('48px');
    });

    it('should halve the font size in preview, so the miniature keeps its proportions', () => {
      renderPanel({ nameFontSize: 48 }, { preview: true });
      expect(heading().style.fontSize).toBe('24px');
    });

    it('should not shrink a preview font below its minimum, so small text stays legible', () => {
      renderPanel({ nameFontSize: 10 }, { preview: true });
      expect(heading().style.fontSize).toBe('7px');
    });

    it('should use the preview heading size in preview mode', () => {
      renderPanel(null, { preview: true });
      expect([...heading().classList]).toContain('text-xl');
    });
  });

  describe('tagline and details', () => {
    const branding = {
      instanceDetails: { en: 'Some details' },
      instanceTagline: { en: 'A tagline' }
    } satisfies BrandingConfig;

    it('should show the tagline and details when they are authored', () => {
      renderPanel(branding);
      expect(sectionTexts()).toEqual(expect.arrayContaining(['A tagline', 'Some details']));
    });

    it('should hide the tagline when it is turned off', () => {
      renderPanel({ ...branding, showTagline: false });
      expect(screen.queryByText('A tagline')).toBeNull();
    });

    it('should hide the details when they are turned off', () => {
      renderPanel({ ...branding, showDetails: false });
      expect(screen.queryByText('Some details')).toBeNull();
    });

    it('should not render an empty section when neither is authored, so the layout has no gaps', () => {
      renderPanel({ showLogo: false });
      expect(sectionTexts()).toEqual(['Open Data Capture']);
    });

    it('should leave the tagline and details at normal weight by default', () => {
      renderPanel(branding);
      expect([...screen.getByText('A tagline').classList]).not.toContain('font-bold');
      expect([...screen.getByText('Some details').classList]).not.toContain('font-bold');
    });

    it('should bold the tagline when configured', () => {
      renderPanel({ ...branding, boldTagline: true });
      expect([...screen.getByText('A tagline').classList]).toContain('font-bold');
    });

    it('should bold the details when configured', () => {
      renderPanel({ ...branding, boldDetails: true });
      expect([...screen.getByText('Some details').classList]).toContain('font-bold');
    });

    it('should apply the configured tagline and details font sizes', () => {
      renderPanel({ ...branding, detailsFontSize: 14, taglineFontSize: 20 });
      expect(screen.getByText('A tagline').style.fontSize).toBe('20px');
      expect(screen.getByText('Some details').style.fontSize).toBe('14px');
    });

    it('should use the smaller preview sizes for the tagline and details', () => {
      renderPanel(branding, { preview: true });
      expect([...screen.getByText('A tagline').classList]).toContain('text-xs');
      expect([...screen.getByText('Some details').classList]).toContain('text-[11px]');
    });
  });

  describe('section order', () => {
    const branding = {
      instanceTagline: { en: 'Tagline' },
      showLogo: false
    } satisfies BrandingConfig;

    it('should follow a complete custom order, so an admin can put the tagline first', () => {
      renderPanel({ ...branding, sectionsOrder: ['tagline', 'name', 'logo', 'details', 'resources'] });
      expect(sectionTexts()).toEqual(['Tagline', 'Open Data Capture']);
    });

    it('should ignore an incomplete order, so a section is never dropped by a partial save', () => {
      renderPanel({ ...branding, sectionsOrder: ['tagline', 'name'] });
      expect(sectionTexts()).toEqual(['Open Data Capture', 'Tagline']);
    });
  });

  describe('logo', () => {
    it('should render the built-in logo when no custom logo is configured', () => {
      renderPanel();
      expect(builtInLogo()).not.toBeNull();
    });

    it('should hide the logo when it is turned off', () => {
      renderPanel({ showLogo: false });
      expect(builtInLogo()).toBeNull();
    });

    it('should render the uploaded logo, labelled with the instance name for screen readers', () => {
      renderPanel({ customLogoSrc: UPLOADED_LOGO, instanceName: { en: 'Clinic' } });
      expect(logoImage().getAttribute('src')).toBe(UPLOADED_LOGO);
      expect(logoImage().getAttribute('alt')).toBe('Clinic');
    });

    it('should render the external logo when the url source is selected', () => {
      renderPanel({ customLogoSrc: UPLOADED_LOGO, customLogoUrl: LOGO_URL, logoSource: 'url' });
      expect(logoImage().getAttribute('src')).toBe(LOGO_URL);
    });

    it('should fall back to the built-in logo when the url source has no url, rather than the stale upload', () => {
      renderPanel({ customLogoSrc: UPLOADED_LOGO, logoSource: 'url' });
      expect(screen.queryByRole('img')).toBeNull();
      expect(builtInLogo()).not.toBeNull();
    });

    it('should fall back to the built-in logo when the image fails to load, so a broken link shows no icon', () => {
      renderPanel({ customLogoSrc: UPLOADED_LOGO });
      fireEvent.error(logoImage());
      expect(screen.queryByRole('img')).toBeNull();
      expect(builtInLogo()).not.toBeNull();
    });

    it('should retry the image when its source changes after a failure, so fixing the url takes effect', () => {
      const { rerender } = renderPanel({ customLogoSrc: UPLOADED_LOGO });
      fireEvent.error(logoImage());
      rerender(<LoginBrandingPanel branding={{ customLogoUrl: LOGO_URL, logoSource: 'url' }} />);
      expect(logoImage().getAttribute('src')).toBe(LOGO_URL);
    });

    it('should align the logo as configured', () => {
      renderPanel({ customLogoSrc: UPLOADED_LOGO, logoAlignment: 'center' });
      expect([...logoImage().parentElement!.classList]).toContain('justify-center');
    });

    it('should default to the small preset height', () => {
      renderPanel({ customLogoSrc: UPLOADED_LOGO });
      expect([...logoImage().classList]).toEqual(expect.arrayContaining(['w-auto', 'h-12']));
    });

    it('should use the preview height of the selected preset in preview mode', () => {
      renderPanel({ customLogoSrc: UPLOADED_LOGO, logoSize: 'xlarge' }, { preview: true });
      expect([...logoImage().classList]).toContain('h-20');
    });

    it('should use the small preset when custom size is selected without dimensions, so the logo is never unsized', () => {
      renderPanel({ customLogoSrc: UPLOADED_LOGO, logoSize: 'custom' });
      expect([...logoImage().classList]).toContain('h-12');
    });

    it('should size a custom logo to its exact dimensions', () => {
      renderPanel({ customLogoHeight: 80, customLogoSrc: UPLOADED_LOGO, customLogoWidth: 200, logoSize: 'custom' });
      expect(logoImage().style.width).toBe('200px');
      expect(logoImage().style.height).toBe('80px');
    });

    it('should leave the unset custom dimension automatic, so the aspect ratio is preserved', () => {
      renderPanel({ customLogoHeight: 80, customLogoSrc: UPLOADED_LOGO, logoSize: 'custom' });
      expect(logoImage().style.width).toBe('auto');
      expect(logoImage().style.height).toBe('80px');
    });

    it('should leave the height automatic when only a custom width is set', () => {
      renderPanel({ customLogoSrc: UPLOADED_LOGO, customLogoWidth: 200, logoSize: 'custom' });
      expect(logoImage().style.height).toBe('auto');
    });

    it('should scale a custom logo down in preview, so it fits the miniature panel', () => {
      renderPanel(
        { customLogoHeight: 100, customLogoSrc: UPLOADED_LOGO, customLogoWidth: 200, logoSize: 'custom' },
        { preview: true }
      );
      expect(logoImage().style.width).toBe('36px');
      expect(logoImage().style.height).toBe('18px');
    });

    it('should cap a large custom logo in preview at the maximum preview size', () => {
      renderPanel(
        { customLogoHeight: 1000, customLogoSrc: UPLOADED_LOGO, customLogoWidth: 2000, logoSize: 'custom' },
        { preview: true }
      );
      expect(logoImage().style.width).toBe('120px');
      expect(logoImage().style.height).toBe('60px');
    });

    it('should leave the unset custom dimension automatic in preview', () => {
      renderPanel({ customLogoSrc: UPLOADED_LOGO, customLogoWidth: 200, logoSize: 'custom' }, { preview: true });
      expect(logoImage().style.height).toBe('auto');
      expect(logoImage().style.width).toBe('36px');
    });

    it('should leave both preview dimensions automatic when the custom size is zero', () => {
      renderPanel({ customLogoSrc: UPLOADED_LOGO, customLogoWidth: 0, logoSize: 'custom' }, { preview: true });
      expect(logoImage().style.width).toBe('auto');
      expect(logoImage().style.height).toBe('auto');
    });
  });

  describe('resource links', () => {
    const branding = {
      resourceLinks: [
        { href: 'https://help.example.org', label: { en: 'Help', fr: 'Aide' } },
        { href: 'https://blank.example.org', label: { en: '   ' } }
      ],
      showResourceLinks: true
    } satisfies BrandingConfig;

    const helpLink = () => screen.getByRole('link', { name: 'Help' });

    it('should open each link in a new tab without exposing the opener', () => {
      renderPanel(branding);
      expect(helpLink().getAttribute('href')).toBe('https://help.example.org');
      expect(helpLink().getAttribute('target')).toBe('_blank');
      expect(helpLink().getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('should skip a link whose label is blank, so an untitled link is never shown', () => {
      renderPanel(branding);
      expect(panel().querySelector('a[href="https://blank.example.org"]')).toBeNull();
    });

    it('should label the links in the panel language', () => {
      renderPanel(branding, { lang: 'fr' });
      expect(screen.getByText('Ressources')).toBeTruthy();
      expect(screen.getByRole('link', { name: 'Aide' })).toBeTruthy();
    });

    it('should hide the links unless they are turned on', () => {
      renderPanel({ ...branding, showResourceLinks: false });
      expect(screen.queryByText('Resources')).toBeNull();
    });

    it('should hide the links when the list is empty, so no orphaned heading is shown', () => {
      renderPanel({ resourceLinks: [], showResourceLinks: true });
      expect(screen.queryByText('Resources')).toBeNull();
    });

    it('should hide the links when none are configured', () => {
      renderPanel({ showResourceLinks: true });
      expect(screen.queryByText('Resources')).toBeNull();
    });

    it('should render the links at medium weight by default', () => {
      renderPanel(branding);
      expect([...helpLink().classList]).toContain('font-medium');
    });

    it('should bold the links when configured', () => {
      renderPanel({ ...branding, boldResourceLinks: true });
      expect([...helpLink().classList]).toContain('font-bold');
    });

    it('should apply the configured font size to the heading and the links', () => {
      renderPanel({ ...branding, resourceLinksFontSize: 16 });
      expect(screen.getByText('Resources').style.fontSize).toBe('16px');
      expect(helpLink().parentElement!.style.fontSize).toBe('16px');
    });

    it('should use the smaller preview sizes for the links', () => {
      renderPanel(branding, { preview: true });
      expect([...screen.getByText('Resources').classList]).toContain('text-[9px]');
      expect([...helpLink().parentElement!.classList]).toContain('text-[11px]');
    });
  });

  describe('footer', () => {
    it('should link to the source code and documentation by default', () => {
      renderPanel();
      expect(screen.getByRole('link', { name: 'Source Code' }).getAttribute('href')).toBe('https://github.example.org');
      expect(screen.getByRole('link', { name: 'Documentation' }).getAttribute('href')).toBe('https://docs.example.org');
    });

    it('should mark the source code link with the GitHub mark at the footer icon size', () => {
      renderPanel();
      expect(sourceCodeMark().getAttribute('class')).toBe('h-4 w-4');
    });

    it('should shrink the GitHub mark in preview mode, so it scales with the miniature footer', () => {
      renderPanel(null, { preview: true });
      expect(sourceCodeMark().getAttribute('class')).toBe('h-3 w-3');
    });

    it('should hide the footer links when they are turned off', () => {
      renderPanel({ showFooterLinks: false });
      expect(screen.queryByRole('link')).toBeNull();
    });

    it('should show the copyright for the current year', () => {
      renderPanel();
      expect(screen.getByText(`© ${new Date().getFullYear()} Douglas Neuroinformatics`)).toBeTruthy();
    });

    it('should use the compact footer spacing in preview mode', () => {
      renderPanel(null, { preview: true });
      const footerLinks = screen.getByRole('link', { name: 'Source Code' }).parentElement!;
      expect([...footerLinks.classList]).toContain('pb-1.5');
      expect([...footerLinks.parentElement!.classList]).toContain('pt-5');
    });
  });

  describe('panel', () => {
    it('should paint the configured theme gradient as the background', () => {
      renderPanel({ loginTheme: 'forest' });
      expect(panel().style.backgroundImage).toBe('linear-gradient(135deg, #10b981 0%, #064e3b 100%)');
    });

    it('should use the default slate text colors when no text color is configured', () => {
      renderPanel({ instanceTagline: { en: 'Tagline' } });
      expect([...panel().classList]).toContain('text-slate-100');
      expect([...screen.getByText('Tagline').classList]).toContain('text-slate-200/90');
    });

    it('should color all text with the configured color instead of the slate defaults, so the override is not masked', () => {
      renderPanel({ instanceTagline: { en: 'Tagline' }, panelTextColor: '#ff0000' });
      expect(panel().style.color).toBe('#ff0000');
      expect([...panel().classList]).not.toContain('text-slate-100');
      expect([...screen.getByText('Tagline').classList]).not.toContain('text-slate-200/90');
    });

    it('should use the compact padding in preview mode', () => {
      renderPanel(null, { preview: true });
      expect([...panel().classList]).toContain('p-5');
    });

    it('should merge the caller class name onto the panel', () => {
      render(<LoginBrandingPanel className="h-full" />);
      expect([...panel().classList]).toContain('h-full');
    });
  });
});
