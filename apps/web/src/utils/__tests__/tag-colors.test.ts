import { $AuditLogAction } from '@opendatacapture/schemas/audit';
import { describe, expect, it } from 'vitest';

import {
  getAllGroupsScopeColor,
  getArchiveStatusColor,
  getAssignmentStatusColor,
  getAuditActionColor,
  getGroupTypeColor,
  getInstrumentKindColor,
  getSexColor,
  getSyncStatusColor
} from '../tag-colors';

import type { TagColor } from '../tag-colors';

const CARD_SURFACE = { dark: '#1e293b', light: '#ffffff' };

const luminance = (hex: string) => {
  const [red, green, blue] = [1, 3, 5].map((start) => {
    const channel = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red! + 0.7152 * green! + 0.0722 * blue!;
};

const contrast = (first: string, second: string) => {
  const [darker, lighter] = [luminance(first), luminance(second)].sort((a, b) => a - b);
  return (lighter! + 0.05) / (darker! + 0.05);
};

const MODES = ['dark', 'light'] as const;

const expectReadable = (colors: TagColor[], mode: (typeof MODES)[number]) => {
  for (const color of colors) {
    expect(contrast(color.text, CARD_SURFACE[mode])).toBeGreaterThanOrEqual(4.5);
  }
};

describe('getSexColor', () => {
  it.each(MODES)('should keep the label of every sex readable on a %s card', (mode) => {
    expectReadable([getSexColor('FEMALE', mode), getSexColor('MALE', mode), getSexColor(null, mode)], mode);
  });

  it('should keep the pastel fill in light mode while darkening the text', () => {
    expect(getSexColor('FEMALE', 'light')).toStrictEqual({ fill: '#f9a8d4', text: '#be185d' });
  });
});

describe('getInstrumentKindColor', () => {
  it.each(MODES)('should keep the label of every kind readable on a %s card', (mode) => {
    const kinds = ['FILE', 'FORM', 'INTERACTIVE', 'SERIES'] as const;
    expectReadable(
      kinds.map((kind) => getInstrumentKindColor(kind, mode)),
      mode
    );
  });
});

describe('getSyncStatusColor', () => {
  it.each(MODES)('should keep the label of every status readable on a %s card', (mode) => {
    const statuses = ['FAILED', 'PARTIAL', 'SUCCESS'] as const;
    expectReadable(
      statuses.map((status) => getSyncStatusColor(status, mode)),
      mode
    );
  });
});

describe('getArchiveStatusColor', () => {
  it.each(MODES)('should keep active and archived labels readable on a %s card', (mode) => {
    expectReadable([getArchiveStatusColor(false, mode), getArchiveStatusColor(true, mode)], mode);
  });

  it('should draw archived and active in different colors', () => {
    expect(getArchiveStatusColor(true, 'light').fill).not.toBe(getArchiveStatusColor(false, 'light').fill);
  });
});

describe('getAllGroupsScopeColor', () => {
  it.each(MODES)('should keep the label readable on a %s card', (mode) => {
    expectReadable([getAllGroupsScopeColor(mode)], mode);
  });
});

describe('getAuditActionColor', () => {
  it.each(MODES)('should keep the label of every action readable on a %s card', (mode) => {
    expectReadable(
      $AuditLogAction.options.map((action) => getAuditActionColor(action, mode)),
      mode
    );
  });

  it.each(MODES)('should give every action its own %s fill, so a color names one action', (mode) => {
    const fills = $AuditLogAction.options.map((action) => getAuditActionColor(action, mode).fill);
    expect(new Set(fills).size).toBe(fills.length);
  });
});

describe('getGroupTypeColor', () => {
  it.each(MODES)('should keep the label of each group type readable on a %s card', (mode) => {
    expectReadable([getGroupTypeColor('CLINICAL', mode), getGroupTypeColor('RESEARCH', mode)], mode);
  });

  it('should draw clinical and research groups in different colors', () => {
    expect(getGroupTypeColor('CLINICAL', 'light').fill).not.toBe(getGroupTypeColor('RESEARCH', 'light').fill);
  });
});

describe('getAssignmentStatusColor', () => {
  it.each(MODES)('should keep the label of each status readable on a %s card', (mode) => {
    expectReadable([getAssignmentStatusColor('EXPIRED', mode), getAssignmentStatusColor('OUTSTANDING', mode)], mode);
  });

  it('should draw expired and outstanding assignments in different colors', () => {
    expect(getAssignmentStatusColor('EXPIRED', 'light').fill).not.toBe(
      getAssignmentStatusColor('OUTSTANDING', 'light').fill
    );
  });
});
