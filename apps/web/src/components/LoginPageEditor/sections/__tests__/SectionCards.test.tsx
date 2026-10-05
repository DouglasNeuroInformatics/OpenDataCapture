import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { BrandingConfig, PanelSection } from '@opendatacapture/schemas/setup';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SectionCard } from '../SectionCards';
import { renderWithBrandingEditor } from './SectionCards.harness';

import type { BrandingEditor } from '../../hooks';

import '@/services/i18n';

const UPLOADED_LOGO = 'data:image/png;base64,AAAA';

async function renderSectionCard(section: PanelSection, branding: BrandingConfig = {}) {
  let latestEditor: BrandingEditor | undefined;
  await renderWithBrandingEditor((editor) => {
    latestEditor = editor;
    return <SectionCard editor={editor} section={section} />;
  }, branding);
  return { form: () => latestEditor!.form };
}

function chooseOption(comboboxName: string, optionName: string) {
  fireEvent.click(screen.getByRole('combobox', { name: comboboxName }));
  fireEvent.click(screen.getByRole('option', { name: optionName }));
}

function typeInto(element: HTMLElement, value: string) {
  fireEvent.change(element, { target: { value } });
}

const textbox = (name: string) => screen.getByRole<HTMLInputElement>('textbox', { name });

/** The wrapper around a logo radio and its input, which is dimmed while that source is not in use. */
const logoSlot = (name: string) => screen.getByRole('radio', { name }).parentElement!.parentElement!;

const fileInput = () => document.querySelector<HTMLInputElement>('input[type="file"]')!;

