import type { PropsWithChildren } from 'react';

import type { BrandingConfig, SetupState } from '@opendatacapture/schemas/setup';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SETUP_STATE_QUERY_KEY } from '@/hooks/useSetupStateQuery';

import { DEFAULT_PANEL_TEXT_COLOR, DEFAULT_SECTIONS_ORDER, MAX_LOGO_BYTES } from '../constants';
import { useBrandingForm } from '../hooks';

import type { BrandingEditor } from '../hooks';

type BlockerOptions = { enableBeforeUnload: () => boolean; shouldBlockFn: () => boolean; withResolver: boolean };

const mockAxios = vi.hoisted(() => ({
  get: vi.fn(),
  isAxiosError: vi.fn(() => false),
  patch: vi.fn<(url: string, body: { branding: BrandingConfig }) => Promise<unknown>>()
}));
const addNotification = vi.hoisted(() => vi.fn());
const useBlocker = vi.hoisted(() => vi.fn((_options: BlockerOptions) => ({ status: 'idle' })));
const readLogoAsWebpDataUrl = vi.hoisted(() => vi.fn<(file: File) => Promise<string>>());

vi.mock('axios', () => ({ default: mockAxios }));

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: vi.fn((selector) => selector({ addNotification })),
  useTranslation: vi.fn(() => ({
    resolvedLanguage: 'en',
    t: (value: { en: string }) => value.en
  }))
}));

vi.mock('@tanstack/react-router', () => ({ useBlocker }));

vi.mock('../image', () => ({ readLogoAsWebpDataUrl }));

const FULL_BRANDING: BrandingConfig = {
  boldDetails: true,
  boldName: false,
  boldResourceLinks: true,
  boldTagline: true,
  customLogoHeight: 120,
  customLogoSrc: 'data:image/png;base64,AAAA',
  customLogoUrl: 'https://example.com/logo.png',
  customLogoWidth: 240,
  customPrimaryColor: '#111111',
  customSecondaryColor: '#222222',
  detailsFontSize: 14,
  enableBranding: true,
  instanceDetails: { en: 'Details', fr: 'Détails' },
  instanceName: { en: 'Name', fr: 'Nom' },
  instanceTagline: { en: 'Tagline', fr: 'Slogan' },
  loginTheme: 'forest',
  logoAlignment: 'center',
  logoSize: 'large',
  logoSource: 'url',
  nameAlignment: 'right',
  nameFontSize: 32,
  panelTextColor: '#333333',
  resourceLinks: [{ href: 'https://example.com', label: { en: null, fr: 'Lien' } }],
  resourceLinksFontSize: 12,
  rightPanelPrimaryColor: '#444444',
  rightPanelSecondaryColor: '#555555',
  rightPanelTheme: 'ocean',
  sectionsOrder: ['resources', 'details', 'tagline', 'name', 'logo'],
  showDetails: false,
  showFooterLinks: false,
  showLogo: false,
  showResourceLinks: true,
  showTagline: false,
  taglineFontSize: 18
};

const FULL_FORM_LINKS = [{ href: 'https://example.com', label: { en: '', fr: 'Lien' } }];

const VALID_LINK = { href: 'https://example.com', label: { en: 'Docs', fr: '' } };

function createSetupState(branding: BrandingConfig | null): SetupState {
  return {
    activeLanguages: ['en'],
    branding,
    isDemo: false,
    isGatewayEnabled: false,
    isSetup: true,
    release: { buildTime: 0, type: 'production', version: '1.0.0' },
    uptime: 0
  };
}

function renderBrandingForm(branding: BrandingConfig | null = null) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData([SETUP_STATE_QUERY_KEY], createSetupState(branding));
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { ...renderHook(() => useBrandingForm(), { wrapper }), queryClient };
}

function submit(result: { current: BrandingEditor }) {
  const { container } = render(<form onSubmit={(event) => result.current.handleSubmit(event)} />);
  return fireEvent.submit(container.querySelector('form')!);
}

