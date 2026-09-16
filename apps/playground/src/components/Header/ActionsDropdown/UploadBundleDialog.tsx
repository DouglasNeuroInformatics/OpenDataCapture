/* eslint-disable perfectionist/sort-objects */

import { useEffect, useRef } from 'react';

import { Button, Dialog } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import axios, { isAxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import { z } from 'zod/v4';

import { useAppStore } from '@/store';

const MAX_DISPLAYED_ERRORS = 5;

const $ErrorResponseBody = z.object({
  message: z.union([z.string(), z.array(z.string())])
});

const getResponseErrorMessage = (data: unknown): string | undefined => {
  const result = $ErrorResponseBody.safeParse(data);
  if (!result.success) {
    return undefined;
  }
  return Array.isArray(result.data.message) ? result.data.message.join(', ') : result.data.message;
};

export type UploadBundleDialogProps = {
  isOpen: boolean;
  onLoginRequired: () => void;
  setIsOpen: (value: boolean) => void;
};

export const UploadBundleDialog = ({ isOpen, setIsOpen, onLoginRequired }: UploadBundleDialogProps) => {
  const addNotification = useNotificationsStore((store) => store.addNotification);

  const auth = useAppStore((store) => store.auth);
  const apiBaseUrl = useAppStore((store) => store.settings.apiBaseUrl);
  const editorErrors = useAppStore((store) => store.editorErrors);
  const revalidateToken = useAppStore((store) => store.revalidateToken);

  const transpilerStateRef = useRef(useAppStore.getState().transpilerState);
  const { t } = useTranslation();

  useEffect(() => {
    revalidateToken();
  }, [isOpen]);

  useEffect(() => {
    useAppStore.subscribe(
      (store) => store.transpilerState,
      (transpilerState) => {
        transpilerStateRef.current = transpilerState;
      }
    );
  }, []);

  const handleSubmit = async () => {
    const state = transpilerStateRef.current;
    if (editorErrors.length > 0) {
      addNotification({
        message: t({
          en: 'Upload Failed: Type Errors',
          fr: 'Échec du téléversement : Erreurs de type'
        }),
        type: 'error'
      });
      return;
    } else if (state.status === 'building' || state.status === 'initial') {
      addNotification({
        message: t({
          en: 'Upload Failed: Transpilation Incomplete',
          fr: 'Échec du téléversement : Transpilation incomplète'
        }),
        type: 'error'
      });
      return;
    } else if (state.status === 'error') {
      addNotification({
        message: t({
          en: 'Upload Failed: Transpilation Error',
          fr: 'Échec du téléversement : Erreur de transpilation'
        }),
        type: 'error'
      });
      return;
    } else if (!auth) {
      addNotification({ message: t({ en: 'Login Required', fr: 'Connexion requise' }), type: 'error' });
      return;
    }

    const accessToken = auth.accessToken;
    const bundle = state.bundle;
    const createInstrumentPath = `${apiBaseUrl}/v1/instruments`;

    let createInstrumentResponse: AxiosResponse;
    try {
      createInstrumentResponse = await axios.post(
        createInstrumentPath,
        { bundle },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          validateStatus: (status) => status === 201
        }
      );
    } catch (err) {
      console.error(err);
      const response = isAxiosError(err) ? err.response : undefined;
      if (!response) {
        addNotification({
          message: isAxiosError(err) ? err.message : 'Unknown Error',
          type: 'error',
          title: t({ en: 'HTTP Request Failed', fr: 'Échec de la requête HTTP' })
        });
        return;
      }
      addNotification({
        message: getResponseErrorMessage(response.data),
        type: 'error',
        title: [response.status, response.statusText].filter(Boolean).join(' - ')
      });
      return;
    }

    addNotification({
      message: `${createInstrumentResponse.status} ${createInstrumentResponse.statusText}`,
      type: 'success'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content onOpenAutoFocus={(event) => event.preventDefault()}>
        <Dialog.Header>
          <Dialog.Title>{t({ en: 'Upload Bundle', fr: 'Téléverser le paquet' })}</Dialog.Title>
          <Dialog.Description>
            {t({
              en: 'Upload an instrument to your Open Data Capture instance. This functionality requires that you have added the API base URL for your instance to the user settings panel.',
              fr: "Téléversez un instrument vers votre instance Open Data Capture. Cette fonctionnalité nécessite que vous ayez ajouté l'URL de base de l'API de votre instance dans le panneau des paramètres utilisateur."
            })}
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Body className="grid gap-4">
          {!auth && (
            <p className="mb-3 text-sm font-medium">
              {t({ en: 'Please ', fr: 'Veuillez ' })}
              <button className="text-sky-700 hover:underline" type="button" onClick={onLoginRequired}>
                {t({ en: 'login to your account', fr: 'vous connecter à votre compte' })}
              </button>{' '}
              {t({ en: ' to upload a bundle.', fr: ' pour téléverser un paquet.' })}
            </p>
          )}
          {editorErrors.length > 0 && (
            <div className="mb-3 text-sm">
              <p className="font-medium">
                {t({
                  en: 'This instrument cannot be uploaded until the following type errors are resolved:',
                  fr: 'Cet instrument ne peut pas être téléversé tant que les erreurs de type suivantes ne sont pas résolues :'
                })}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {editorErrors.slice(0, MAX_DISPLAYED_ERRORS).map((error) => (
                  <li key={`${error.filename}:${error.line}:${error.message}`}>
                    {t({
                      en: `${error.filename} (line ${error.line}): ${error.message}`,
                      fr: `${error.filename} (ligne ${error.line}) : ${error.message}`
                    })}
                  </li>
                ))}
              </ul>
              {editorErrors.length > MAX_DISPLAYED_ERRORS && (
                <p className="mt-2">
                  {t({
                    en: `and ${editorErrors.length - MAX_DISPLAYED_ERRORS} more`,
                    fr: `et ${editorErrors.length - MAX_DISPLAYED_ERRORS} de plus`
                  })}
                </p>
              )}
            </div>
          )}
          <Button
            disabled={!auth || editorErrors.length > 0}
            type="button"
            onClick={() => void handleSubmit().then(() => setIsOpen(false))}
          >
            {t({ en: 'Upload', fr: 'Téléverser' })}
          </Button>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
