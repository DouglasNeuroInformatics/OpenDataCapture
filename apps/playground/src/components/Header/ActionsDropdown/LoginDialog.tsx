/* eslint-disable perfectionist/sort-objects */

import { useEffect } from 'react';

import { asyncResultify } from '@douglasneuroinformatics/libjs';
import { Dialog, Form } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { $LoginCredentials } from '@opendatacapture/schemas/auth';
import axios from 'axios';
import { CheckIcon, XIcon } from 'lucide-react';
import { err, ok } from 'neverthrow';
import type { ResultAsync } from 'neverthrow';
import { z } from 'zod/v4';

import { useAppStore } from '@/store';

type $LoginData = z.infer<typeof $LoginData>;
const $LoginData = z.object({
  apiBaseUrl: z.url(),
  username: z.string().min(1),
  password: z.string().min(1),
  legacyLogin: z.boolean()
});

export type LoginDialogProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const LoginDialog = ({ isOpen, setIsOpen }: LoginDialogProps) => {
  const apiBaseUrl = useAppStore((store) => store.settings.apiBaseUrl);
  const isAuthorized = useAppStore((store) => !!store.auth);
  const updateSettings = useAppStore((store) => store.updateSettings);
  const login = useAppStore((store) => store.login);
  const revalidateToken = useAppStore((store) => store.revalidateToken);

  const addNotification = useNotificationsStore((store) => store.addNotification);
  const { t } = useTranslation();

  useEffect(() => {
    revalidateToken();
  }, [isOpen]);

  const getAdminToken = (
    credentials: $LoginCredentials,
    baseUrl: string
  ): ResultAsync<{ accessToken: string }, string> => {
    return asyncResultify(async () => {
      try {
        const response = await axios.post(`${baseUrl}/v1/auth/login`, credentials, {
          headers: {
            Accept: 'application/json'
          },
          validateStatus: () => true
        });
        if (response.status !== 200) {
          return err(`${response.status}: ${response.statusText}`);
        }
        return ok(await z.object({ accessToken: z.jwt() }).parseAsync(response.data));
      } catch (error) {
        console.error(error);
        return err('Unknown Error');
      }
    });
  };

  const getLimitedToken = (adminToken: string, baseUrl: string): ResultAsync<{ accessToken: string }, string> => {
    return asyncResultify(async () => {
      try {
        const response = await axios.get(`${baseUrl}/v1/auth/create-instrument-token`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          validateStatus: () => true
        });
        if (response.status !== 200) {
          return err(`${response.status}: ${response.statusText}`);
        }
        return ok(await z.object({ accessToken: z.jwt() }).parseAsync(response.data));
      } catch (error) {
        console.error(error);
        return err('Unknown Error');
      }
    });
  };

  const handleSubmit = async ({ apiBaseUrl, legacyLogin, ...credentials }: $LoginData) => {
    updateSettings({ apiBaseUrl });
    const adminTokenResult = await getAdminToken(credentials, apiBaseUrl);
    if (adminTokenResult.isErr()) {
      addNotification({
        type: 'error',
        title: t({ en: 'Login Failed', fr: 'Échec de la connexion' }),
        message: adminTokenResult.error
      });
      return;
    }

    if (legacyLogin) {
      login(adminTokenResult.value.accessToken);
    } else {
      const limitedTokenResult = await getLimitedToken(adminTokenResult.value.accessToken, apiBaseUrl);
      if (limitedTokenResult.isErr()) {
        addNotification({
          type: 'error',
          title: t({ en: 'Failed to Get Limited Token', fr: "Échec de l'obtention d'un jeton limité" }),
          message: limitedTokenResult.error
        });
        return;
      }
      login(limitedTokenResult.value.accessToken);
    }

    addNotification({ type: 'success' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content onOpenAutoFocus={(event) => event.preventDefault()}>
        <Dialog.Header>
          <Dialog.Title>{t({ en: 'Login', fr: 'Connexion' })}</Dialog.Title>
          <Dialog.Description>
            {t({
              en: 'Login to your Open Data Capture instance. A special access token is used that grants permissions to create instruments only. You must have permission to create instruments to use this functionality.',
              fr: "Connectez-vous à votre instance Open Data Capture. Un jeton d'accès spécial est utilisé pour accorder l'autorisation de créer uniquement des instruments. Vous devez avoir la permission de créer des instruments pour utiliser cette fonctionnalité."
            })}
          </Dialog.Description>
          <div className="mt-2 flex items-center gap-1 text-sm font-medium">
            {isAuthorized ? (
              <>
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-600">
                  <CheckIcon className="text-white" style={{ height: '12px', width: '12px' }} />
                </div>
                <span>{t({ en: 'You are already logged in', fr: 'Vous êtes déjà connecté' })}</span>
              </>
            ) : (
              <>
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600">
                  <XIcon className="text-white" style={{ height: '12px', width: '12px' }} />
                </div>
                <span>{t({ en: 'You are not currently logged in', fr: "Vous n'êtes actuellement pas connecté" })}</span>
              </>
            )}
          </div>
        </Dialog.Header>
        <Dialog.Body className="grid gap-4">
          <Form
            content={[
              {
                title: t({ en: 'Instance Settings', fr: "Paramètres de l'instance" }),
                fields: {
                  apiBaseUrl: {
                    description: t({
                      en: 'The base path for your Open Data Capture REST API.',
                      fr: 'Le chemin de base de votre API REST Open Data Capture.'
                    }),
                    kind: 'string',
                    placeholder: 'e.g., https://demo.opendatacapture.org/api',
                    label: t({ en: 'API Base URL', fr: "URL de base de l'API" }),
                    variant: 'input'
                  },
                  legacyLogin: {
                    description: t({
                      en: [
                        "Use the user's full access token instead of a granular access token.",
                        'Note that this can introduce security risks and should not be used on shared machines.',
                        'It is required only for ODC versions prior to v1.12.0.'
                      ].join(' '),
                      fr: "Utilisez le jeton d'accès complet de l'utilisateur au lieu d'un jeton d'accès granulaire. Notez que cela peut introduire des risques de sécurité et ne doit pas être utilisé sur des machines partagées. Cela n'est requis que pour les versions d'ODC antérieures à v1.12.0."
                    }),
                    kind: 'boolean',
                    label: t({ en: 'Legacy Login Mode', fr: 'Mode de connexion hérité' }),
                    variant: 'radio',
                    options: {
                      false: t({ en: 'No (Recommended)', fr: 'Non (Recommandé)' }),
                      true: t({ en: 'Yes', fr: 'Oui' })
                    }
                  }
                }
              },
              {
                title: t({ en: 'Login Credentials', fr: 'Identifiants de connexion' }),
                fields: {
                  username: {
                    kind: 'string',
                    label: t({ en: 'Username', fr: "Nom d'utilisateur" }),
                    variant: 'input'
                  },
                  password: {
                    kind: 'string',
                    label: t({ en: 'Password', fr: 'Mot de passe' }),
                    variant: 'password'
                  }
                }
              }
            ]}
            initialValues={{ apiBaseUrl, legacyLogin: false }}
            validationSchema={$LoginData}
            onSubmit={async (data) => {
              await handleSubmit(data);
              setIsOpen(false);
            }}
          />
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
