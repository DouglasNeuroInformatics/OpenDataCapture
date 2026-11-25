import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_COLLECTED_FILTER } from '@/utils/collected-filter';

import { CollectedFilterMenu } from '../CollectedFilterMenu';

import '@/services/i18n';

describe('CollectedFilterMenu', () => {
  afterEach(() => {
    cleanup();
    i18n.changeLanguage('en');
  });

  it.each([
    [
      'en',
      ['Any time', 'Past week', 'Past month', 'Past 3 months', 'Past 6 months', 'Past year', 'Past 2 years', 'Custom']
    ],
    [
      'es',
      [
        'Cualquier fecha',
        'Última semana',
        'Último mes',
        'Últimos 3 meses',
        'Últimos 6 meses',
        'Último año',
        'Últimos 2 años',
        'Personalizado'
      ]
    ],
    [
      'fr',
      [
        'Toute période',
        'Semaine écoulée',
        'Mois écoulé',
        '3 derniers mois',
        '6 derniers mois',
        'Année écoulée',
        '2 dernières années',
        'Personnalisé'
      ]
    ]
  ] as const)('should label every rolling window accurately in %s', (language, labels) => {
    i18n.changeLanguage(language);
    render(<CollectedFilterMenu testIdPrefix="red" value={DEFAULT_COLLECTED_FILTER} onChange={vi.fn()} />);
    const select = screen.getByTestId<HTMLSelectElement>('red-collected-preset');
    expect(Array.from(select.options, (option) => option.textContent)).toStrictEqual(labels);
    expect(Array.from(select.options, (option) => option.value)).toStrictEqual([
      'all',
      'pastWeek',
      'pastMonth',
      'pastThreeMonths',
      'pastSixMonths',
      'pastYear',
      'pastTwoYears',
      'custom'
    ]);
  });
});
