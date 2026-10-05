import React from 'react';

import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { BulkAssignmentFailure } from '@opendatacapture/schemas/assignment';
import type { Subject } from '@opendatacapture/schemas/subject';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest';

import { useBulkAssignmentWizard } from '@/hooks/useBulkAssignmentWizard';
import type { BulkParseResult } from '@/utils/bulk-assignments';

import { BulkRemoteAssignmentWizard } from '../BulkRemoteAssignmentWizard';
import { MapStep } from '../MapStep';
import { ReviewStep } from '../ReviewStep';
import { SourceStep } from '../SourceStep';
import { TimepointsStep } from '../TimepointsStep';

import type { WizardStep } from '../types';

import '@/services/i18n';

vi.mock('@/hooks/useBulkAssignmentWizard', () => ({ useBulkAssignmentWizard: vi.fn() }));
vi.mock('../MapStep', () => ({ MapStep: vi.fn(() => <div data-testid="map-step" />) }));
vi.mock('../ReviewStep', () => ({ ReviewStep: vi.fn(() => <div data-testid="review-step" />) }));
vi.mock('../SourceStep', () => ({ SourceStep: vi.fn(() => <div data-testid="source-step" />) }));
vi.mock('../TimepointsStep', () => ({ TimepointsStep: vi.fn(() => <div data-testid="timepoints-step" />) }));

type Wizard = ReturnType<typeof useBulkAssignmentWizard>;

const parsed: BulkParseResult = {
  headers: ['subject_id'],
  mapping: { subject_id: 'subjectId' },
  mode: 'ID',
  preview: [{ subject_id: '001' }],
  rows: [{ subject_id: '001' }, { subject_id: '002' }]
};

const subjects: Subject[] = [
  {
    createdAt: new Date(2026, 0, 1),
    groupIds: ['group-1'],
    id: 'Depression_Clinic$001',
    updatedAt: new Date(2026, 0, 1)
  }
];

const instruments = [{ id: 'instrument-1', title: 'Happiness Questionnaire' }];

const timepoints = [
  { expiresAt: '2026-11-01', instrumentId: 'instrument-1', instrumentTitle: 'Happiness Questionnaire' }
];

const assignments = [
  {
    expiresAt: new Date('2026-11-01T23:59:59.999Z'),
    instrumentId: 'instrument-1',
    subjectId: 'Depression_Clinic$0012345678',
    url: 'https://gateway.example.org/assignments/a'
  },
  {
    expiresAt: new Date('2026-11-01T23:59:59.999Z'),
    instrumentId: 'instrument-1',
    subjectId: 'Depression_Clinic$0029876543',
    url: 'https://gateway.example.org/assignments/b'
  }
];

const mockWizard = (step: WizardStep, overrides: Partial<Wizard> = {}): Wizard => {
  const wizard: Wizard = {
    acceptParsed: vi.fn(),
    assignments: [],
    clearCopied: vi.fn(),
    confirmTimepoints: vi.fn(),
    copyLinks: vi.fn(() => Promise.resolve()),
    describeSubject: vi.fn((subjectId: string) => subjectId),
    didCopy: false,
    failure: null,
    goTo: vi.fn(),
    isPreflighting: false,
    isSubmitting: false,
    parsed: null,
    resolveMapping: vi.fn(),
    resultRows: vi.fn(() => []),
    selectSubjects: vi.fn(),
    setSelectedSubjectIds: vi.fn(),
    setTimepoints: vi.fn(),
    step,
    subjectIds: ['Depression_Clinic$001', 'Depression_Clinic$002'],
    submit: vi.fn(),
    timepoints,
    transportError: false,
    ...overrides
  };
  vi.mocked(useBulkAssignmentWizard).mockReturnValue(wizard);
  return wizard;
};

const onBack = vi.fn();

