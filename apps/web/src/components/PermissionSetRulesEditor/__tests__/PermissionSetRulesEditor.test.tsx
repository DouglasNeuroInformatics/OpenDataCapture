import { useState } from 'react';

import type { PermissionSetRule } from '@opendatacapture/schemas/permission-set';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PermissionSetRulesEditor } from '@/components/PermissionSetRulesEditor/PermissionSetRulesEditor';
import { createRuleDraft } from '@/utils/permission-set-rules';
import type { PermissionSetRuleDraft } from '@/utils/permission-set-rules';

import '@/services/i18n';

const onRulesChange = vi.fn();
const onDraftsChange = vi.fn();

const RULES: PermissionSetRule[] = [
  { action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' },
  { action: 'read', scope: 'ALL_GROUPS', subject: 'Instrument' }
];

const Editor = ({
  highlightIncomplete,
  rules = RULES
}: {
  highlightIncomplete?: boolean;
  rules?: PermissionSetRule[];
}) => {
  const [currentRules, setRules] = useState(rules);
  const [drafts, setDrafts] = useState<PermissionSetRuleDraft[]>([createRuleDraft()]);
  return (
    <PermissionSetRulesEditor
      drafts={drafts}
      highlightIncomplete={highlightIncomplete}
      rules={currentRules}
      onDraftsChange={(drafts) => {
        setDrafts(drafts);
        onDraftsChange(drafts);
      }}
      onRulesChange={(rules) => {
        setRules(rules);
        onRulesChange(rules);
      }}
    />
  );
};

/** Opens one of the add-row selects from the keyboard, since happy-dom dispatches no pointer capture. */
const choose = (field: 'action' | 'scope' | 'subject', value: string, rowIndex = 0) => {
  fireEvent.keyDown(screen.getAllByTestId(`rule-${field}-select-trigger`)[rowIndex]!, { key: 'Enter' });
  fireEvent.click(screen.getByTestId(`rule-${field}-select-item-${value}`));
};

/** The options an add-row select offers, read off its open list. */
const optionsOf = (field: 'action' | 'subject') => {
  fireEvent.keyDown(screen.getByTestId(`rule-${field}-select-trigger`), { key: 'Enter' });
  return screen
    .getAllByTestId(new RegExp(`^rule-${field}-select-item-`))
    .map((item) => item.dataset.testid!.replace(`rule-${field}-select-item-`, ''));
};

describe('PermissionSetRulesEditor', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should list every rule with where it applies', () => {
    render(<Editor />);
    expect(screen.getAllByTestId('permission-set-rule-row')).toHaveLength(2);
    expect(screen.getAllByTestId('permission-set-rule-scope').map((cell) => cell.textContent)).toEqual([
      "Holder's groups",
      'Every group'
    ]);
  });

  it('should stage the removal of a rule without touching the others', () => {
    render(<Editor />);
    fireEvent.click(screen.getAllByTestId('permission-set-rule-remove')[0]!);
    expect(onRulesChange).toHaveBeenCalledWith([RULES[1]]);
  });

  it("should stage a complete row confined to the holder's groups unless another scope is chosen", () => {
    render(<Editor />);
    choose('action', 'read');
    choose('subject', 'Session');
    expect(onDraftsChange.mock.lastCall?.[0]).toEqual([{ action: 'read', scope: 'HOLDER_GROUPS', subject: 'Session' }]);
    choose('scope', 'ALL_GROUPS');
    expect(onDraftsChange.mock.lastCall?.[0]).toEqual([{ action: 'read', scope: 'ALL_GROUPS', subject: 'Session' }]);
  });

  it('should offer no scope until a resource is chosen', () => {
    render(<Editor />);
    expect(screen.queryByTestId('rule-scope-select-trigger')).toBeNull();
  });

  it('should fix the scope to every group for a resource no group owns', () => {
    render(<Editor />);
    choose('subject', 'Instrument');
    expect(screen.queryByTestId('rule-scope-select-trigger')).toBeNull();
    expect(screen.getByTestId('rule-scope-fixed').textContent).toBe('Every group');
  });

  it('should never offer manage on all, which would make every holder an administrator', () => {
    render(<Editor />);
    choose('action', 'manage');
    expect(optionsOf('subject')).not.toContain('all');
  });

  it('should offer only read once User is chosen, since every route that writes a user is admin-only', () => {
    render(<Editor />);
    choose('subject', 'User');
    expect(optionsOf('action')).toEqual(['read']);
  });

  it('should leave the other rows untouched when one changes', () => {
    render(<Editor />);
    fireEvent.click(screen.getByTestId('rule-draft-add'));
    choose('action', 'create', 1);
    expect(onDraftsChange.mock.lastCall?.[0]).toEqual([
      { scope: 'HOLDER_GROUPS' },
      { action: 'create', scope: 'HOLDER_GROUPS' }
    ]);
  });

  it('should offer a fresh row once the last one is removed', () => {
    render(<Editor />);
    fireEvent.click(screen.getByTestId('rule-draft-remove'));
    expect(screen.queryAllByTestId('add-rule-row')).toHaveLength(0);
    fireEvent.click(screen.getByTestId('rule-draft-add'));
    expect(screen.getAllByTestId('add-rule-row')).toHaveLength(1);
    expect(onRulesChange).not.toHaveBeenCalled();
  });

  it('should flag a started but unfinished row once a save has been refused', () => {
    render(<Editor highlightIncomplete />);
    expect(screen.queryByTestId('rule-drafts-incomplete')).toBeNull();
    choose('action', 'read');
    expect(screen.getByTestId('add-rule-row').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByTestId('rule-drafts-incomplete')).toBeTruthy();
  });

  it('should not flag an unfinished row before any save is attempted', () => {
    render(<Editor />);
    choose('action', 'read');
    expect(screen.getByTestId('add-rule-row').getAttribute('aria-invalid')).toBeNull();
  });

  it('should list the rules alone when read-only, with nothing to add or remove', () => {
    render(<PermissionSetRulesEditor readOnly rules={RULES} />);
    expect(screen.getAllByTestId('permission-set-rule-row')).toHaveLength(2);
    expect(screen.queryByTestId('permission-set-rule-remove')).toBeNull();
    expect(screen.queryByTestId('add-rule-row')).toBeNull();
    expect(screen.queryByTestId('rule-draft-add')).toBeNull();
  });
});
