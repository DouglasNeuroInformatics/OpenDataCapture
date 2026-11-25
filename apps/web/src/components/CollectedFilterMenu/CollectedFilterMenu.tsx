import React from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { selectCollectedPreset } from '@/utils/collected-filter';
import type { CollectedFilter, CollectedPreset } from '@/utils/collected-filter';

type CollectedFilterMenuProps = {
  onChange: (next: CollectedFilter) => void;
  /** Prefixed onto each control's `data-testid`, so two tables on different pages stay addressable */
  testIdPrefix: string;
  value: CollectedFilter;
};

/**
 * The collection-date window control, shared by the subject and instrument listings so both narrow
 * by date the same way.
 */
export const CollectedFilterMenu = ({ onChange, testIdPrefix, value }: CollectedFilterMenuProps) => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <div className="relative flex items-center justify-between gap-1 rounded-xs px-2 pt-1.5 pb-1 text-sm transition-colors">
        <span className="pb-1">{t({ en: 'Collected:', es: 'Recopilado:', fr: 'Collecté :' })}</span>
        {/* A native select renders with the user agent's own white background, which reads as a
            bright block in dark mode — so it carries the popover surface tokens explicitly, and
            the options do too, since those are painted separately. */}
        <select
          className="bg-popover text-foreground [&>option]:bg-popover [&>option]:text-foreground pointer-events-auto rounded-sm border-b pb-0.5"
          data-testid={`${testIdPrefix}-collected-preset`}
          value={value.preset}
          onChange={(event) => onChange(selectCollectedPreset(event.target.value as CollectedPreset, value))}
        >
          <option value="all">{t({ en: 'Any time', es: 'Cualquier fecha', fr: 'Toute période' })}</option>
          <option value="pastWeek">{t({ en: 'Past week', es: 'Última semana', fr: 'Semaine écoulée' })}</option>
          <option value="pastMonth">{t({ en: 'Past month', es: 'Último mes', fr: 'Mois écoulé' })}</option>
          <option value="pastThreeMonths">
            {t({ en: 'Past 3 months', es: 'Últimos 3 meses', fr: '3 derniers mois' })}
          </option>
          <option value="pastSixMonths">
            {t({ en: 'Past 6 months', es: 'Últimos 6 meses', fr: '6 derniers mois' })}
          </option>
          <option value="pastYear">{t({ en: 'Past year', es: 'Último año', fr: 'Année écoulée' })}</option>
          <option value="pastTwoYears">
            {t({ en: 'Past 2 years', es: 'Últimos 2 años', fr: '2 dernières années' })}
          </option>
          <option value="custom">{t({ en: 'Custom', es: 'Personalizado', fr: 'Personnalisé' })}</option>
        </select>
      </div>
      {value.preset === 'custom' && (
        <React.Fragment>
          <div className="relative flex items-center justify-between gap-1 rounded-xs px-2 pt-1.5 pb-1 text-sm transition-colors">
            <span className="pb-1">{t({ en: 'Min:', es: 'Mín.:', fr: 'Min :' })}</span>
            <input
              className="bg-popover text-foreground pointer-events-auto rounded-sm border-b pb-0.5"
              data-testid={`${testIdPrefix}-collected-min`}
              type="date"
              value={value.min ? toBasicISOString(value.min) : ''}
              onChange={(event) => onChange({ ...value, min: event.target.valueAsDate })}
            />
          </div>
          <div className="relative flex items-center justify-between gap-1 rounded-xs px-2 pt-1.5 pb-1 text-sm transition-colors">
            <span className="pb-1">{t({ en: 'Max:', es: 'Máx.:', fr: 'Max :' })}</span>
            <input
              className="bg-popover text-foreground pointer-events-auto rounded-sm border-b pb-0.5"
              data-testid={`${testIdPrefix}-collected-max`}
              type="date"
              value={value.max ? toBasicISOString(value.max) : ''}
              onChange={(event) => onChange({ ...value, max: event.target.valueAsDate })}
            />
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};
