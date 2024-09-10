import { replacer, toBasicISOString } from '@douglasneuroinformatics/libjs';
import { Button, Heading, Separator } from '@douglasneuroinformatics/libui/components';
import { useDownload, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { computeInstrumentMeasures } from '@opendatacapture/instrument-utils';
import { CopyButton } from '@opendatacapture/react-core';
import type { AnyUnilingualInstrument } from '@opendatacapture/runtime-core';
import { isSubjectWithPersonalInfo, removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { filter } from 'lodash-es';
import { DownloadIcon, PrinterIcon } from 'lucide-react';

import { InstrumentSummaryGroup } from './InstrumentSummaryGroup';

import type { SubjectDisplayInfo } from '../../types';

export type InstrumentSummaryProps = {
  data: any;
  instrument: AnyUnilingualInstrument;
  subject?: SubjectDisplayInfo;
  timeCollected: number;
};

export const InstrumentSummary = ({ data, instrument, subject, timeCollected }: InstrumentSummaryProps) => {
  const download = useDownload();
  const { resolvedLanguage, t } = useTranslation();

  if (instrument.kind === 'SERIES') {
    return null;
  }

  const computedMeasures = filter(computeInstrumentMeasures(instrument, data), (_, key) => {
    return !instrument.measures?.[key]!.hidden;
  });

  const handleDownload = () => {
    const filename = `${instrument.internal.name}_${instrument.internal.edition}_${new Date(timeCollected).toISOString()}.json`;
    void download(filename, () => JSON.stringify(data, replacer, 2));
  };

  let language: string;
  if (instrument.language === 'en') {
    language = t({
      en: 'English',
      fr: 'Anglais'
    });
  } else if (instrument.language === 'fr') {
    language = t({
      en: 'French',
      fr: 'Français'
    });
  } else {
    language = instrument.language;
  }

  const copyText = Object.values(computedMeasures)
    .map(({ label, value }) => `${label}: ${value?.toString() ?? 'NA'}`)
    .join('\n');

  const results = Object.values(computedMeasures);

  const dateCompleted = new Date().toLocaleString(resolvedLanguage, {
    dateStyle: 'long',
    timeStyle: 'long'
  });

  return (
    <div className="print:bg-primary-foreground space-y-6 print:fixed print:left-0 print:top-0 print:z-50 print:h-screen print:w-screen">
      <div className="flex">
        <div className="flex-grow">
          <Heading variant="h4">
            {instrument.details.title.trim()
              ? t({
                  en: `Summary of Results for the ${instrument.details.title}`,
                  fr: `${instrument.details.title} : résumé des résultats`
                })
              : t({
                  en: 'Summary of Results',
                  fr: 'Résumé des résultats'
                })}
          </Heading>
          <p className="text-muted-foreground text-sm">
            {t({
              en: `Completed on ${dateCompleted}`,
              fr: `Remplie le ${dateCompleted}`
            })}
          </p>
        </div>
        <div className="hidden sm:flex sm:items-center sm:gap-1 print:hidden">
          <CopyButton text={copyText} variant="ghost" />
          <Button size="icon" type="button" variant="ghost" onClick={handleDownload}>
            <DownloadIcon />
          </Button>
          <Button size="icon" type="button" variant="ghost" onClick={print}>
            <PrinterIcon />
          </Button>
        </div>
      </div>
      <Separator />
      {subject && (
        <InstrumentSummaryGroup
          items={
            isSubjectWithPersonalInfo(subject)
              ? [
                  {
                    label: 'ID',
                    value: subject.id
                  },
                  {
                    label: t({
                      en: 'Full Name',
                      fr: 'Nom et prénom'
                    }),
                    value:
                      subject?.firstName && subject.lastName
                        ? `${subject.firstName} ${subject.lastName}`
                        : t({
                            en: 'Anonymous',
                            fr: 'Anonyme'
                          })
                  },
                  {
                    label: t({
                      en: 'Date of Birth',
                      fr: 'Date de naissance'
                    }),
                    value: subject.dateOfBirth ? toBasicISOString(subject.dateOfBirth) : null
                  },
                  {
                    label: t({
                      en: 'Sex at Birth',
                      fr: 'Sexe à la naissance'
                    }),
                    value:
                      subject.sex === 'MALE'
                        ? t({
                            en: 'Male',
                            fr: 'Masculin'
                          })
                        : subject.sex === 'FEMALE'
                          ? t({
                              en: 'Female',
                              fr: 'Féminin'
                            })
                          : null
                  }
                ]
              : [
                  {
                    label: 'ID',
                    value: removeSubjectIdScope(subject.id)
                  }
                ]
          }
          title={t({
            en: 'Subject',
            fr: 'Client'
          })}
        />
      )}
      <InstrumentSummaryGroup
        items={[
          {
            label: t({
              en: 'Title',
              fr: 'Titre'
            }),
            value: instrument.details.title
          },
          {
            label: t({
              en: 'Language',
              fr: 'Langue'
            }),
            value: language
          },
          {
            label: t({
              en: 'Edition',
              fr: 'Édition'
            }),
            value: instrument.internal.edition
          }
        ]}
        title={t({
          en: 'Instrument',
          fr: 'Instrument'
        })}
      />
      {results.length > 0 && (
        <InstrumentSummaryGroup
          items={results}
          title={t({
            en: 'Results',
            fr: 'Résultats'
          })}
        />
      )}
    </div>
  );
};
