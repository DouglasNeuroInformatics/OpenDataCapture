import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { Button, Card } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { match } from 'ts-pattern';
import type { Promisable } from 'type-fest';

import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useAppStore } from '@/store';

type WalkthroughStep = {
  content: React.ReactNode;
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
        position: 'bottom-left',
        target: 'button[data-nav-url="/session/start-session"]',
        title: t({
          en: 'Start Session',
          fr: 'Commencer une session'
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
      navigate(currentStep.url);
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