const renderWizard = () =>
  render(
    <BulkRemoteAssignmentWizard
      defaultExpiresAt="2026-11-01"
      groupId="group-1"
      groupName="Depression Clinic"
      instruments={instruments}
      subjectIdDisplayLength={9}
      subjects={subjects}
      onBack={onBack}
    />
  );

const propsOf = <TProps extends object>(component: React.FC<TProps>) => vi.mocked(component).mock.lastCall![0];

describe('BulkRemoteAssignmentWizard', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should build the wizard for the group, its instruments and its identifier display length', () => {
    mockWizard('SOURCE');
    renderWizard();
    expect(useBulkAssignmentWizard).toHaveBeenCalledWith({
      groupId: 'group-1',
      instruments,
      subjectIdDisplayLength: 9
    });
  });

  describe('source step', () => {
    it('should render only the source step while choosing subjects', () => {
      mockWizard('SOURCE');
      renderWizard();
      expect(screen.getByTestId('source-step')).toBeTruthy();
      expect(screen.queryByTestId('map-step')).toBeNull();
      expect(screen.queryByTestId('timepoints-step')).toBeNull();
      expect(screen.queryByTestId('review-step')).toBeNull();
    });

    it('should hand the source step the selection the wizard holds, so stepping back does not discard it', () => {
      const wizard = mockWizard('SOURCE');
      renderWizard();
      expect(propsOf(SourceStep)).toMatchObject({
        onBack,
        onParsed: wizard.acceptParsed,
        onSelectedChange: wizard.setSelectedSubjectIds,
        onStepChange: wizard.goTo,
        onSubjectsSelected: wizard.selectSubjects,
        selectedIds: wizard.subjectIds,
        subjectIdDisplayLength: 9,
        subjects
      });
    });
  });

  describe('map step', () => {
    it('should render nothing for the map step until a file has been parsed', () => {
      mockWizard('MAP');
      renderWizard();
      expect(screen.queryByTestId('map-step')).toBeNull();
    });

    it('should hand the map step the parsed file and the group name it scopes identifiers with', () => {
      const wizard = mockWizard('MAP', { parsed });
      renderWizard();
      expect(propsOf(MapStep)).toMatchObject({ groupName: 'Depression Clinic', onStepChange: wizard.goTo, parsed });
    });

    it('should resolve the mapping against the parsed rows, so each id stays paired with its source row', () => {
      const wizard = mockWizard('MAP', { parsed });
      renderWizard();
      propsOf(MapStep).onResolved(['Depression_Clinic$001', 'Depression_Clinic$002']);
      expect(wizard.resolveMapping).toHaveBeenCalledWith(
        ['Depression_Clinic$001', 'Depression_Clinic$002'],
        parsed.rows
      );
    });

    it('should return to the source step from the map step', () => {
      const wizard = mockWizard('MAP', { parsed });
      renderWizard();
      propsOf(MapStep).onBack();
      expect(wizard.goTo).toHaveBeenCalledWith('SOURCE');
    });
  });

  describe('timepoints step', () => {
    it('should hand the timepoints step the batch it is building and the preflight state', () => {
      const wizard = mockWizard('TIMEPOINTS', { isPreflighting: true });
      renderWizard();
      expect(propsOf(TimepointsStep)).toMatchObject({
        defaultExpiresAt: '2026-11-01',
        instruments,
        isLoading: true,
        onChange: wizard.setTimepoints,
        onConfirm: wizard.confirmTimepoints,
        onStepChange: wizard.goTo,
        subjectCount: 2,
        timepoints
      });
    });

    it('should return to the source step from the timepoints step', () => {
      const wizard = mockWizard('TIMEPOINTS');
      renderWizard();
      propsOf(TimepointsStep).onBack();
      expect(wizard.goTo).toHaveBeenCalledWith('SOURCE');
    });
  });

  describe('review step', () => {
    it('should hand the review step the refusal, submission state and submit handler', () => {
      const failure: BulkAssignmentFailure = {
        code: 'BULK_ASSIGNMENT_REFUSED',
        issues: [{ kind: 'SUBJECT_UNAVAILABLE', subjectIds: ['Depression_Clinic$001'] }]
      };
      const wizard = mockWizard('REVIEW', { failure, isSubmitting: true, transportError: true });
      renderWizard();
      expect(propsOf(ReviewStep)).toMatchObject({
        describeSubject: wizard.describeSubject,
        failure,
        isSubmitting: true,
        onStepChange: wizard.goTo,
        onSubmit: wizard.submit,
        subjectCount: 2,
        timepoints,
        transportError: true
      });
    });

    it('should return to the timepoints step from review', () => {
      const wizard = mockWizard('REVIEW');
      renderWizard();
      propsOf(ReviewStep).onBack();
      expect(wizard.goTo).toHaveBeenCalledWith('TIMEPOINTS');
    });
  });

  describe('done step', () => {
    it('should title the results with how many assignments were created', () => {
      mockWizard('DONE', { assignments });
      renderWizard();
      expect(screen.getByText('2 Assignments Created')).toBeTruthy();
    });

    it('should list each link beside its subject, unscoped and truncated as elsewhere in the app', () => {
      mockWizard('DONE', { assignments });
      renderWizard();
      const rows = [...screen.getByTestId('bulk-done-step').querySelectorAll('tbody tr')];
      expect(
        rows.map((row) => [...row.querySelectorAll('td')].slice(0, 2).map(({ textContent }) => textContent))
      ).toEqual([
        ['001234567', 'https://gateway.example.org/assignments/a'],
        ['002987654', 'https://gateway.example.org/assignments/b']
      ]);
    });

    it('should start a new batch from the source step when the user creates more', () => {
      const wizard = mockWizard('DONE', { assignments });
      renderWizard();
      fireEvent.click(screen.getByTestId('bulk-create-more'));
      expect(wizard.goTo).toHaveBeenCalledWith('SOURCE');
    });

    it('should copy every link at once', () => {
      const wizard = mockWizard('DONE', { assignments });
      renderWizard();
      const copyButton = screen.getByTestId('bulk-copy-links');
      expect(copyButton.textContent).toBe('Copy All Links');
      fireEvent.click(copyButton);
      expect(wizard.copyLinks).toHaveBeenCalledOnce();
    });

    it('should confirm the copy, and reset the confirmation once the pointer leaves the button', () => {
      const wizard = mockWizard('DONE', { assignments, didCopy: true });
      renderWizard();
      const copyButton = screen.getByTestId('bulk-copy-links');
      expect(copyButton.textContent).toBe('Copied');
      fireEvent.mouseLeave(copyButton);
      expect(wizard.clearCopied).toHaveBeenCalledOnce();
    });

    it('should download the result rows as a timestamped CSV and release the object URL afterwards', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 9, 4, 13, 5, 9));
      const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:results');
      const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockReturnValue(undefined);
      const clicked: HTMLAnchorElement[] = [];
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
        clicked.push(this);
      });
      mockWizard('DONE', {
        assignments,
        resultRows: vi.fn(() => [{ Link: 'https://gateway.example.org/assignments/a', Subject: '0012345678' }])
      });
      renderWizard();
      fireEvent.click(screen.getByTestId('bulk-download-csv'));
      expect(clicked).toHaveLength(1);
      expect(clicked[0]!.download).toBe('bulk-remote-assignments-2026-10-04T13-05-09.csv');
      expect(clicked[0]!.href).toBe('blob:results');
      const [blob] = createObjectURL.mock.lastCall!;
      assert(blob instanceof Blob);
      expect(blob.type).toBe('text/csv;charset=utf-8;');
      expect(await blob.text()).toBe('Link,Subject\r\nhttps://gateway.example.org/assignments/a,0012345678');
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:results');
    });
  });
});
