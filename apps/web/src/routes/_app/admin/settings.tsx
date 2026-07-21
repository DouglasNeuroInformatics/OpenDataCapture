import React, { useState } from 'react';

import { Button, Card, Heading, HoverCard, Select } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { createFileRoute } from '@tanstack/react-router';
import { CircleHelpIcon } from 'lucide-react';

import { PageHeader } from '@/components/PageHeader';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useUpdateSetupStateMutation } from '@/hooks/useUpdateSetupStateMutation';
import { useAppStore } from '@/store';
import type { GroupSwitcherPosition } from '@/store/types';

/** libui ships no Switch, so this is hand-rolled — `label` names it for assistive technology. */
const Toggle = ({
  checked,
  label,
  onCheckedChange
}: {
  checked: boolean;
  label: string;
  onCheckedChange: (val: boolean) => void;
}) => (
  <button
    aria-checked={checked}
    aria-label={label}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${checked ? 'bg-primary' : 'bg-slate-400 dark:bg-slate-600'}`}
    role="switch"
    type="button"
    onClick={() => onCheckedChange(!checked)}
  >
    <span
      className={`pointer-events-none block h-5 w-5 rounded-full bg-slate-200 shadow-lg ring-0 transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
    />
  </button>
);

const RouteComponent = () => {
  const { t } = useTranslation();
  const setupStateQuery = useSetupStateQuery();
  const updateSetupStateMutation = useUpdateSetupStateMutation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const groupSwitcherPosition = useAppStore((store) => store.groupSwitcherPosition);
  const setGroupSwitcherPosition = useAppStore((store) => store.setGroupSwitcherPosition);

  const uploaderLabel = t({ en: 'Enable Uploader', fr: 'Activer le téléversement' });

  // The toggle is staged locally until Save, so it holds its own state. Resync it whenever the server
  // value changes underneath — saving invalidates the query, and the response is the authority on what
  // was actually stored.
  const savedUploaderEnabled = setupStateQuery.data.isExperimentalFeaturesEnabled ?? false;
  const [uploaderEnabled, setUploaderEnabled] = useState(savedUploaderEnabled);
  const [syncedUploaderEnabled, setSyncedUploaderEnabled] = useState(savedUploaderEnabled);
  if (syncedUploaderEnabled !== savedUploaderEnabled) {
    setSyncedUploaderEnabled(savedUploaderEnabled);
    setUploaderEnabled(savedUploaderEnabled);
  }

  const handleSave = () => {
    updateSetupStateMutation.mutate(
      { isExperimentalFeaturesEnabled: uploaderEnabled },
      {
        onSuccess: () => {
          addNotification({ type: 'success' });
        }
      }
    );
  };

  return (
    <React.Fragment>
      <PageHeader>
        <Heading className="text-center" variant="h2">
          {t({
            en: 'Application Settings',
            fr: "Paramètres de l'application"
          })}
        </Heading>
      </PageHeader>
      <div className="mx-auto max-w-4xl">
        <Card>
          <Card.Header>
            <Card.Title className="text-lg font-bold">{t({ en: 'Features', fr: 'Fonctionnalités' })}</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{uploaderLabel}</p>
                <HoverCard>
                  <HoverCard.Trigger asChild>
                    <button className="text-muted-foreground hover:text-foreground transition-colors" type="button">
                      <CircleHelpIcon className="h-4 w-4" />
                    </button>
                  </HoverCard.Trigger>
                  <HoverCard.Content className="w-72 text-sm">
                    {t({
                      en: 'When enabled, an upload menu item appears in the sidebar that allows users to upload instrument records directly from data files, bypassing the normal session workflow.',
                      fr: "Lorsqu'elle est activée, un élément de menu Téléversement apparaît dans le menu latéral et permet aux utilisateurs de téléverser des enregistrements d'instruments directement à partir de fichiers de données."
                    })}
                  </HoverCard.Content>
                </HoverCard>
              </div>
              <Toggle checked={uploaderEnabled} label={uploaderLabel} onCheckedChange={setUploaderEnabled} />
            </div>
          </Card.Content>
          <Card.Footer className="justify-end">
            <Button disabled={updateSetupStateMutation.isPending} onClick={handleSave}>
              {t({ en: 'Save', fr: 'Enregistrer' })}
            </Button>
          </Card.Footer>
        </Card>
        {/* A separate card because these settings are not the instance's: they live in this browser and
            apply instantly, so they are deliberately outside the Save button's scope above. */}
        <Card className="mt-6">
          <Card.Header>
            <Card.Title className="text-lg font-bold">{t({ en: 'Preferences', fr: 'Préférences' })}</Card.Title>
            <Card.Description>
              {t({
                en: 'Saved in this browser and applied immediately. They affect only you, not other users of this instance.',
                fr: 'Enregistrées dans ce navigateur et appliquées immédiatement. Elles ne concernent que vous, et non les autres utilisateurs de cette instance.'
              })}
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">
                {t({ en: 'Group Switcher Position', fr: 'Position du sélecteur de groupe' })}
              </p>
              <Select
                value={groupSwitcherPosition}
                onValueChange={(value) => setGroupSwitcherPosition(value as GroupSwitcherPosition)}
              >
                <Select.Trigger className="w-[180px] shrink-0">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Group>
                    <Select.Item value="sidebar">{t({ en: 'Sidebar Menu', fr: 'Menu latéral' })}</Select.Item>
                    <Select.Item value="topbar">
                      {t({ en: 'Top Right Corner', fr: 'Coin supérieur droit' })}
                    </Select.Item>
                  </Select.Group>
                </Select.Content>
              </Select>
            </div>
          </Card.Content>
        </Card>
      </div>
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/admin/settings')({
  component: RouteComponent
});
