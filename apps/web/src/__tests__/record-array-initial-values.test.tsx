import React, { useMemo, useState } from 'react';

import { Form } from '@douglasneuroinformatics/libui/components';
import type { FormTypes } from '@opendatacapture/runtime-core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod/v4';

// Initialises the shared libui translator, which the form's controls read on render.
import '@/services/i18n';

type Permission = { action: string; subject: string };

// Test scaffolding rather than copy, so it is not translated -- `jsx-no-literals` still applies here.
const FORCE_RENDER_LABEL = 'Force Render';

const $TestFormData = z.object({
  permissions: z.array(z.object({ action: z.string(), subject: z.string() }))
});

const buildFieldset = () =>
  ({
    action: { kind: 'string', label: 'Action', options: { read: 'Read', update: 'Update' }, variant: 'select' },
    subject: { kind: 'string', label: 'Resource', options: { Group: 'Group', User: 'User' }, variant: 'select' }
  }) satisfies FormTypes.RecordArrayField['fieldset'];

/**
 * Exercises the contract the manage-users route depends on: a `record-array` seeded from
 * `initialValues` keeps its records across a re-render only while its `fieldset` holds its
 * identity, which is why the route memoizes that object rather than writing it inline.
 */
const RecordArrayForm = ({
  onSubmit,
  permissions,
  stableFieldset
}: {
  onSubmit: (data: { permissions: Permission[] }) => void;
  permissions: Permission[];
  stableFieldset: boolean;
}) => {
  const [, forceRender] = useState(0);
  const memoizedFieldset = useMemo(buildFieldset, []);
  return (
    <React.Fragment>
      <button type="button" onClick={() => forceRender((count) => count + 1)}>
        {FORCE_RENDER_LABEL}
      </button>
      <Form
        content={{
          permissions: {
            fieldset: stableFieldset ? memoizedFieldset : buildFieldset(),
            kind: 'record-array',
            label: 'Permission'
          }
        }}
        initialValues={{ permissions }}
        validationSchema={$TestFormData}
        onSubmit={onSubmit}
      />
    </React.Fragment>
  );
};

describe('a record-array field seeded from initialValues', () => {
  const permissions: Permission[] = [
    { action: 'read', subject: 'User' },
    { action: 'update', subject: 'Group' }
  ];

  // There are no setup files in this repo, so testing-library's auto-cleanup never runs.
  afterEach(cleanup);

  it('should render one row per seeded record', () => {
    render(<RecordArrayForm stableFieldset permissions={permissions} onSubmit={vi.fn()} />);
    expect(screen.getByText('Permission 1')).toBeTruthy();
    expect(screen.getByText('Permission 2')).toBeTruthy();
  });

  it('should keep the seeded records when its parent re-renders', () => {
    render(<RecordArrayForm stableFieldset permissions={permissions} onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: FORCE_RENDER_LABEL }));
    expect(screen.getByText('Permission 1')).toBeTruthy();
    expect(screen.getByText('Permission 2')).toBeTruthy();
  });

  it('should submit the seeded records unchanged after its parent re-renders', async () => {
    const onSubmit = vi.fn();
    render(<RecordArrayForm stableFieldset permissions={permissions} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: FORCE_RENDER_LABEL }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ permissions }));
  });

  // The hazard the memo exists to avoid: libui resets the field to one blank record whenever the
  // fieldset changes identity, so an inline literal silently discards what the user was shown.
  it('should discard the seeded records when the fieldset changes identity', () => {
    render(<RecordArrayForm permissions={permissions} stableFieldset={false} onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: FORCE_RENDER_LABEL }));
    expect(screen.getByText('Permission 1')).toBeTruthy();
    expect(screen.queryByText('Permission 2')).toBeNull();
  });
});
