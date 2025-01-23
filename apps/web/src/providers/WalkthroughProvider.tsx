import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { Button, Card } from '@douglasneuroinformatics/libui/components';
import { useEventListener, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { FormTypes } from '@opendatacapture/runtime-core';
import type { Session } from '@opendatacapture/schemas/session';
import { mean } from 'lodash-es';
import { XIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import type { NavigateOptions } from 'react-router-dom';
import { match } from 'ts-pattern';
import type { Promisable } from 'type-fest';

import type { StartSessionFormData } from '@/features/session/components/StartSessionForm';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useAppStore } from '@/store';

const CURRENT_DATE = new Date();
const START_SESSION_DATA: FormTypes.PartialNullableData<StartSessionFormData> = {
  sessionType: 'IN_PERSON',
  subjectId: '123',
  subjectIdentificationMethod: 'CUSTOM_ID'
};

const SESSION_DATA: Session = {
  createdAt: CURRENT_DATE,
  date: CURRENT_DATE,
  groupId: null,
  id: '123',
  subject: {
    createdAt: CURRENT_DATE,
    groupIds: [],
    id: '123',
    updatedAt: CURRENT_DATE
  },
  subjectId: '123',
  type: 'IN_PERSON',
  updatedAt: CURRENT_DATE
};

type WalkthroughStep = {
  content: React.ReactNode;
  navigateOptions?: NavigateOptions;
  onBeforeQuery?: () => Promisable<void>;
  position: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-left';
  target: string;
  title: string;
  url: `/${string}`;
};

const Walkthrough = () => {
  const setIsWalkthroughComplete = useAppStore((store) => store.setIsWalkthroughComplete);
  const startSession = useAppStore((store) => store.startSession);
  const endSession = useAppStore((store) => store.endSession);
  const { resolvedLanguage, t } = useTranslation();
  const setIsWalkthroughOpen = useAppStore((store) => store.setIsWalkthroughOpen);
  const [index, setIndex] = useState(0);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEventListener('resize', () => setIsWalkthroughOpen(false), undefined, { once: true });

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
            initialValues: START_SESSION_DATA
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
        position: 'top-left',
        target: 'div[data-field-group="sessionType"]',
        title: t({
          en: 'Type of Assessment',
          fr: "Type d'évaluation"
        }),
        url: '/session/start-session'
      },
      {
        content: t({
          en: 'Here, you can see the current session in progress.',
          fr: 'Ici, vous pouvez voir la session en cours.'
        }),
        onBeforeQuery() {
          startSession(SESSION_DATA);
        },
        position: 'top-left',
        target: '#current-session-card',
        title: t({
          en: 'Session in Progress',
          fr: 'Session en cours'
        }),
        url: '/session/start-session'
      },
      {
        content: t({
          en: 'On this page, you can select the instrument you want to administer.',
          fr: "Sur cette page, vous pouvez sélectionner l'instrument que vous souhaitez administrer."
        }),
        navigateOptions: {
          state: {
            initialValues: START_SESSION_DATA
          }
        },
        position: 'bottom-left',
        target: 'button[data-nav-url="/instruments/accessible-instruments"]',
        title: t({
          en: 'Administer Instrument',
          fr: 'Administrer un instrument'
        }),
        url: '/instruments/accessible-instruments'
      },
      {
        content: t({
          en: 'On this page, you can view the data for the subject of the current session. To access data for other subjects, use the lookup button on the Data Hub page.',
          fr: "Sur cette page, vous pouvez consulter les données du client pour lequel la session est en cours. Pour accéder aux données d'autres clients, utilisez le bouton de recherche sur la page du centre de données."
        }),
        position: 'bottom-left',
        target: 'button[data-nav-url="/datahub/123/table"]',
        title: t({
          en: 'View Subject',
          fr: 'Voir le client'
        }),
        url: '/datahub/123/table'
      },
      {
        content: t({
          en: 'Here, you can view the records this subject has completed for a given instrument.',
          fr: 'Ici, vous pouvez voir les enregistrements que ce client a complétés pour un instrument donné'
        }),
        position: 'bottom-center',
        target: 'a[data-nav-url="/datahub/123/table"]',
        title: t({
          en: 'Table',
          fr: 'Tableau'
        }),
        url: '/datahub/123/table'
      },
      {
        content: t({
          en: 'Here, you can export the data in the table to CSV or JSON format.',
          fr: 'Ici, vous pouvez exporter les données du tableau au format CSV ou JSON.'
        }),
        position: 'bottom-right',
        target: 'div[data-spotlight-type="export-data-dropdown"]',
        title: t({
          en: 'Data Export',
          fr: 'Exportation de données'
        }),
        url: '/datahub/123/table'
      },
      {
        content: t({
          en: 'Here, you can create custom graphs to visualize longitudinal data for a given subject.',
          fr: "Ici, vous pouvez créer des graphiques personnalisés pour visualiser les données longitudinales d'un client donné."
        }),
        position: 'bottom-right',
        target: 'a[data-nav-url="/datahub/123/graph"]',
        title: t({
          en: 'Graph',
          fr: 'Graphique'
        }),
        url: '/datahub/123/graph'
      },
      {
        content: t({
          en: 'Here, you can create and view assignments, which are instruments for a subject to complete at home.',
          fr: 'Ici, vous pouvez créer et visualiser des devoirs, qui sont des instruments que le client doit compléter à la maison.'
        }),
        position: 'bottom-left',
        target: 'a[data-nav-url="/datahub/123/assignments"]',
        title: t({
          en: 'Assignments',
          fr: 'Devoirs'
        }),
        url: '/datahub/123/assignments'
      }
    ];
  }, [resolvedLanguage]);

  const currentStep = steps[index]!;
  const isLastStep = index === steps.length - 1;

  const removeSpotlight = () => {
    targetRef.current?.setAttribute('data-spotlight', 'false');
  };

  const close = () => {
    endSession();
    removeSpotlight();
    setIndex(0);
    setIsWalkthroughOpen(false);
  };

  useLayoutEffect(() => {
    if (window.location.pathname !== currentStep.url) {
      navigate(currentStep.url, currentStep.navigateOptions);
    }
    void (async function () {
      await currentStep.onBeforeQuery?.();
      targetRef.current = document.querySelector(currentStep.target);
      if (targetRef.current) {
        targetRef.current.setAttribute('data-spotlight', 'true');
        const rect = targetRef.current.getBoundingClientRect();
        const popoverHeight = popoverRef.current?.clientHeight ?? 0;
        const popoverWidth = popoverRef.current?.clientWidth ?? 0;
        match(currentStep.position)
          .with('bottom-left', () => {
            setPopoverPosition({ x: rect.left, y: rect.bottom + 20 });
          })
          .with('bottom-right', () => {
            setPopoverPosition({ x: rect.right - popoverWidth, y: rect.bottom + 20 });
          })
          .with('bottom-center', () => {
            setPopoverPosition({ x: mean([rect.left, rect.right]) - popoverWidth / 2, y: rect.bottom + 20 });
          })
          .with('top-left', () => {
            setPopoverPosition({ x: rect.left, y: rect.top - popoverHeight - 20 });
          })
          .exhaustive();
      } else {
        console.error(`Failed to find element with query: ${currentStep.target}`);
      }
    })();
    return removeSpotlight;
  }, [index]);

  return (
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
  );
};

export const WalkthroughProvider: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const isDisclaimerAccepted = useAppStore((store) => store.isDisclaimerAccepted);
  const isWalkthroughOpen = useAppStore((store) => store.isWalkthroughOpen);
  const isWalkthroughComplete = useAppStore((store) => store.isWalkthroughComplete);
  const setIsWalkthroughOpen = useAppStore((store) => store.setIsWalkthroughOpen);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (isDisclaimerAccepted && !isWalkthroughComplete) {
      setIsWalkthroughOpen(true);
    }
  }, [isDisclaimerAccepted, isWalkthroughComplete]);

  if (!isDesktop) {
    return children;
  }

  return (
    <React.Fragment>
      {children}
      <AnimatePresence>{isWalkthroughOpen && <Walkthrough />}</AnimatePresence>
    </React.Fragment>
  );
};
