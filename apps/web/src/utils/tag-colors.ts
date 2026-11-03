import type { InstrumentKind } from '@opendatacapture/runtime-core';
import type { $AuditLogAction } from '@opendatacapture/schemas/audit';
import type { Group } from '@opendatacapture/schemas/group';
import type { Sex } from '@opendatacapture/schemas/subject';

import type { InstrumentRepoSyncStatus } from './instrument-repo-sync';

type Mode = 'dark' | 'light';

/** `fill` colours a tag's dot; `text` colours its label, so it has to hold 4.5:1 against a card. */
type TagColor = {
  fill: string;
  text: string;
};

type TagHue = { [K in Mode]: TagColor };

type GroupType = Group['type'];

const GREEN = {
  dark: { fill: '#22c55e', text: '#86efac' },
  light: { fill: '#16a34a', text: '#15803d' }
} as const satisfies TagHue;

const RED = {
  dark: { fill: '#ef4444', text: '#fca5a5' },
  light: { fill: '#dc2626', text: '#b91c1c' }
} as const satisfies TagHue;

const AMBER = {
  dark: { fill: '#f59e0b', text: '#fcd34d' },
  light: { fill: '#d97706', text: '#b45309' }
} as const satisfies TagHue;

const BLUE = {
  dark: { fill: '#3b82f6', text: '#93c5fd' },
  light: { fill: '#2563eb', text: '#1d4ed8' }
} as const satisfies TagHue;

const YELLOW = {
  dark: { fill: '#eab308', text: '#fde047' },
  light: { fill: '#ca8a04', text: '#a16207' }
} as const satisfies TagHue;

const VIOLET = {
  dark: { fill: '#8b5cf6', text: '#c4b5fd' },
  light: { fill: '#7c3aed', text: '#6d28d9' }
} as const satisfies TagHue;

const CYAN = {
  dark: { fill: '#06b6d4', text: '#67e8f9' },
  light: { fill: '#0891b2', text: '#0e7490' }
} as const satisfies TagHue;

const TEAL = {
  dark: { fill: '#14b8a6', text: '#5eead4' },
  light: { fill: '#0d9488', text: '#0f766e' }
} as const satisfies TagHue;

const NEUTRAL = {
  dark: { fill: '#a3a3a3', text: '#a3a3a3' },
  light: { fill: '#525252', text: '#525252' }
} as const satisfies TagHue;

/**
 * Baby pink for female, baby blue for male.
 *
 * Asked for by name, so these sit outside the validated categorical palette, and one fill serves both
 * modes because a pastel reads well against the dark surface as-is. Against the light surface both
 * are near 1.6:1, far under the 3:1 a mark would normally need — which is why `ColorTag` rings the
 * dot, and why light-mode text swaps to a darker shade of the same hue.
 */
const SEX_HUES = {
  FEMALE: {
    dark: { fill: '#f9a8d4', text: '#f9a8d4' },
    light: { fill: '#f9a8d4', text: '#be185d' }
  },
  MALE: {
    dark: { fill: '#89cff0', text: '#89cff0' },
    light: { fill: '#89cff0', text: '#0369a1' }
  }
} as const satisfies { [K in Sex]: TagHue };

/**
 * One named hue per instrument kind, held here rather than taken from the chart palette: the palette
 * is a per-user chart setting, and choosing one must not recolour a table's kind column.
 */
const INSTRUMENT_KIND_HUES = {
  FILE: GREEN,
  FORM: BLUE,
  INTERACTIVE: RED,
  SERIES: YELLOW
} as const satisfies { [K in InstrumentKind]: TagHue };

const SYNC_STATUS_HUES = {
  FAILED: RED,
  PARTIAL: AMBER,
  SUCCESS: GREEN
} as const satisfies { [K in InstrumentRepoSyncStatus]: TagHue };

const AUDIT_ACTION_HUES = {
  ARCHIVE: AMBER,
  CREATE: GREEN,
  DELETE: RED,
  LOGIN: VIOLET,
  SEND_EMAIL: CYAN,
  UNARCHIVE: TEAL,
  UPDATE: BLUE
} as const satisfies { [K in $AuditLogAction]: TagHue };

const GROUP_TYPE_HUES = {
  CLINICAL: BLUE,
  RESEARCH: VIOLET
} as const satisfies { [K in GroupType]: TagHue };

function getSexColor(sex: null | string, mode: Mode): TagColor {
  if (sex === 'FEMALE' || sex === 'MALE') {
    return SEX_HUES[sex][mode];
  }
  return NEUTRAL[mode];
}

function getInstrumentKindColor(kind: InstrumentKind, mode: Mode): TagColor {
  return INSTRUMENT_KIND_HUES[kind][mode];
}

function getSyncStatusColor(status: InstrumentRepoSyncStatus, mode: Mode): TagColor {
  return SYNC_STATUS_HUES[status][mode];
}

function getArchiveStatusColor(isArchived: boolean, mode: Mode): TagColor {
  return (isArchived ? RED : GREEN)[mode];
}

/** Amber, because a grant across all groups is wider than a grant to one and worth noticing. */
function getAllGroupsScopeColor(mode: Mode): TagColor {
  return AMBER[mode];
}

function getAuditActionColor(action: $AuditLogAction, mode: Mode): TagColor {
  return AUDIT_ACTION_HUES[action][mode];
}

function getAssignmentStatusColor(status: 'EXPIRED' | 'OUTSTANDING', mode: Mode): TagColor {
  return (status === 'EXPIRED' ? AMBER : BLUE)[mode];
}

function getGroupTypeColor(type: GroupType, mode: Mode): TagColor {
  return GROUP_TYPE_HUES[type][mode];
}

export type { TagColor };
export {
  getAllGroupsScopeColor,
  getArchiveStatusColor,
  getAssignmentStatusColor,
  getAuditActionColor,
  getGroupTypeColor,
  getInstrumentKindColor,
  getSexColor,
  getSyncStatusColor
};
