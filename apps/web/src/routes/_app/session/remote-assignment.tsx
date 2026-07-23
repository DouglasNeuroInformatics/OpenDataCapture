import React, { useEffect, useState } from 'react';

import { toBasicISOString } from '@douglasneuroinformatics/libjs';
import { Button, Dialog, Heading, Input, Label, Sheet } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { CopyButton } from '@opendatacapture/react-core';
import type { TranslatedInstrumentInfo } from '@opendatacapture/schemas/instrument';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { AssignmentEmailForm } from '@/components/AssignmentEmailForm';
import { InstrumentShowcase } from '@/components/InstrumentShowcase';
import { PageHeader } from '@/components/PageHeader';
import { QRCode } from '@/components/QRCode';
import { WithFallback } from '@/components/WithFallback';
import { useCreateAssignment } from '@/hooks/useCreateAssignment';
import { useInstrumentInfoQuery } from '@/hooks/useInstrumentInfoQuery';
import { useAppStore } from '@/store';

const ONE_YEAR = 31556952000;

const CreateAssignmentForm: React.FC<{
  isPending: boolean;
  onSubmit: (expiresAt: Date) => Promise<void>;
}> = ({ isPending, onSubmit }) => {
  const { t } = useTranslation();
  const [expiresAt, setExpiresAt] = useState(toBasicISOString(new Date(Date.now() + ONE_YEAR)));
  const [error, setError] = useState<null | string>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const date = new Date(expiresAt);
    if (isNaN(date.getTime()) || date <= new Date()) {
      setError(
        t({
          en: 'Expiry date must be a valid date in the future',
          es: 'La fecha de expiración debe ser una fecha válida en el futuro',
          fr: "La date d'expiration doit être une date valide dans le futur"
        })
      );
      return;
    }
    setError(null);
    void onSubmit(date);
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="expires-at">
          {t({ en: 'Expires At', es: 'Fecha de expiración', fr: "Date d'expiration" })}
        </Label>
        <Input
          id="expires-at"
          placeholder="YYYY-MM-DD"
          type="text"
          value={expiresAt}
          onChange={(event) => {
            setExpiresAt(event.target.value);
            setError(null);
          }}
        />
        {error && <p className="text-destructive text-xs font-medium">{error}</p>}
      </div>
      <Button className="w-full" disabled={isPending} type="submit" variant="primary">
        {isPending
          ? t({ en: 'Creating…', es: 'Creando…', fr: 'Création…' })
          : t({ en: 'Submit', es: 'Enviar', fr: 'Soumettre' })}
      </Button>
    </form>
  );
};

/** Slide-over panel shown after an assignment is created, displaying the URL, copy button, and QR code */
const AssignmentResultSlider: React.FC<{
  assignmentId: string | undefined;
  instrumentLanguages?: string[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string | undefined;
  url: string | undefined;
}> = ({ assignmentId, instrumentLanguages, isOpen, setIsOpen, title, url }) => {
  const { t } = useTranslation();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Sheet.Content className="flex h-full flex-col">
        <Sheet.Header>
          <Sheet.Title>{title}</Sheet.Title>
          <Sheet.Description>
            {t({
              en: 'Share this link with the subject to complete the assignment remotely. If the link is lost, it can be found by navigating to View Current Subject, selecting the Assignments tab, and clicking on the assignment.',
              es: 'Comparta este enlace con el sujeto para completar la tarea de forma remota. Si el enlace se pierde, puede encontrarlo navegando a Ver sujeto actual, seleccionando la pestaña Tareas y haciendo clic en la tarea.',
              fr: "Partagez ce lien avec le client pour compléter la tâche à distance. Si le lien est perdu, il peut être retrouvé en naviguant vers Voir le client actuel, en sélectionnant l'onglet Tâches, puis en cliquant sur la tâche."
            })}
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Body className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3">
            <Label asChild>
              <a className="hover:underline" href={url} rel="noreferrer" target="_blank">
                {t({
                  en: 'Assignment Link',
                  es: 'Enlace de la tarea',
                  fr: 'Lien de la tâche'
                })}
              </a>
            </Label>
            <div className="flex gap-2">
              <Input readOnly className="h-9" value={url} />
              <CopyButton size="sm" text={url ?? ''} variant="outline" />
            </div>
            <QRCode url={url ?? 'javascript:void(0)'} />
            <AssignmentEmailForm assignmentId={assignmentId} instrumentLanguages={instrumentLanguages} />
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

  const [selectedInstrument, setSelectedInstrument] = useState<null | TranslatedInstrumentInfo>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResultSliderOpen, setIsResultSliderOpen] = useState(false);
  const [assignmentUrl, setAssignmentUrl] = useState<string | undefined>(undefined);
  const [assignmentId, setAssignmentId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!currentSession) {
      void navigate({ to: '/session/start-session' });
    }
  }, [currentSession]);

  useEffect(() => {
    const input = document.querySelector<HTMLInputElement>('[data-testid="instrument-search-bar"] input');
    input?.focus();
  }, []);

  if (!currentSession) {
    return null;
  }

  return (
    <div data-testid="remote-assignment-page">
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Remote Assignment',
            es: 'Tarea remota',
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
                es: 'Crear tarea remota',
                fr: 'Créer une tâche à distance'
              })}
            </Dialog.Title>
            <Dialog.Description>
              {t(
                {
                  en: 'Assign "{}" to the current subject for remote completion.',
                  es: 'Asignar "{}" al sujeto actual para completar de forma remota.',
                  fr: 'Assigner « {} » au client actuel pour complétion à distance.'
                },
                { args: [selectedInstrument?.details.title ?? ''] }
              )}
            </Dialog.Description>
          </Dialog.Header>
          <CreateAssignmentForm
            isPending={createAssignmentMutation.isPending}
            onSubmit={async (expiresAt) => {
              const assignment = await createAssignmentMutation.mutateAsync({
                data: {
                  expiresAt,
                  groupId: currentGroup?.id,
                  instrumentId: selectedInstrument!.id,
                  subjectId: currentSession.subjectId
                }
              });
              setAssignmentUrl(assignment.url);
              setAssignmentId(assignment.id);
              setIsCreateModalOpen(false);
              setIsResultSliderOpen(true);
            }}
          />
        </Dialog.Content>
      </Dialog>
      <AssignmentResultSlider
        assignmentId={assignmentId}
        instrumentLanguages={selectedInstrument?.supportedLanguages}
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