describe('SectionCard', () => {
  beforeEach(() => {
    useNotificationsStore.setState({ notifications: [] });
  });

  afterEach(cleanup);

  it.each<[PanelSection, string]>([
    ['details', 'Details'],
    ['logo', 'Login Image'],
    ['name', 'Instance Name'],
    ['resources', 'Resources'],
    ['tagline', 'Main Description']
  ])('should render the %s card for the %s section', async (section, title) => {
    await renderSectionCard(section);
    expect(screen.getByText(title)).toBeTruthy();
  });

  describe('details', () => {
    it('should hide the details fields while the section is not shown', async () => {
      await renderSectionCard('details', { showDetails: false });
      expect(screen.queryByRole('textbox', { name: 'English' })).toBeNull();
    });

    it('should toggle whether the section is shown', async () => {
      const { form } = await renderSectionCard('details', { showDetails: false });
      fireEvent.click(screen.getByRole('checkbox', { name: 'Show' }));
      expect(form().showDetails).toBe(true);
    });

    it('should toggle whether the details are bold', async () => {
      const { form } = await renderSectionCard('details');
      fireEvent.click(screen.getByRole('checkbox', { name: 'Bold' }));
      expect(form().boldDetails).toBe(true);
    });

    it('should edit the English and French details independently', async () => {
      await renderSectionCard('details');
      typeInto(textbox('English'), 'Notes');
      typeInto(textbox('French'), 'Remarques');
      expect([textbox('English').value, textbox('French').value]).toEqual(['Notes', 'Remarques']);
    });

    it('should set the details font size', async () => {
      const { form } = await renderSectionCard('details');
      chooseOption('Font size', '18 px');
      expect(form().detailsFontSize).toBe(18);
    });
  });

  describe('logo', () => {
    it('should hide the logo fields while the section is not shown', async () => {
      await renderSectionCard('logo', { showLogo: false });
      expect(screen.queryByRole('radiogroup')).toBeNull();
    });

    it('should toggle whether the section is shown', async () => {
      const { form } = await renderSectionCard('logo');
      fireEvent.click(screen.getByRole('checkbox', { name: 'Show' }));
      expect(form().showLogo).toBe(false);
    });

    it('should dim the URL slot while the uploaded image is the active source', async () => {
      await renderSectionCard('logo', { logoSource: 'upload' });
      expect(
        [logoSlot('Uploaded image'), logoSlot('Image URL')].map((slot) => slot.classList.contains('opacity-60'))
      ).toEqual([false, true]);
    });

    it('should dim the upload slot while the URL is the active source', async () => {
      await renderSectionCard('logo', { logoSource: 'url' });
      expect(
        [logoSlot('Uploaded image'), logoSlot('Image URL')].map((slot) => slot.classList.contains('opacity-60'))
      ).toEqual([true, false]);
    });

    it('should switch the active logo source when its radio is picked', async () => {
      const { form } = await renderSectionCard('logo', { logoSource: 'upload' });
      fireEvent.click(screen.getByRole('radio', { name: 'Image URL' }));
      expect(form().logoSource).toBe('url');
    });

    it('should open the file picker when the upload box is clicked', async () => {
      await renderSectionCard('logo');
      const click = vi.spyOn(fileInput(), 'click');
      fireEvent.click(screen.getByRole('button', { name: 'Click to upload' }));
      expect(click).toHaveBeenCalledOnce();
    });

    it('should preview a picked SVG as the uploaded image', async () => {
      await renderSectionCard('logo');
      const svg = new File(['<svg xmlns="http://www.w3.org/2000/svg"/>'], 'logo.svg', { type: 'image/svg+xml' });
      fireEvent.change(fileInput(), { target: { files: [svg] } });
      const preview = await screen.findByAltText<HTMLImageElement>('Logo preview');
      expect(preview.src.startsWith('data:image/svg+xml;base64,')).toBe(true);
    });

    it('should reject a picked file that is not a supported image type', async () => {
      await renderSectionCard('logo');
      const text = new File(['hello'], 'notes.txt', { type: 'text/plain' });
      fireEvent.change(fileInput(), { target: { files: [text] } });
      expect(useNotificationsStore.getState().notifications).toMatchObject([
        { title: 'Unsupported file type', type: 'error' }
      ]);
    });

    it('should clear the input after a pick, so picking the same file again still fires a change', async () => {
      await renderSectionCard('logo');
      const svg = new File(['<svg xmlns="http://www.w3.org/2000/svg"/>'], 'logo.svg', { type: 'image/svg+xml' });
      const setValue = vi.spyOn(fileInput(), 'value', 'set');
      fireEvent.change(fileInput(), { target: { files: [svg] } });
      expect(setValue).toHaveBeenLastCalledWith('');
    });

    it('should offer to replace an uploaded image rather than upload a new one', async () => {
      await renderSectionCard('logo', { customLogoSrc: UPLOADED_LOGO });
      expect(screen.getByRole('button', { name: /Click to replace/ })).toBeTruthy();
    });

    it('should clear the uploaded image when it is removed', async () => {
      const { form } = await renderSectionCard('logo', { customLogoSrc: UPLOADED_LOGO });
      fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
      expect([form().customLogoSrc, screen.queryByAltText('Logo preview')]).toEqual(['', null]);
    });

    it('should not offer to remove an image when none is uploaded', async () => {
      await renderSectionCard('logo');
      expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull();
    });

    it('should edit the logo URL', async () => {
      await renderSectionCard('logo');
      typeInto(textbox('Image URL'), 'https://example.org/logo.png');
      expect(textbox('Image URL').value).toBe('https://example.org/logo.png');
    });

    it('should set the logo size', async () => {
      const { form } = await renderSectionCard('logo');
      chooseOption('Size', 'Large');
      expect(form().logoSize).toBe('large');
    });

    it('should set the logo alignment', async () => {
      const { form } = await renderSectionCard('logo');
      chooseOption('Alignment', 'Center');
      expect(form().logoAlignment).toBe('center');
    });

    it('should hide the custom dimensions for a preset size', async () => {
      await renderSectionCard('logo', { logoSize: 'medium' });
      expect(screen.queryByRole('textbox', { name: 'Width' })).toBeNull();
    });

    it('should keep only the digits typed into the custom width', async () => {
      await renderSectionCard('logo', { logoSize: 'custom' });
      typeInto(textbox('Width'), '1a2b0px');
      expect(textbox('Width').value).toBe('120');
    });

    it('should keep only the digits typed into the custom height', async () => {
      await renderSectionCard('logo', { logoSize: 'custom' });
      typeInto(textbox('Height'), '8-0');
      expect(textbox('Height').value).toBe('80');
    });

    it('should warn when a custom size has no positive dimension', async () => {
      await renderSectionCard('logo', { logoSize: 'custom' });
      expect(screen.getByText('Enter at least one positive value (1–5000).')).toBeTruthy();
    });

    it('should not warn when a custom size has a valid dimension', async () => {
      await renderSectionCard('logo', { customLogoWidth: 200, logoSize: 'custom' });
      expect(screen.queryByText('Enter at least one positive value (1–5000).')).toBeNull();
    });
  });

  describe('name', () => {
    it('should toggle whether the name is bold', async () => {
      const { form } = await renderSectionCard('name');
      fireEvent.click(screen.getByRole('checkbox', { name: 'Bold' }));
      expect(form().boldName).toBe(false);
    });

    it('should edit the English and French names independently', async () => {
      await renderSectionCard('name');
      typeInto(textbox('English'), 'Clinic');
      typeInto(textbox('French'), 'Clinique');
      expect([textbox('English').value, textbox('French').value]).toEqual(['Clinic', 'Clinique']);
    });

    it('should set the name alignment', async () => {
      const { form } = await renderSectionCard('name');
      chooseOption('Alignment', 'Right');
      expect(form().nameAlignment).toBe('right');
    });

    it('should set the name font size', async () => {
      const { form } = await renderSectionCard('name');
      chooseOption('Font size', '32 px');
      expect(form().nameFontSize).toBe(32);
    });
  });

  describe('resources', () => {
    const withLink = (href: string): BrandingConfig => ({
      resourceLinks: [{ href, label: { en: 'Docs', fr: 'Docs' } }],
      showResourceLinks: true
    });

    it('should hide the links while the section is not shown', async () => {
      await renderSectionCard('resources', { showResourceLinks: false });
      expect(screen.queryByRole('button', { name: 'Add link' })).toBeNull();
    });

    it('should toggle whether the section is shown', async () => {
      const { form } = await renderSectionCard('resources');
      fireEvent.click(screen.getByRole('checkbox', { name: 'Show' }));
      expect(form().showResourceLinks).toBe(true);
    });

    it('should toggle whether the links are bold', async () => {
      const { form } = await renderSectionCard('resources');
      fireEvent.click(screen.getByRole('checkbox', { name: 'Bold' }));
      expect(form().boldResourceLinks).toBe(true);
    });

    it('should prompt for a first link when there are none', async () => {
      await renderSectionCard('resources', { showResourceLinks: true });
      expect(screen.getByText('No links yet. Add one to get started.')).toBeTruthy();
    });

    it('should add an empty link', async () => {
      await renderSectionCard('resources', { showResourceLinks: true });
      fireEvent.click(screen.getByRole('button', { name: 'Add link' }));
      expect([screen.getByText('Link 1'), screen.queryByText('No links yet. Add one to get started.')]).toEqual([
        expect.anything(),
        null
      ]);
    });

    it('should remove a link', async () => {
      const { form } = await renderSectionCard('resources', withLink('https://example.org'));
      fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
      expect(form().resourceLinks).toEqual([]);
    });

    it('should edit the English and French labels of a link independently', async () => {
      await renderSectionCard('resources', withLink('https://example.org'));
      typeInto(textbox('Label (English)'), 'Help');
      typeInto(textbox('Label (French)'), 'Aide');
      expect([textbox('Label (English)').value, textbox('Label (French)').value]).toEqual(['Help', 'Aide']);
    });

    it('should edit the URL of a link', async () => {
      await renderSectionCard('resources', withLink('https://example.org'));
      typeInto(textbox('URL'), 'https://example.com/help');
      expect(textbox('URL').value).toBe('https://example.com/help');
    });

    it('should flag a link URL that is not an http(s) address with a domain', async () => {
      await renderSectionCard('resources', withLink('https://example.org'));
      typeInto(textbox('URL'), 'example');
      expect(textbox('URL').getAttribute('aria-invalid')).toBe('true');
    });

    it('should explain why a link URL is invalid', async () => {
      await renderSectionCard('resources', withLink('https://example.org'));
      typeInto(textbox('URL'), 'ftp://example.org');
      expect(screen.getByText(/URL must start with http:\/\/ or https:\/\//)).toBeTruthy();
    });

    it('should accept a valid link URL', async () => {
      await renderSectionCard('resources', withLink('https://example.org'));
      expect(textbox('URL').getAttribute('aria-invalid')).toBe('false');
    });

    it('should not flag a link URL that has not been filled in yet', async () => {
      await renderSectionCard('resources', withLink('https://example.org'));
      typeInto(textbox('URL'), '  ');
      expect(textbox('URL').getAttribute('aria-invalid')).toBe('false');
    });

    it('should set the links font size', async () => {
      const { form } = await renderSectionCard('resources', { showResourceLinks: true });
      chooseOption('Font size', '12 px');
      expect(form().resourceLinksFontSize).toBe(12);
    });
  });

  describe('tagline', () => {
    it('should hide the tagline fields while the section is not shown', async () => {
      await renderSectionCard('tagline', { showTagline: false });
      expect(screen.queryByRole('textbox', { name: 'English' })).toBeNull();
    });

    it('should toggle whether the section is shown', async () => {
      const { form } = await renderSectionCard('tagline');
      fireEvent.click(screen.getByRole('checkbox', { name: 'Show' }));
      expect(form().showTagline).toBe(false);
    });

    it('should toggle whether the tagline is bold', async () => {
      const { form } = await renderSectionCard('tagline');
      fireEvent.click(screen.getByRole('checkbox', { name: 'Bold' }));
      expect(form().boldTagline).toBe(true);
    });

    it('should edit the English and French taglines independently', async () => {
      await renderSectionCard('tagline');
      typeInto(textbox('English'), 'Research data');
      typeInto(textbox('French'), 'Données de recherche');
      expect([textbox('English').value, textbox('French').value]).toEqual(['Research data', 'Données de recherche']);
    });

    it('should set the tagline font size', async () => {
      const { form } = await renderSectionCard('tagline');
      chooseOption('Font size', '24 px');
      expect(form().taglineFontSize).toBe(24);
    });
  });
});