async function submitAndCapture(result: { current: BrandingEditor }) {
  submit(result);
  await waitFor(() => expect(mockAxios.patch).toHaveBeenCalled());
  return mockAxios.patch.mock.lastCall![1].branding;
}

// React Query notifies observers on a zero-delay timeout, so the hook sees new server data a macrotask later.
async function receiveServerBranding(queryClient: QueryClient, branding: BrandingConfig) {
  await act(async () => {
    queryClient.setQueryData([SETUP_STATE_QUERY_KEY], createSetupState(branding));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

const blockerOptions = () => useBlocker.mock.lastCall![0];

describe('useBrandingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // The post-save refetch never settles, so a save never rehydrates the form from the server.
    mockAxios.get.mockReturnValue(new Promise(() => undefined));
    mockAxios.patch.mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should fall back on the defaults when nothing has been saved', () => {
      const { result } = renderBrandingForm(null);
      expect(result.current.form).toEqual({
        boldDetails: false,
        boldName: true,
        boldResourceLinks: false,
        boldTagline: false,
        customLogoHeight: '',
        customLogoSrc: '',
        customLogoUrl: '',
        customLogoWidth: '',
        customPrimaryColor: '#0ea5e9',
        customSecondaryColor: '#0c4a6e',
        detailsFontSize: null,
        enableBranding: false,
        instanceDetails: { en: '', fr: '' },
        instanceName: { en: '', fr: '' },
        instanceTagline: { en: '', fr: '' },
        loginTheme: 'slate',
        logoAlignment: 'left',
        logoSize: 'small',
        logoSource: 'upload',
        nameAlignment: 'left',
        nameFontSize: null,
        panelTextColor: DEFAULT_PANEL_TEXT_COLOR,
        resourceLinks: [],
        resourceLinksFontSize: null,
        rightPanelOption: 'none',
        rightPanelPrimaryColor: '#475569',
        rightPanelSecondaryColor: '#0f172a',
        sectionsOrder: DEFAULT_SECTIONS_ORDER,
        showDetails: true,
        showFooterLinks: true,
        showLogo: true,
        showResourceLinks: false,
        showTagline: true,
        taglineFontSize: null
      });
    });

    it('should load every saved value into the form', () => {
      const { result } = renderBrandingForm(FULL_BRANDING);
      expect(result.current.form).toEqual({
        boldDetails: true,
        boldName: false,
        boldResourceLinks: true,
        boldTagline: true,
        customLogoHeight: '120',
        customLogoSrc: 'data:image/png;base64,AAAA',
        customLogoUrl: 'https://example.com/logo.png',
        customLogoWidth: '240',
        customPrimaryColor: '#111111',
        customSecondaryColor: '#222222',
        detailsFontSize: 14,
        enableBranding: true,
        instanceDetails: { en: 'Details', fr: 'Détails' },
        instanceName: { en: 'Name', fr: 'Nom' },
        instanceTagline: { en: 'Tagline', fr: 'Slogan' },
        loginTheme: 'forest',
        logoAlignment: 'center',
        logoSize: 'large',
        logoSource: 'url',
        nameAlignment: 'right',
        nameFontSize: 32,
        panelTextColor: '#333333',
        resourceLinks: FULL_FORM_LINKS,
        resourceLinksFontSize: 12,
        rightPanelOption: 'ocean',
        rightPanelPrimaryColor: '#444444',
        rightPanelSecondaryColor: '#555555',
        sectionsOrder: ['resources', 'details', 'tagline', 'name', 'logo'],
        showDetails: false,
        showFooterLinks: false,
        showLogo: false,
        showResourceLinks: true,
        showTagline: false,
        taglineFontSize: 18
      });
    });

    it('should turn a missing resource link label into an empty string, so the inputs stay controlled', () => {
      const { result } = renderBrandingForm({
        resourceLinks: [{ href: 'https://example.com', label: { fr: 'Lien' } }]
      });
      expect(result.current.form.resourceLinks).toEqual(FULL_FORM_LINKS);
    });

    it('should move a legacy http logo saved in the upload slot into the url slot', () => {
      const { result } = renderBrandingForm({ customLogoSrc: 'https://example.com/logo.png' });
      expect(result.current.form).toMatchObject({
        customLogoSrc: '',
        customLogoUrl: 'https://example.com/logo.png',
        logoSource: 'url'
      });
    });

    it('should keep an uploaded data URI in the upload slot', () => {
      const { result } = renderBrandingForm({ customLogoSrc: 'data:image/png;base64,AAAA' });
      expect(result.current.form).toMatchObject({
        customLogoSrc: 'data:image/png;base64,AAAA',
        customLogoUrl: '',
        logoSource: 'upload'
      });
    });

    it('should leave an http logo in the upload slot alone once a url is saved, since it is no longer legacy', () => {
      const { result } = renderBrandingForm({
        customLogoSrc: 'https://example.com/old.png',
        customLogoUrl: 'https://example.com/new.png'
      });
      expect(result.current.form).toMatchObject({
        customLogoSrc: 'https://example.com/old.png',
        customLogoUrl: 'https://example.com/new.png',
        logoSource: 'upload'
      });
    });

    it('should fall back on the default right panel for a theme the picker does not offer', () => {
      const { result } = renderBrandingForm({ rightPanelTheme: 'sunset' });
      expect(result.current.form.rightPanelOption).toBe('none');
    });

    it('should ignore an incomplete saved section order, so no section goes missing from the panel', () => {
      const { result } = renderBrandingForm({ sectionsOrder: ['name', 'logo'] });
      expect(result.current.form.sectionsOrder).toEqual(DEFAULT_SECTIONS_ORDER);
    });
  });

  describe('editing', () => {
    it('should set a single field with update', () => {
      const { result } = renderBrandingForm();
      act(() => result.current.update('loginTheme', 'rose'));
      expect(result.current.form.loginTheme).toBe('rose');
    });

    it('should change only the given language with updateText', () => {
      const { result } = renderBrandingForm({ instanceName: { en: 'Name', fr: 'Nom' } });
      act(() => result.current.updateText('instanceName', 'fr', 'Instance'));
      expect(result.current.form.instanceName).toEqual({ en: 'Name', fr: 'Instance' });
    });

    it('should append a blank resource link', () => {
      const { result } = renderBrandingForm();
      act(() => result.current.addResourceLink());
      expect(result.current.form.resourceLinks).toEqual([{ href: '', label: { en: '', fr: '' } }]);
    });

    it('should change the href of only the given resource link', () => {
      const { result } = renderBrandingForm();
      act(() => result.current.addResourceLink());
      act(() => result.current.addResourceLink());
      act(() => result.current.updateResourceLinkHref(1, 'https://example.org'));
      expect(result.current.form.resourceLinks.map((link) => link.href)).toEqual(['', 'https://example.org']);
    });

    it('should change one language of only the given resource link label', () => {
      const { result } = renderBrandingForm();
      act(() => result.current.addResourceLink());
      act(() => result.current.addResourceLink());
      act(() => result.current.updateResourceLinkLabel(0, 'en', 'Docs'));
      expect(result.current.form.resourceLinks.map((link) => link.label)).toEqual([
        { en: 'Docs', fr: '' },
        { en: '', fr: '' }
      ]);
    });

    it('should remove the resource link at the given index', () => {
      const { result } = renderBrandingForm();
      act(() => result.current.addResourceLink());
      act(() => result.current.updateResourceLinkHref(0, 'https://a.com'));
      act(() => result.current.addResourceLink());
      act(() => result.current.removeResourceLink(1));
      expect(result.current.form.resourceLinks.map((link) => link.href)).toEqual(['https://a.com']);
    });

    it('should move a section to the given position', () => {
      const { result } = renderBrandingForm();
      act(() => result.current.moveSection(0, 2));
      expect(result.current.form.sectionsOrder).toEqual(['name', 'tagline', 'logo', 'details', 'resources']);
    });
  });

  describe('handleLogoFile', () => {
    const pngFile = (size = 4) => new File([new Uint8Array(size)], 'logo.png', { type: 'image/png' });

    it('should do nothing when the picker is dismissed without a file', () => {
      const { result } = renderBrandingForm();
      act(() => result.current.handleLogoFile(undefined));
      expect(readLogoAsWebpDataUrl).not.toHaveBeenCalled();
      expect(addNotification).not.toHaveBeenCalled();
    });

    it('should reject a file that is not a supported image, since the accept hint can be overridden', () => {
      const { result } = renderBrandingForm();
      act(() => result.current.handleLogoFile(new File(['x'], 'logo.gif', { type: 'image/gif' })));
      expect(addNotification).toHaveBeenCalledWith(expect.objectContaining({ title: 'Unsupported file type' }));
      expect(readLogoAsWebpDataUrl).not.toHaveBeenCalled();
    });

    it('should reject an image larger than the limit before reading it', () => {
      const { result } = renderBrandingForm();
      act(() => result.current.handleLogoFile(pngFile(MAX_LOGO_BYTES + 1)));
      expect(addNotification).toHaveBeenCalledWith(expect.objectContaining({ title: 'File too large' }));
      expect(readLogoAsWebpDataUrl).not.toHaveBeenCalled();
    });

    it.each(['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'])(
      'should accept a %s logo for encoding',
      (type) => {
        readLogoAsWebpDataUrl.mockReturnValue(new Promise(() => undefined));
        const { result } = renderBrandingForm();
        const file = new File(['x'], 'logo', { type });
        act(() => result.current.handleLogoFile(file));
        expect(readLogoAsWebpDataUrl).toHaveBeenCalledWith(file);
      }
    );

    it('should store the encoded image as the uploaded logo', async () => {
      readLogoAsWebpDataUrl.mockResolvedValue('data:image/webp;base64,BBBB');
      const { result } = renderBrandingForm();
      act(() => result.current.handleLogoFile(pngFile()));
      await waitFor(() => expect(result.current.form.customLogoSrc).toBe('data:image/webp;base64,BBBB'));
    });

    it('should report a file that cannot be decoded as an image', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      readLogoAsWebpDataUrl.mockRejectedValue(new Error('decode failed'));
      const { result } = renderBrandingForm();
      act(() => result.current.handleLogoFile(pngFile()));
      await waitFor(() =>
        expect(addNotification).toHaveBeenCalledWith(expect.objectContaining({ title: 'Invalid image', type: 'error' }))
      );
      expect(consoleError).toHaveBeenCalledWith(new Error('decode failed'));
    });
  });

  describe('custom logo size', () => {
    it('should ignore unparseable dimensions while a preset size is selected', () => {
      const { result } = renderBrandingForm({ logoSize: 'large' });
      act(() => result.current.update('customLogoWidth', 'abc'));
      expect(result.current.isCustomSizeInvalid).toBe(false);
    });

    it('should require at least one dimension for a custom size', () => {
      const { result } = renderBrandingForm({ logoSize: 'custom' });
      expect(result.current.isCustomSizeInvalid).toBe(true);
    });

    it('should accept a custom size with only a width', () => {
      const { result } = renderBrandingForm({ customLogoWidth: 200, logoSize: 'custom' });
      expect(result.current.isCustomSizeInvalid).toBe(false);
      expect(result.current.customWidth).toBe(200);
      expect(result.current.customHeight).toBeNull();
    });

    it.each([
      ['a non-numeric width', 'abc', '100'],
      ['a zero height', '100', '0'],
      ['a width over 5000 px', '6000', '100']
    ])('should flag %s as invalid', (_, width, height) => {
      const { result } = renderBrandingForm({ logoSize: 'custom' });
      act(() => result.current.update('customLogoWidth', width));
      act(() => result.current.update('customLogoHeight', height));
      expect(result.current.isCustomSizeInvalid).toBe(true);
    });

    it('should treat a whitespace-only dimension as blank rather than invalid', () => {
      const { result } = renderBrandingForm({ customLogoHeight: 100, logoSize: 'custom' });
      act(() => result.current.update('customLogoWidth', '  '));
      expect(result.current.isCustomSizeInvalid).toBe(false);
    });
  });

  describe('color validation', () => {
    it('should ignore the custom colors while a preset left theme is selected', () => {
      const { result } = renderBrandingForm({ customPrimaryColor: null, loginTheme: 'forest' });
      act(() => result.current.update('customPrimaryColor', 'bad'));
      expect(result.current.isCustomColorInvalid).toBe(false);
    });

    it.each([
      ['primary', 'customPrimaryColor'],
      ['secondary', 'customSecondaryColor']
    ] as const)('should flag an invalid custom %s left color', (_, key) => {
      const { result } = renderBrandingForm({ loginTheme: 'custom' });
      act(() => result.current.update(key, 'bad'));
      expect(result.current.isCustomColorInvalid).toBe(true);
    });

    it('should accept valid custom left colors', () => {
      const { result } = renderBrandingForm({ loginTheme: 'custom' });
      expect(result.current.isCustomColorInvalid).toBe(false);
    });

    it('should ignore the custom right colors while a preset right theme is selected', () => {
      const { result } = renderBrandingForm({ rightPanelTheme: 'ocean' });
      act(() => result.current.update('rightPanelPrimaryColor', 'bad'));
      expect(result.current.isRightPanelCustomColorInvalid).toBe(false);
    });

    it.each([
      ['primary', 'rightPanelPrimaryColor'],
      ['secondary', 'rightPanelSecondaryColor']
    ] as const)('should flag an invalid custom %s right color', (_, key) => {
      const { result } = renderBrandingForm({ rightPanelTheme: 'custom' });
      act(() => result.current.update(key, 'bad'));
      expect(result.current.isRightPanelCustomColorInvalid).toBe(true);
    });

    it('should accept valid custom right colors', () => {
      const { result } = renderBrandingForm({ rightPanelTheme: 'custom' });
      expect(result.current.isRightPanelCustomColorInvalid).toBe(false);
    });

    it('should flag an invalid panel text color, since that field is always shown', () => {
      const { result } = renderBrandingForm();
      act(() => result.current.update('panelTextColor', ''));
      expect(result.current.isPanelTextColorInvalid).toBe(true);
    });
  });

  describe('resource link validation', () => {
    it('should ignore invalid links while the section is hidden', () => {
      const { result } = renderBrandingForm({ showResourceLinks: false });
      act(() => result.current.addResourceLink());
      expect(result.current.hasInvalidResourceLinks).toBe(false);
    });

    it.each([
      ['a link with no label', { href: 'https://example.com', label: { en: ' ', fr: '' } }],
      ['a link with a blank href', { href: '  ', label: { en: 'Docs', fr: '' } }],
      ['a link whose href is not an http url', { href: 'javascript:alert(1)', label: { en: 'Docs', fr: '' } }]
    ])('should flag %s while the section is shown', (_, link) => {
      const { result } = renderBrandingForm({ resourceLinks: [VALID_LINK], showResourceLinks: true });
      act(() => result.current.addResourceLink());
      act(() => result.current.updateResourceLinkHref(1, link.href));
      act(() => result.current.updateResourceLinkLabel(1, 'en', link.label.en));
      expect(result.current.hasInvalidResourceLinks).toBe(true);
    });

    it('should accept a link labelled in French only', () => {
      const { result } = renderBrandingForm({
        resourceLinks: [{ href: 'https://example.com', label: { fr: 'Lien' } }],
        showResourceLinks: true
      });
      expect(result.current.hasInvalidResourceLinks).toBe(false);
    });
  });

  describe('isSubmitDisabled', () => {
    it('should enable Save for a valid form', () => {
      const { result } = renderBrandingForm();
      expect(result.current.isSubmitDisabled).toBe(false);
    });

    it.each<[string, Parameters<BrandingEditor['update']>]>([
      ['the custom left colors are invalid', ['customPrimaryColor', 'bad']],
      ['the custom right colors are invalid', ['rightPanelPrimaryColor', 'bad']],
      ['the panel text color is invalid', ['panelTextColor', 'bad']],
      ['the custom size is invalid', ['customLogoWidth', 'abc']],
      ['a resource link is invalid', ['resourceLinks', [{ href: '', label: { en: '', fr: '' } }]]]
    ])('should disable Save when %s', (_, [key, value]) => {
      const { result } = renderBrandingForm({
        customLogoWidth: 100,
        loginTheme: 'custom',
        logoSize: 'custom',
        rightPanelTheme: 'custom',
        showResourceLinks: true
      });
      act(() => result.current.update(key, value));
      expect(result.current.isSubmitDisabled).toBe(true);
    });

    it('should disable Save while a save is in flight, so it cannot be sent twice', async () => {
      mockAxios.patch.mockReturnValue(new Promise(() => undefined));
      const { result } = renderBrandingForm();
      submit(result);
      await waitFor(() => expect(result.current.isSubmitDisabled).toBe(true));
    });
  });

  describe('previewBranding', () => {
    it('should preview every form value in the saved shape', () => {
      const { result } = renderBrandingForm(FULL_BRANDING);
      expect(result.current.previewBranding).toEqual({
        ...FULL_BRANDING,
        resourceLinks: FULL_FORM_LINKS,
        rightPanelPrimaryColor: null,
        rightPanelSecondaryColor: null
      });
    });

    it('should preview an empty logo slot as null, so the panel shows no broken image', () => {
      const { result } = renderBrandingForm();
      expect(result.current.previewBranding).toMatchObject({ customLogoSrc: null, customLogoUrl: null });
    });

    it('should preview the logo slots and parsed dimensions as typed', () => {
      const { result } = renderBrandingForm(FULL_BRANDING);
      expect(result.current.previewBranding).toMatchObject({
        customLogoHeight: 120,
        customLogoSrc: 'data:image/png;base64,AAAA',
        customLogoUrl: 'https://example.com/logo.png',
        customLogoWidth: 240
      });
    });

    it('should preview an invalid panel text color as the default', () => {
      const { result } = renderBrandingForm();
      act(() => result.current.update('panelTextColor', 'bad'));
      expect(result.current.previewBranding.panelTextColor).toBeNull();
    });

    it('should preview the default right panel as having no theme', () => {
      const { result } = renderBrandingForm();
      expect(result.current.previewBranding).toMatchObject({
        rightPanelPrimaryColor: null,
        rightPanelSecondaryColor: null,
        rightPanelTheme: null
      });
    });

    it('should preview custom right panel colors only for the custom theme', () => {
      const { result } = renderBrandingForm({ ...FULL_BRANDING, rightPanelTheme: 'custom' });
      expect(result.current.previewBranding).toMatchObject({
        rightPanelPrimaryColor: '#444444',
        rightPanelSecondaryColor: '#555555',
        rightPanelTheme: 'custom'
      });
    });

    it('should preview a preset right panel theme without custom colors', () => {
      const { result } = renderBrandingForm(FULL_BRANDING);
      expect(result.current.previewBranding).toMatchObject({
        rightPanelPrimaryColor: null,
        rightPanelSecondaryColor: null,
        rightPanelTheme: 'ocean'
      });
    });
  });

  describe('handleSubmit', () => {
    it('should prevent the native form submission, so the page does not reload', () => {
      const { result } = renderBrandingForm();
      expect(submit(result)).toBe(false);
    });

    it.each<[string, BrandingConfig]>([
      ['the custom left colors are invalid', { customPrimaryColor: 'bad', loginTheme: 'custom' }],
      ['the custom right colors are invalid', { rightPanelPrimaryColor: 'bad', rightPanelTheme: 'custom' }],
      ['the panel text color is invalid', { panelTextColor: 'bad' }],
      ['the custom size is invalid', { logoSize: 'custom' }],
      ['a resource link is invalid', { resourceLinks: [{ href: 'bad', label: {} }], showResourceLinks: true }]
    ])('should not save when %s, even if Enter bypassed the disabled button', async (_, branding) => {
      const { result } = renderBrandingForm(branding);
      submit(result);
      await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
      expect(mockAxios.patch).not.toHaveBeenCalled();
    });

    it('should save every field of a fully customized form as it was loaded', async () => {
      const customized: BrandingConfig = {
        ...FULL_BRANDING,
        loginTheme: 'custom',
        logoSize: 'custom',
        rightPanelTheme: 'custom'
      };
      const { result } = renderBrandingForm(customized);
      expect(await submitAndCapture(result)).toEqual(customized);
    });

    it('should send the branding to the setup endpoint', async () => {
      const { result } = renderBrandingForm();
      submit(result);
      await waitFor(() => expect(mockAxios.patch).toHaveBeenCalledWith('/v1/setup', { branding: expect.any(Object) }));
    });

    it('should trim text and save blank languages as null, so the panel falls back on its defaults', async () => {
      const { result } = renderBrandingForm({
        instanceDetails: { en: ' ', fr: ' Détails ' },
        instanceName: { en: ' Name ', fr: '' },
        instanceTagline: { en: '', fr: '' }
      });
      expect(await submitAndCapture(result)).toMatchObject({
        instanceDetails: { en: null, fr: 'Détails' },
        instanceName: { en: 'Name', fr: null },
        instanceTagline: null
      });
    });

    it('should save the logo slots trimmed, and an empty slot as null', async () => {
      const { result } = renderBrandingForm({ customLogoUrl: 'https://example.com/logo.png' });
      act(() => result.current.update('customLogoUrl', ' https://example.com/logo.png '));
      expect(await submitAndCapture(result)).toMatchObject({
        customLogoSrc: null,
        customLogoUrl: 'https://example.com/logo.png'
      });
    });

    it('should save the custom dimensions and colors when the custom options are selected', async () => {
      const { result } = renderBrandingForm({ ...FULL_BRANDING, loginTheme: 'custom', logoSize: 'custom' });
      expect(await submitAndCapture(result)).toMatchObject({
        customLogoHeight: 120,
        customLogoWidth: 240,
        customPrimaryColor: '#111111',
        customSecondaryColor: '#222222'
      });
    });

    it('should drop the custom dimensions and colors when preset options are selected', async () => {
      const { result } = renderBrandingForm(FULL_BRANDING);
      expect(await submitAndCapture(result)).toMatchObject({
        customLogoHeight: null,
        customLogoWidth: null,
        customPrimaryColor: null,
        customSecondaryColor: null
      });
    });

    it('should save the right panel theme with its custom colors only for the custom theme', async () => {
      const { result } = renderBrandingForm({ ...FULL_BRANDING, rightPanelTheme: 'custom' });
      expect(await submitAndCapture(result)).toMatchObject({
        rightPanelPrimaryColor: '#444444',
        rightPanelSecondaryColor: '#555555',
        rightPanelTheme: 'custom'
      });
    });

    it('should save a preset right panel theme without custom colors', async () => {
      const { result } = renderBrandingForm(FULL_BRANDING);
      expect(await submitAndCapture(result)).toMatchObject({
        rightPanelPrimaryColor: null,
        rightPanelSecondaryColor: null,
        rightPanelTheme: 'ocean'
      });
    });

    it('should save the default right panel as no theme', async () => {
      const { result } = renderBrandingForm();
      expect((await submitAndCapture(result)).rightPanelTheme).toBeNull();
    });

    it('should save shown resource links with trimmed hrefs and blank labels as null', async () => {
      const { result } = renderBrandingForm({
        resourceLinks: [
          { href: ' https://a.com ', label: { en: 'A', fr: ' ' } },
          { href: 'https://b.com', label: { fr: 'B' } }
        ],
        showResourceLinks: true
      });
      expect(await submitAndCapture(result)).toMatchObject({
        resourceLinks: [
          { href: 'https://a.com', label: { en: 'A', fr: null } },
          { href: 'https://b.com', label: { en: null, fr: 'B' } }
        ],
        showResourceLinks: true
      });
    });

    it('should save no resource links while the section is hidden, however the rows are filled', async () => {
      const { result } = renderBrandingForm({ resourceLinks: [VALID_LINK], showResourceLinks: false });
      act(() => result.current.addResourceLink());
      act(() => result.current.updateResourceLinkHref(1, 'https://c.com'));
      expect(await submitAndCapture(result)).toMatchObject({ resourceLinks: [], showResourceLinks: false });
    });

    it('should save the resource links section as hidden when it has no links to show', async () => {
      const { result } = renderBrandingForm({ showResourceLinks: true });
      expect((await submitAndCapture(result)).showResourceLinks).toBe(false);
    });
  });

  describe('unsaved changes', () => {
    it('should configure the blocker to resolve through the custom dialog', () => {
      renderBrandingForm();
      expect(blockerOptions().withResolver).toBe(true);
    });

    it('should not block navigation before anything is edited', () => {
      renderBrandingForm();
      expect(blockerOptions().shouldBlockFn()).toBe(false);
      expect(blockerOptions().enableBeforeUnload()).toBe(false);
    });

    it('should block navigation and unload once the form is edited', () => {
      const { result } = renderBrandingForm();
      act(() => result.current.update('enableBranding', true));
      expect(blockerOptions().shouldBlockFn()).toBe(true);
      expect(blockerOptions().enableBeforeUnload()).toBe(true);
    });

    it('should stop blocking navigation once the edits are saved', async () => {
      const { result } = renderBrandingForm();
      act(() => result.current.update('enableBranding', true));
      submit(result);
      await waitFor(() => expect(blockerOptions().shouldBlockFn()).toBe(false));
    });

    it('should keep blocking navigation for an edit made while the save was in flight', async () => {
      let resolvePatch!: () => void;
      mockAxios.patch.mockReturnValue(new Promise<void>((resolve) => (resolvePatch = resolve)));
      const { result } = renderBrandingForm();
      act(() => result.current.update('enableBranding', true));
      submit(result);
      act(() => result.current.update('showLogo', false));
      act(() => resolvePatch());
      await waitFor(() => expect(result.current.isSubmitDisabled).toBe(false));
      expect(blockerOptions().shouldBlockFn()).toBe(true);
    });

    it('should reload the form from the server when it changes and nothing is edited', async () => {
      const { queryClient, result } = renderBrandingForm();
      await receiveServerBranding(queryClient, { loginTheme: 'violet' });
      expect(result.current.form.loginTheme).toBe('violet');
      expect(blockerOptions().shouldBlockFn()).toBe(false);
    });

    it('should keep local edits when the server data changes, so a refetch never discards them', async () => {
      const { queryClient, result } = renderBrandingForm();
      act(() => result.current.update('enableBranding', true));
      await receiveServerBranding(queryClient, { loginTheme: 'violet' });
      expect(result.current.form).toMatchObject({ enableBranding: true, loginTheme: 'slate' });
    });
  });
});
