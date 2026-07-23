import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { Button, Card } from '@douglasneuroinformatics/libui/components';
import { useEventListener, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { FormTypes } from '@opendatacapture/runtime-core';
import type { Session } from '@opendatacapture/schemas/session';
import { useNavigate } from '@tanstack/react-router';
import { mean } from 'lodash-es';
import { XIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { match } from 'ts-pattern';
import type { Promisable } from 'type-fest';

import type { StartSessionFormData } from '@/components/StartSessionForm';
import { config } from '@/config';
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
  navigateOptions?: {
    state?: {
      [key: string]: any;
    };
    to: string;
  };
  onBeforeQuery?: () => Promisable<void>;
  position: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-left';
  target: string;
  title: string;
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
              es: 'Este tutorial proporciona una breve descripción de cómo usar Open Data Capture.',
              fr: "Ce tutoriel donne un bref aperçu de l'utilisation de la plateforme Open Data Capture."
            })}{' '}
            <span className="font-bold">
              {t({
                en: 'Please complete it before asking any questions about the platform.',
                es: 'Por favor, complételo antes de hacer preguntas sobre la plataforma.',
                fr: 'Veuillez le compléter avant de poser des questions sur la plateforme.'
              })}
            </span>{' '}
            {t({
              en: 'After completing the tutorial, this popup will no longer appear when you log in to Open Data Capture.',
              es: 'Después de completar el tutorial, esta ventana ya no aparecerá cuando inicie sesión en Open Data Capture.',
              fr: "Après avoir suivi le tutoriel, cette fenêtre ne s'affichera plus lorsque vous vous connecterez à la plateforme."
            })}
          </p>
        ),
        navigateOptions: {
          to: '/dashboard'
        },
        position: 'bottom-left',
        target: '#sidebar-branding-container',
        title: t({
          en: 'Welcome to Open Data Capture 👋',
          es: 'Bienvenido a Open Data Capture 👋',
          fr: 'Bienvenue sur Open Data Capture 👋'
        })
      },
      {
        content: (
          <p>
            {t({
              en: 'On this page, you can see an overview of the data collected by your group.',
              es: 'En esta página, puede ver un resumen de los datos recopilados por su grupo.',
              fr: 'Sur cette page, vous pouvez voir un aperçu des données collectées par votre groupe.'
            })}
          </p>
        ),
        navigateOptions: {
          to: '/dashboard'
        },
        position: 'bottom-left',
        target: 'button[data-nav-url="/dashboard"]',
        title: t({
          en: 'Dashboard',
          es: 'Panel de control',
          fr: 'Tableau de bord'
        })
      },
      {
        content: (
          <p>
            {t({
              en: 'On this page, you can view and export the data your group has collected.',
              es: 'En esta página, puede ver y exportar los datos que su grupo ha recopilado.',
              fr: 'Sur cette page, vous pouvez visualiser et exporter les données collectées par votre groupe.'
            })}
          </p>
        ),
        navigateOptions: {
          to: '/datahub'
        },
        position: 'bottom-left',
        target: 'button[data-nav-url="/datahub"]',
        title: t({
          en: 'Data Hub',
          es: 'Centro de datos',
          fr: 'Centre de données'
        })
      },
      {
        content: (
          <p>
            {t({
              en: 'Here, you can search for subjects in the database. To begin, type in the search bar to find matching subject IDs',
              es: 'Aquí puede buscar sujetos en la base de datos. Para comenzar, escriba en la barra de búsqueda para encontrar los identificadores de sujetos correspondientes.',
              fr: 'Ici, vous pouvez rechercher des sujets dans la base de données. Pour commencer, saisissez votre recherche dans la barre de recherche afin de trouver les identifiants de sujets correspondants.'
            })}
          </p>
        ),
        navigateOptions: {
          to: '/datahub'
        },
        position: 'bottom-left',
        target: '#datahub-subject-search-bar',
        title: t({
          en: 'Subject Search Bar',
          es: 'Barra de búsqueda de sujetos',
          fr: 'Barre de recherche de client'
        })
      },
      {
        content: (
          <p>
            {t({
              en: 'Here, you can search for subjects in the database. To begin, click on the Subject Lookup button, and a popup will appear where you can enter the search query.',
              es: 'Aquí puede buscar sujetos en la base de datos. Para comenzar, haga clic en el botón de búsqueda de sujetos y aparecerá una ventana emergente donde puede ingresar la consulta de búsqueda.',
              fr: "Ici, vous pouvez rechercher des clients dans la base de données. Pour commencer, cliquez sur le bouton de recherche et une fenêtre contextuelle s'affichera pour vous permettre de saisir la requête de recherche."
            })}
          </p>
        ),
        navigateOptions: {
          to: '/datahub'
        },
        position: 'bottom-left',
        target: '[data-spotlight-type="subject-lookup-search-button"]',
        title: t({
          en: 'Subject Lookup',
          es: 'Búsqueda de sujetos',
          fr: 'Recherche de client'
        })
      },
      {
        content: t({
          en: 'Here, you can export all your data in various formats.',
          es: 'Aquí puede exportar todos sus datos en varios formatos.',
          fr: 'Ici, vous pouvez exporter toutes vos données dans différents formats.'
        }),
        navigateOptions: {
          to: '/datahub'
        },
        position: 'bottom-right',
        target: '[data-spotlight-type="export-data-dropdown"]',
        title: t({
          en: 'Bulk Data Export',
          es: 'Exportación masiva de datos',
          fr: 'Exportation de données'
        })
      },
      {
        content: t({
          en: 'On this page, you can start a new session for a subject. Various options are available based on the identification method you choose and the type of session.',
          es: 'En esta página, puede iniciar una nueva sesión para un sujeto. Hay varias opciones disponibles según el método de identificación que elija y el tipo de sesión.',
          fr: "Sur cette page, vous pouvez démarrer une nouvelle session pour un client. Différentes options sont disponibles en fonction de la méthode d'identification choisie et du type de session."
        }),
        navigateOptions: {
          state: {
            initialValues: START_SESSION_DATA
          },
          to: '/session/start-session'
        },
        position: 'bottom-left',
        target: 'button[data-nav-url="/session/start-session"]',
        title: t({
          en: 'Start Session',
          es: 'Iniciar sesión de evaluación',
          fr: 'Démarrer une session'
        })
      },
      {
        content: t({
          en: "You can start a session with a custom ID or let the system create one using the subject's personal information. If you choose the auto-generate option, the ID is created in your browser, so the subject's first and last names are never sent to our server.",
          es: 'Puede iniciar una sesión con un identificador personalizado o dejar que el sistema cree uno usando la información personal del sujeto. Si elige la opción de generación automática, el identificador se crea en su navegador, por lo que el nombre y apellido del sujeto nunca se envían a nuestro servidor.',
          fr: "Vous pouvez démarrer une session avec un identifiant personnalisé ou laisser le système en créer un à l'aide des informations personnelles du client. Si vous choisissez l'option de génération automatique, l'identifiant est créé dans votre navigateur, de sorte que les nom et prénom du client ne sont jamais envoyés à notre serveur."
        }),
        navigateOptions: {
          to: '/session/start-session'
        },
        position: 'bottom-left',
        target: 'div[data-field-group="subjectIdentificationMethod"]',
        title: t({
          en: 'Identification Method',
          es: 'Método de identificación',
          fr: "Méthode d'identification"
        })
      },
      {
        content: t({
          en: 'You can use any ID you like; your group name will automatically be appended to ensure it is unique.',
          es: 'Puede usar cualquier identificador que desee; el nombre de su grupo se añadirá automáticamente para garantizar que sea único.',
          fr: "Vous pouvez utiliser l'identifiant de votre choix ; le nom de votre groupe sera automatiquement ajouté pour garantir son unicité."
        }),
        navigateOptions: {
          to: '/session/start-session'
        },
        position: 'bottom-left',
        target: 'div[data-field-group="subjectId"]',
        title: t({
          en: 'Identifier',
          es: 'Identificador',
          fr: 'Identification du client'
        })
      },
      {
        content: t({
          en: 'You can choose either an in-person session (the default) or a retrospective session to enter data previously collected using a different system.',
          es: 'Puede elegir una sesión presencial (la opción predeterminada) o una sesión retrospectiva para ingresar datos previamente recopilados con otro sistema.',
          fr: "Vous pouvez choisir une session en personne (par défaut) ou une session rétrospective pour saisir des données précédemment collectées à l'aide d'un autre système."
        }),
        navigateOptions: {
          to: '/session/start-session'
        },
        position: 'top-left',
        target: 'div[data-field-group="sessionType"]',
        title: t({
          en: 'Type of Assessment',
          es: 'Tipo de evaluación',
          fr: "Type d'évaluation"
        })
      },
      {
        content: t({
          en: 'Here, you can see the current session in progress.',
          es: 'Aquí puede ver la sesión actualmente en curso.',
          fr: 'Ici, vous pouvez voir la session en cours.'
        }),
        navigateOptions: {
          to: '/session/start-session'
        },
        onBeforeQuery() {
          startSession(SESSION_DATA);
        },
        position: 'top-left',
        target: '#current-session-card',
        title: t({
          en: 'Session in Progress',
          es: 'Sesión en curso',
          fr: 'Session en cours'
        })
      },
      {
        content: t({
          en: 'On this page, you can select the instrument you want to administer.',
          es: 'En esta página, puede seleccionar el instrumento que desea administrar.',
          fr: "Sur cette page, vous pouvez sélectionner l'instrument que vous souhaitez administrer."
        }),
        navigateOptions: {
          state: {
            initialValues: START_SESSION_DATA
          },
          to: '/instruments/accessible-instruments'
        },
        position: 'bottom-left',
        target: 'button[data-nav-url="/instruments/accessible-instruments"]',
        title: t({
          en: 'Administer Instrument',
          es: 'Administrar instrumento',
          fr: 'Administrer un instrument'
        })
      },
      {
        content: t({
          en: 'On this page, you can view the data for the subject of the current session. To access data for other subjects, use the lookup button on the Data Hub page.',
          es: 'En esta página, puede ver los datos del sujeto de la sesión actual. Para acceder a los datos de otros sujetos, use el botón de búsqueda en la página del centro de datos.',
          fr: "Sur cette page, vous pouvez consulter les données du client pour lequel la session est en cours. Pour accéder aux données d'autres clients, utilisez le bouton de recherche sur la page du centre de données."
        }),
        navigateOptions: {
          to: '/datahub/123/table'
        },
        position: 'bottom-left',
        target: 'button[data-nav-url="/datahub/123/table"]',
        title: t({
          en: 'View Subject',
          es: 'Ver sujeto',
          fr: 'Voir le client'
        })
      },
      {
        content: t({
          en: 'Here, you can view the records this subject has completed for a given instrument.',
          es: 'Aquí puede ver los registros que este sujeto ha completado para un instrumento determinado.',
          fr: 'Ici, vous pouvez voir les enregistrements que ce client a complétés pour un instrument donné'
        }),
        navigateOptions: {
          to: '/datahub/123/table'
        },
        position: 'bottom-center',
        target: 'a[data-nav-url="/datahub/123/table"]',
        title: t({
          en: 'Table',
          es: 'Tabla',
          fr: 'Tableau'
        })
      },
      {
        content: t({
          en: 'Here, you can export the data in the table to CSV or JSON format.',
          es: 'Aquí puede exportar los datos de la tabla en formato CSV o JSON.',
          fr: 'Ici, vous pouvez exporter les données du tableau au format CSV ou JSON.'
        }),
        navigateOptions: {
          to: '/datahub/123/table'
        },
        position: 'bottom-right',
        target: 'div[data-spotlight-type="export-data-dropdown"]',
        title: t({
          en: 'Data Export',
          es: 'Exportación de datos',
          fr: 'Exportation de données'
        })
      },
      {
        content: t({
          en: 'Here, you can create custom graphs to visualize longitudinal data for a given subject.',
          es: 'Aquí puede crear gráficos personalizados para visualizar los datos longitudinales de un sujeto determinado.',
          fr: "Ici, vous pouvez créer des graphiques personnalisés pour visualiser les données longitudinales d'un client donné."
        }),
        navigateOptions: {
          to: '/datahub/123/graph'
        },
        position: 'bottom-right',
        target: 'a[data-nav-url="/datahub/123/graph"]',
        title: t({
          en: 'Graph',
          es: 'Gráfico',
          fr: 'Graphique'
        })
      },
      {
        content: t({
          en: 'Here, you can create and view assignments, which are instruments for a subject to complete at home.',
          es: 'Aquí puede crear y ver asignaciones, que son instrumentos que el sujeto debe completar en casa.',
          fr: 'Ici, vous pouvez créer et visualiser des assignations, qui sont des instruments que le client doit compléter à la maison.'
        }),
        navigateOptions: {
          to: '/datahub/123/assignments'
        },
        position: 'bottom-left',
        target: 'a[data-nav-url="/datahub/123/assignments"]',
        title: t({
          en: 'Assignments',
          es: 'Asignaciones',
          fr: 'Assignations'
        })
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
    if (window.location.pathname !== currentStep.navigateOptions?.to) {
      void navigate({ state: currentStep.navigateOptions?.state, to: currentStep.navigateOptions?.to });
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
            {/* Hidden on the last step, where "Done" already marks the walkthrough complete. */}
            {!isLastStep && (
              <Button
                className="mr-auto"
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsWalkthroughComplete(true);
                  close();
                }}
              >
                {t({
                  en: "Don't show again",
                  es: 'No mostrar de nuevo',
                  fr: 'Ne plus afficher'
                })}
              </Button>
            )}
            {index > 0 && (
              <Button type="button" variant="outline" onClick={() => setIndex(index - 1)}>
                {t({
                  en: 'Back',
                  es: 'Atrás',
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
                    es: 'Listo',
                    fr: 'Fin'
                  })
                : t({
                    en: 'Next',
                    es: 'Siguiente',
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
    if (isDisclaimerAccepted && !isWalkthroughComplete && !(import.meta.env.DEV && config.dev.disableTutorial)) {
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
