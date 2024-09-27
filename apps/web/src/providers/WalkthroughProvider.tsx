import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { Button, Card } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { FormTypes } from '@opendatacapture/runtime-core';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { NavigateOptions } from 'react-router-dom';
import { match } from 'ts-pattern';
import type { Promisable } from 'type-fest';

import type { StartSessionFormData } from '@/features/session/components/StartSessionForm';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useAppStore } from '@/store';

type WalkthroughStep = {
  content: React.ReactNode;
  navigateOptions?: NavigateOptions;
  onBeforeQuery?: () => Promisable<void>;
  position: 'bottom-left' | 'bottom-right';
  target: string;
  title: string;
  url: `/${string}`;
};

const Walkthrough: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const isDisclaimerAccepted = useAppStore((store) => store.isDisclaimerAccepted);
  const isWalkthroughComplete = useAppStore((store) => store.isWalkthroughComplete);
  const setIsWalkthroughComplete = useAppStore((store) => store.setIsWalkthroughComplete);
  const { resolvedLanguage, t } = useTranslation();
  const isWalkthroughOpen = useAppStore((store) => store.isWalkthroughOpen);
  const setIsWalkthroughOpen = useAppStore((store) => store.setIsWalkthroughOpen);
  const [index, setIndex] = useState(0);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const steps = useMemo<WalkthroughStep[]>(() => {
    return [
      {
        content: (
          <p>
            {t({
              en: 'This tutorial provides a brief overview of how to use Open Data Capture.',
              fr: "Ce tutoriel donne un bref aperçu de l'utilisation de la plateforme Open Data Capture."
            })}{' '}
            <span className="font-bold">
              {t({
                en: 'Please complete it before asking any questions about the platform.',
                fr: 'Veuillez le compléter avant de poser des questions sur la plateforme.'
              })}
            </span>{' '}
            {t({
              en: 'After completing the tutorial, this popup will no longer appear when you log in to Open Data Capture.',
              fr: "Après avoir suivi le tutoriel, cette fenêtre ne s'affichera plus lorsque vous vous connecterez à la plateforme."
            })}
          </p>
        ),
        position: 'bottom-left',
        target: '#sidebar-branding-container',
        title: t({
          en: 'Welcome to Open Data Capture 👋',
          fr: 'Bienvenue à Open Data Capture 👋'
        }),
        url: '/dashboard'
      },
      {
        content: (
          <p>
            {t({
              en: 'On this page, you can see an overview of the data collected by your group.',
              fr: 'Sur cette page, vous pouvez voir un aperçu des données collectées par votre groupe.'
            })}
          </p>
        ),
        position: 'bottom-left',
        target: 'button[data-nav-url="/dashboard"]',
        title: t({
          en: 'Dashboard',
          fr: 'Tableau de bord'
        }),
        url: '/dashboard'
      },
      {
        content: (
          <p>
            {t({
              en: 'On this page, you can view and export the data your group has collected.',
              fr: 'Sur cette page, vous pouvez visualiser et exporter les données collectées par votre groupe.'
            })}
          </p>
        ),
        position: 'bottom-left',
        target: 'button[data-nav-url="/datahub"]',
        title: t({
          en: 'Data Hub',
          fr: 'Centre de données'
        }),
        url: '/datahub'
      },
      {
        content: (
          <p>
            {t({
              en: 'Here, you can search for subjects in the database. To begin, click on the search bar, and a popup will appear where you can enter the search query.',
              fr: "Ici, vous pouvez rechercher des clients dans la base de données. Pour commencer, cliquez sur la barre de recherche et une fenêtre contextuelle s'affichera pour vous permettre de saisir la requête de recherche."
            })}
          </p>
        ),
        position: 'bottom-left',
        target: '#subject-lookup-search-bar',
        title: t({
          en: 'Subject Lookup',
          fr: 'Recherche de client'
        }),
        url: '/datahub'
      },
      {
        content: t({
          en: 'Here, you can export all your data in various formats.',
          fr: 'Ici, vous pouvez exporter toutes vos données dans différents formats.'
        }),
        position: 'bottom-right',
        target: '[data-spotlight-type="export-data-dropdown"]',
        title: t({
          en: 'Bulk Data Export',
          fr: 'Exportation de données'
        }),
        url: '/datahub'
      },
      {
        content: t({
          en: 'On this page, you can start a new session for a subject. Various options are available based on the identification method you choose and the type of session.',
          fr: "Sur cette page, vous pouvez démarrer une nouvelle session pour un client. Différentes options sont disponibles en fonction de la méthode d'identification choisie et du type de session."
        }),
        navigateOptions: {
          state: {
            initialValues: {
              sessionType: 'IN_PERSON',
              subjectId: '123',
              subjectIdentificationMethod: 'CUSTOM_ID'
            } satisfies FormTypes.PartialNullableData<StartSessionFormData>
          }
        },
        position: 'bottom-left',
        target: 'button[data-nav-url="/session/start-session"]',
        title: t({
          en: 'Start Session',
          fr: 'Commencer une session'
        }),
        url: '/session/start-session'
      },
      {
        content: t({
          en: "You can start a session with a custom ID or let the system create one using the subject's personal information. If you choose the auto-generate option, the ID is created in your browser, so the subject's first and last names are never sent to our server.",
          fr: "Vous pouvez démarrer une session avec un identifiant personnalisé ou laisser le système en créer un à l'aide des informations personnelles du client. Si vous choisissez l'option de génération automatique, l'identifiant est créé dans votre navigateur, de sorte que les nom et prénom du client ne sont jamais envoyés à notre serveur."
        }),
        position: 'bottom-left',
        target: 'div[data-field-group="subjectIdentificationMethod"]',
        title: t({
          en: 'Identification Method',
          fr: "Méthode d'identification"
        }),
        url: '/session/start-session'
      },
      {
        content: t({
          en: 'You can use any ID you like; your group name will automatically be appended to ensure it is unique.',
          fr: "Vous pouvez utiliser l'identifiant de votre choix ; le nom de votre groupe sera automatiquement ajouté pour garantir son unicité."
        }),
        position: 'bottom-left',
        target: 'div[data-field-group="subjectId"]',
        title: t({
          en: 'Identifier',
          fr: 'Identification du client'
        }),
        url: '/session/start-session'
      },
      {
        content: t({
          en: 'You can choose either an in-person session (the default) or a retrospective session to enter data previously collected using a different system.',
          fr: "Vous pouvez choisir une session en personne (par défaut) ou une session rétrospective pour saisir des données précédemment collectées à l'aide d'un autre système."
        }),
        position: 'bottom-left',
        target: 'div[data-field-group="sessionType"]',
        title: t({
          en: 'Type of Assessment',
          fr: "Type d'évaluation"
        }),
        url: '/session/start-session'
      }
    ];
  }, [resolvedLanguage]);

  const currentStep = steps[index]!;
  const isLastStep = index === steps.length - 1;

  const removeSpotlight = () => {
    targetRef.current?.setAttribute('data-spotlight', 'false');
  };

  const close = () => {
    setIsWalkthroughOpen(false);
    removeSpotlight();
    setIndex(0);
  };

  useEffect(() => {
    // !isWalkthroughComplete
    if (isDisclaimerAccepted) {
      setIsWalkthroughOpen(true);
    }
  }, [isDisclaimerAccepted, isWalkthroughComplete]);

  useLayoutEffect(() => {
    if (isWalkthroughOpen && window.location.pathname !== currentStep.url) {
      navigate(currentStep.url, currentStep.navigateOptions);
    }
    void (async function () {
      await currentStep.onBeforeQuery?.();
      targetRef.current = document.querySelector(currentStep.target);
      if (targetRef.current) {
        targetRef.current.setAttribute('data-spotlight', 'true');
        const rect = targetRef.current.getBoundingClientRect();
        const popoverWidth = popoverRef.current?.clientWidth ?? 0;
        match(currentStep.position)
          .with('bottom-left', () => {
            setPopoverPosition({ x: rect.left, y: rect.bottom + 20 });
          })
          .with('bottom-right', () => {
            setPopoverPosition({ x: rect.right - popoverWidth, y: rect.bottom + 20 });
          })
          .exhaustive();
      } else {
        console.error(`Failed to find element with query: ${currentStep.target}`);
      }
    })();
    return removeSpotlight;
  }, [index]);

  return (
    <React.Fragment>
      {children}
      <AnimatePresence>
        {isWalkthroughOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px]"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <motion.div
              animate={{ opacity: 100, x: popoverPosition.x, y: popoverPosition.y }}
              className="absolute"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0, x: popoverPosition.x, y: popoverPosition.y }}
              ref={popoverRef}
            >
              <Card className="max-w-md">
                <Card.Header className="pb-4">
                  <Card.Title className="mr-4">{currentStep.title}</Card.Title>
                  <Button className="absolute right-2 top-2" size="icon" type="button" variant="ghost" onClick={close}>
                    <XIcon className="h-4 w-4" />
                  </Button>
                </Card.Header>
                <Card.Content className="text-muted-foreground text-sm">{currentStep.content}</Card.Content>
                <Card.Footer className="flex justify-end gap-3">
                  {index > 0 && (
                    <Button type="button" variant="outline" onClick={() => setIndex(index - 1)}>
                      {t({
                        en: 'Back',
                        fr: 'Retour'
                      })}
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => {
                      if (isLastStep) {
                        setIsWalkthroughComplete(true);
                        close();
                      } else {
                        setIndex(index + 1);
                      }
                    }}
                  >
                    {isLastStep
                      ? t({
                          en: 'Done',
                          fr: 'Fin'
                        })
                      : t({
                          en: 'Next',
                          fr: 'Suivant'
                        })}
                  </Button>
                </Card.Footer>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
};

export const WalkthroughProvider: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const isDesktop = useIsDesktop();
  if (!isDesktop) {
    return children;
  }
  return <Walkthrough>{children}</Walkthrough>;
};
