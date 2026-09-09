import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { SubjectDisplayInfo } from '@opendatacapture/react-core';
import type { AnyUnilingualInstrument } from '@opendatacapture/runtime-core';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { InstrumentSummary } from '../InstrumentSummary';

const baseInstrument = {
  details: { title: 'Stub Form' },
  internal: { edition: 1, name: 'STUB_FORM' },
  kind: 'FORM',
  language: 'en',
  measures: {}
} as unknown as AnyUnilingualInstrument;

describe('InstrumentSummary', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should render nothing for a SERIES instrument', () => {
    const { container } = render(
      <InstrumentSummary data={{}} instrument={{ kind: 'SERIES' } as any} timeCollected={Date.now()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should show the title, language and edition', () => {
    render(<InstrumentSummary data={{}} instrument={baseInstrument} timeCollected={Date.now()} />);
    expect(screen.getByText('Summary of Results for the Stub Form')).toBeTruthy();
    expect(screen.getByText('English')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
  });

  it('should show French as the language for a French instrument', () => {
    const instrument = { ...baseInstrument, language: 'fr' } as unknown as AnyUnilingualInstrument;
    render(<InstrumentSummary data={{}} instrument={instrument} timeCollected={Date.now()} />);
    expect(screen.getByText('French')).toBeTruthy();
  });

  it('should download the data as JSON when the download button is clicked', async () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    render(<InstrumentSummary data={{ answer: 'hello' }} instrument={baseInstrument} timeCollected={Date.now()} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]!);
    await waitFor(() => {
      expect(createObjectURLSpy).toHaveBeenCalled();
    });
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it('should render the language code as-is when it is neither en nor fr', () => {
    const instrument = { ...baseInstrument, language: 'es' } as unknown as AnyUnilingualInstrument;
    render(<InstrumentSummary data={{}} instrument={instrument} timeCollected={Date.now()} />);
    expect(screen.getByText('es')).toBeTruthy();
  });

  it('should fall back to a generic heading when the title is blank', () => {
    const instrument = { ...baseInstrument, details: { title: '  ' } } as unknown as AnyUnilingualInstrument;
    render(<InstrumentSummary data={{}} instrument={instrument} timeCollected={Date.now()} />);
    expect(screen.getByText('Summary of Results')).toBeTruthy();
  });

  it('should hide the action buttons when disableActions is true', () => {
    render(<InstrumentSummary disableActions data={{}} instrument={baseInstrument} timeCollected={Date.now()} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('should print when the print button is clicked', () => {
    const printSpy = vi.fn();
    vi.stubGlobal('print', printSpy);
    render(<InstrumentSummary data={{}} instrument={baseInstrument} timeCollected={Date.now()} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]!);
    expect(printSpy).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });

  it('should show a personal-info subject group with their full name and details', () => {
    const subject: SubjectDisplayInfo = {
      dateOfBirth: new Date('1990-01-01'),
      firstName: 'Jane',
      id: 'subject-1',
      lastName: 'Doe',
      sex: 'FEMALE'
    };
    render(<InstrumentSummary data={{}} instrument={baseInstrument} subject={subject} timeCollected={Date.now()} />);
    expect(screen.getByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText('Female')).toBeTruthy();
  });

  it('should show Anonymous when a personal-info subject has no name, and Male for MALE sex', () => {
    const subject: SubjectDisplayInfo = {
      dateOfBirth: new Date('1990-01-01'),
      firstName: '',
      id: 'subject-1',
      lastName: '',
      sex: 'MALE'
    };
    render(<InstrumentSummary data={{}} instrument={baseInstrument} subject={subject} timeCollected={Date.now()} />);
    expect(screen.getByText('Anonymous')).toBeTruthy();
    expect(screen.getByText('Male')).toBeTruthy();
  });

  it('should show only the scoped-stripped ID for a subject without personal info', () => {
    const subject: SubjectDisplayInfo = {
      dateOfBirth: null,
      firstName: null,
      id: 'root$subject-1',
      lastName: null,
      sex: null
    };
    render(<InstrumentSummary data={{}} instrument={baseInstrument} subject={subject} timeCollected={Date.now()} />);
    expect(screen.getByText('subject-1')).toBeTruthy();
  });

  it('should show a measure whose visibility is explicitly visible, even without displayAllMeasures', () => {
    const instrument = {
      ...baseInstrument,
      measures: { score: { kind: 'const', label: 'Score', ref: 'score', visibility: 'visible' } }
    } as unknown as AnyUnilingualInstrument;
    render(<InstrumentSummary data={{ score: 5 }} instrument={instrument} timeCollected={Date.now()} />);
    expect(screen.getByText('Results')).toBeTruthy();
  });

  it('should hide a measure whose visibility is explicitly hidden', () => {
    const instrument = {
      ...baseInstrument,
      measures: { score: { hidden: true, kind: 'const', label: 'Score', ref: 'score' } }
    } as unknown as AnyUnilingualInstrument;
    render(<InstrumentSummary data={{ score: 5 }} instrument={instrument} timeCollected={Date.now()} />);
    expect(screen.queryByText('Results')).toBeNull();
  });

  it('should show every measure when displayAllMeasures is true', () => {
    const instrument = {
      ...baseInstrument,
      measures: { score: { hidden: true, kind: 'const', label: 'Score', ref: 'score' } }
    } as unknown as AnyUnilingualInstrument;
    render(
      <InstrumentSummary displayAllMeasures data={{ score: 5 }} instrument={instrument} timeCollected={Date.now()} />
    );
    expect(screen.getByText('Results')).toBeTruthy();
  });

  it('should show a measure by default when the instrument declares defaultMeasureVisibility visible', () => {
    const instrument = {
      ...baseInstrument,
      defaultMeasureVisibility: 'visible',
      measures: { score: { kind: 'const', label: 'Score', ref: 'score' } }
    } as unknown as AnyUnilingualInstrument;
    render(<InstrumentSummary data={{ score: 5 }} instrument={instrument} timeCollected={Date.now()} />);
    expect(screen.getByText('Results')).toBeTruthy();
  });
});
