import type { ComponentProps } from 'react';

import type { PanelSection, SetupState } from '@opendatacapture/schemas/setup';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SETUP_STATE_QUERY_KEY } from '@/hooks/useSetupStateQuery';

import { useBrandingForm } from '../../hooks';
import { SectionHeader } from '../SectionHeader';

import '@/services/i18n';

vi.mock('axios', () => ({ default: { get: vi.fn(), patch: vi.fn() } }));

vi.mock('@tanstack/react-router', () => ({ useBlocker: vi.fn(() => ({ status: 'idle' })) }));

type HeaderOptions = Partial<Omit<ComponentProps<typeof SectionHeader>, 'editor' | 'section'>>;

const SETUP_STATE: SetupState = {
  activeLanguages: ['en'],
  branding: null,
  isDemo: false,
  isGatewayEnabled: false,
  isSetup: true,
  release: { buildTime: 0, type: 'production', version: '1.0.0' },
  uptime: 0
};

const SectionHeaderHost = ({ options, section }: { options: HeaderOptions; section: PanelSection }) => {
  const editor = useBrandingForm();
  return (
    <>
      <SectionHeader description="Section description" editor={editor} section={section} title="Section" {...options} />
      <output data-testid="sections-order">{editor.form.sectionsOrder.join(',')}</output>
    </>
  );
};

function renderSectionHeader(section: PanelSection, options: HeaderOptions = {}) {
  const queryClient = new QueryClient();
  queryClient.setQueryData([SETUP_STATE_QUERY_KEY], SETUP_STATE);
  render(
    <QueryClientProvider client={queryClient}>
      <SectionHeaderHost options={options} section={section} />
    </QueryClientProvider>
  );
}

const moveUpButton = () => screen.getByRole<HTMLButtonElement>('button', { name: 'Move up' });
const moveDownButton = () => screen.getByRole<HTMLButtonElement>('button', { name: 'Move down' });
const sectionsOrder = () => screen.getByTestId('sections-order').textContent;

describe('SectionHeader', () => {
  afterEach(cleanup);

  it('should render the title and description', () => {
    renderSectionHeader('name');
    expect(screen.getByText('Section')).toBeTruthy();
    expect(screen.getByText('Section description')).toBeTruthy();
  });

  it('should disable Move up for the first section, since it cannot go higher', () => {
    renderSectionHeader('logo');
    expect(moveUpButton().disabled).toBe(true);
    expect(moveDownButton().disabled).toBe(false);
  });

  it('should disable Move down for the last section, since it cannot go lower', () => {
    renderSectionHeader('resources');
    expect(moveDownButton().disabled).toBe(true);
    expect(moveUpButton().disabled).toBe(false);
  });

  it('should swap the section with the one above it when moved up', () => {
    renderSectionHeader('name');
    fireEvent.click(moveUpButton());
    expect(sectionsOrder()).toBe('name,logo,tagline,details,resources');
  });

  it('should swap the section with the one below it when moved down', () => {
    renderSectionHeader('name');
    fireEvent.click(moveDownButton());
    expect(sectionsOrder()).toBe('logo,tagline,name,details,resources');
  });

  it('should omit the Show and Bold toggles when they are not configured', () => {
    renderSectionHeader('name');
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('should report the toggled value of the Show checkbox', () => {
    const onChange = vi.fn();
    renderSectionHeader('name', { show: { checked: false, id: 'show-name', onChange } });
    fireEvent.click(screen.getByText('Show'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should report the cleared value of a checked Show checkbox', () => {
    const onChange = vi.fn();
    renderSectionHeader('name', { show: { checked: true, id: 'show-name', onChange } });
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('should render the Bold toggle when configured', () => {
    const onChange = vi.fn();
    renderSectionHeader('name', { bold: { checked: false, id: 'bold-name', onChange } });
    fireEvent.click(screen.getByText('Bold'));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
