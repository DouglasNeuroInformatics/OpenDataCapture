import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SettingRows, SettingsCard, SettingToggle } from '../SettingsCard';

import '@/services/i18n';

describe('SettingsCard', () => {
  afterEach(cleanup);

  it('should head each section with its label, in label order rather than the order given', () => {
    render(
      <SettingsCard
        sections={[
          { content: null, label: 'Uploader' },
          { content: null, label: 'Remote Assignments' }
        ]}
      />
    );
    expect(screen.getAllByTestId('settings-section').map((section) => section.textContent)).toStrictEqual([
      'Remote Assignments',
      'Uploader'
    ]);
  });
});

describe('SettingRows', () => {
  afterEach(cleanup);

  it('should list the settings in label order rather than the order given', () => {
    render(
      <SettingRows
        rows={[
          { control: null, help: 'Turns remote assignments on.', label: 'Enable Remote Assignments' },
          { control: null, help: 'How long an assignment stays open.', label: 'Default Assignment Validity' }
        ]}
      />
    );
    expect(screen.getAllByTestId('setting-row').map((row) => row.textContent)).toStrictEqual([
      'Default Assignment Validity',
      'Enable Remote Assignments'
    ]);
  });
});

describe('SettingToggle', () => {
  afterEach(cleanup);

  it('should report the opposite of its state when pressed', () => {
    const onCheckedChange = vi.fn();
    render(<SettingToggle checked label="Enable Uploader" onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Enable Uploader' }));
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });
});
