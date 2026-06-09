/* eslint-disable perfectionist/sort-objects */

import React, { useEffect, useState } from 'react';

import { Button, Dialog, Form, Heading, Input, Label, Sheet } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { CopyButton } from '@opendatacapture/react-core';
import type { CreateAssignmentData } from '@opendatacapture/schemas/assignment';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod/v4';

import { InstrumentShowcase } from '@/components/InstrumentShowcase';
import { PageHeader } from '@/components/PageHeader';
import { QRCode } from '@/components/QRCode';
import { WithFallback } from '@/components/WithFallback';
import { useCreateAssignment } from '@/hooks/useCreateAssignment';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useAppStore } from '@/store';

const ONE_YEAR = 31556952000;

/** Slide-over panel shown after an assignment is created, displaying the URL, copy button, and QR code */
const AssignmentResultSlider: React.FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string | undefined;
  url: string | undefined;
}> = ({ isOpen, setIsOpen, title, url }) => {
  const { t } = useTranslation();
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Sheet.Content className="flex h-full flex-col">
        <Sheet.Header>
          <Sheet.Title>{title}</Sheet.Title>
          <Sheet.Description>
            {t({
              en: 'Share this link with the subject to complete the assignment remotely.',
              fr: 'Partagez ce lien avec le client pour compléter la tâche à distance.'
            })}
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Body className="grow">
          <div className="flex flex-col gap-3">
            <Label asChild>
              <a className="hover:underline" href={url} rel="noreferrer" target="_blank">
                {t({
                  en: 'Assignment Link',
                  fr: 'Lien de la tâche'
                })}
              </a>
            </Label>
            <div className="flex gap-2">
              <Input readOnly className="h-9" value={url} />
              <CopyButton size="sm" text={url ?? ''} variant="outline" />
            </div>
            <QRCode url={url ?? 'javascript:void(0)'} />
          </div>
        </Sheet.Body>
        <Sheet.Footer>
          <Button
            className="w-full text-sm"
            label={t('core.close')}
            variant="secondary"
            onClick={() => setIsOpen(false)}
          />
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet>
  );
};

/**
 * Remote assignment page — displays the instrument showcase (same cards as "Administer Instrument")
 * and allows the user to select an instrument to assign remotely to the current session's subject.
 * Requires an active session; redirects to start-session if none exists.
 *
 * @see {@link https://github.com/DouglasNeuroInformatics/OpenDataCapture/issues/1317 | Issue #1317 — Option #2}
 */
const RouteComponent = () => {
  const currentGroup = useAppStore((store) => store.currentGroup);
  const currentSession = useAppStore((store) => store.currentSession);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const instrumentInfoQuery = useInstrumentInfoQuery();
  const createAssignmentMutation = useCreateAssignment();

  const [selectedInstrument, setSelectedInstrument] = useState<TranslatedInstrumentInfo | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResultSliderOpen, setIsResultSliderOpen] = useState(false);
  const [assignmentUrl, setAssignmentUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!currentSession) {
      void navigate({ to: '/session/start-session' });
    }
  }, [currentSession]);

  if (!currentSession) {
    return null;
  }

  return (
    <div data-testid="remote-assignment-page">
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Remote Assignment',
            fr: 'Tâche à distance'
          })}
        </Heading>
      </PageHeader>
      <WithFallback
        Component={InstrumentShowcase}
        props={{
          data: currentGroup
            ? instrumentInfoQuery.data?.filter((instrument) => {
                return currentGroup.accessibleInstrumentIds.includes(instrument.id);
              })
            : instrumentInfoQuery.data,
          onSelect: (instrument) => {
            setSelectedInstrument(instrument);
            setIsCreateModalOpen(true);
          }
        }}
      />
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              {t({
                en: 'Create Remote Assignment',
                fr: 'Créer une tâche à distance'
              })}
            </Dialog.Title>
            <Dialog.Description>
              {t(
                {
                  en: 'Assign "{}" to the current subject for remote completion.',
                  fr: 'Assigner « {} » au client actuel pour complétion à distance.'
                },
                { args: [selectedInstrument?.details.title ?? ''] }
              )}
            </Dialog.Description>
          </Dialog.Header>
          <Form
            suspendWhileSubmitting
            content={{
              expiresAt: {
                kind: 'date',
                label: t({
                  en: 'Expires At',
                  fr: "Date d'expiration"
                })
              }
            }}
            initialValues={{
              expiresAt: new Date(Date.now() + ONE_YEAR)
            }}
            validationSchema={
              z.object({
                expiresAt: z.coerce.date().min(new Date(), {
                  message: t({
                    en: 'Expiry date must be in the future',
                    fr: "La date d'expiration doit être dans le futur"
                  })
                })
              }) satisfies z.ZodType<Pick<CreateAssignmentData, 'expiresAt'>>
            }
            onSubmit={async ({ expiresAt }) => {
              const response = await createAssignmentMutation.mutateAsync({
                data: {
                  expiresAt,
                  groupId: currentGroup?.id,
                  instrumentId: selectedInstrument!.id,
                  subjectId: currentSession.subject!.id
                }
              });
              setAssignmentUrl((response.data as { url?: string }).url);
              setIsCreateModalOpen(false);
              setIsResultSliderOpen(true);
            }}
          />
        </Dialog.Content>
      </Dialog>
      <AssignmentResultSlider
        isOpen={isResultSliderOpen}
        setIsOpen={setIsResultSliderOpen}
        title={selectedInstrument?.details.title}
        url={assignmentUrl}
      />
    </div>
  );
};

export const Route = createFileRoute('/_app/session/remote-assignment')({
  component: RouteComponent
});
