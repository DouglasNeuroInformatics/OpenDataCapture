/* eslint-disable perfectionist/sort-objects */

import { useCallback, useEffect, useRef, useState } from 'react';

import { Form } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { FormTypes } from '@opendatacapture/runtime-core';
import { DEFAULT_GROUP_NAME } from '@opendatacapture/schemas/core';
import type { Group } from '@opendatacapture/schemas/group';
import { $SessionType } from '@opendatacapture/schemas/session';
import type { CreateSessionData } from '@opendatacapture/schemas/session';
import { $SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import type { Sex, SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import { encodeScopedSubjectId, generateSubjectHash, removeSubjectIdScope } from '@opendatacapture/subject-utils';
import { createPortal } from 'react-dom';
import type { Promisable } from 'type-fest';
import { z } from 'zod/v4';

import { useSubjectsQuery } from '@/hooks/useSubjectsQuery';

const currentDate = new Date();

const EIGHTEEN_YEARS = 568025136000; // milliseconds

const MIN_DATE_OF_BIRTH = new Date(currentDate.getTime() - EIGHTEEN_YEARS);

type StartSessionFormData = {
  sessionDate: Date;
  sessionType: 'IN_PERSON' | 'RETROSPECTIVE';
  subjectDateOfBirth?: Date;
  subjectFirstName?: string;
  subjectId?: string;
  subjectIdentificationMethod: SubjectIdentificationMethod;
  subjectLastName?: string;
  subjectSex?: Sex;
};

type StartSessionFormProps = {
  currentGroup: Group | null;
  initialValues?: FormTypes.PartialNullableData<StartSessionFormData>;
  onSubmit: (data: CreateSessionData) => Promisable<void>;
  readOnly: boolean;
  username?: null | string;
};

export const StartSessionForm = ({
  currentGroup,
  username,
  initialValues,
  readOnly,
  onSubmit
}: StartSessionFormProps) => {
  const { resolvedLanguage, t } = useTranslation();

  const subjectsQuery = useSubjectsQuery({ params: { groupId: currentGroup?.id } });
  const subjects = subjectsQuery.data ?? [];

  const [dropdownPos, setDropdownPos] = useState<null | { left: number; top: number; width: number }>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchStringRef = useRef('');
  const [dropdownKey, setDropdownKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Recalculate dropdown position from the input's current bounding rect
  const updateDropdownPos = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
  }, []);

  const handleSelectOption = useCallback((value: string) => {
    if (inputRef.current) {
      // Set value natively to trigger React's internal state mechanism in the Form component
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(inputRef.current, value);

      const event = new Event('input', { bubbles: true });
      inputRef.current.dispatchEvent(event);

      setIsDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    let rafId: null | number = null;
    const handleInput = (e: Event) => {
      searchStringRef.current = (e.target as HTMLInputElement).value;
      // Defer the re-render to the next animation frame so Playwright's fill()
      // can complete without the Form re-rendering and resetting the value
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setDropdownKey((k) => k + 1);
      });
    };

    const handleFocus = () => {
      if (inputRef.current) {
        searchStringRef.current = inputRef.current.value;
        updateDropdownPos();
        setIsDropdownOpen(true);
      }
    };

    const handleBlur = (e: FocusEvent) => {
      const related = e.relatedTarget;
      // Use setTimeout so the relatedTarget check works after the browser has settled focus
      setTimeout(() => {
        if (dropdownRef.current && related instanceof Node && dropdownRef.current.contains(related)) {
          return;
        }
        setIsDropdownOpen(false);
      }, 0);
    };

    // Close dropdown on programmatic value changes (e.g., Playwright's fill())
    const handleChange = () => {
      setIsDropdownOpen(false);
    };

    const observer = new MutationObserver(() => {
      const input = document.querySelector('input[name="subjectId"]')!;
      if (input && input !== inputRef.current) {
        // Clean up old listeners
        if (inputRef.current) {
          inputRef.current.removeEventListener('input', handleInput);
          inputRef.current.removeEventListener('focus', handleFocus);
          inputRef.current.removeEventListener('blur', handleBlur);
          inputRef.current.removeEventListener('change', handleChange);
        }
        inputRef.current = input;
        input.addEventListener('input', handleInput);
        input.addEventListener('focus', handleFocus);
        input.addEventListener('blur', handleBlur);
        input.addEventListener('change', handleChange);

        // Disable browser autocomplete since we're using our own
        input.setAttribute('autocomplete', 'off');
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      if (inputRef.current) {
        inputRef.current.removeEventListener('input', handleInput);
        inputRef.current.removeEventListener('focus', handleFocus);
        inputRef.current.removeEventListener('blur', handleBlur);
        inputRef.current.removeEventListener('change', handleChange);
      }
    };
  }, [updateDropdownPos]);

  // Update dropdown position on scroll and resize so it stays attached to the input
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleScrollOrResize = () => {
      updateDropdownPos();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isDropdownOpen, updateDropdownPos]);

  // Use dropdownKey as a dependency signal; actual filtering uses the ref value
  void dropdownKey;
  const filteredSubjects = subjects.filter((s) => {
    const displayId = removeSubjectIdScope(s.id);
    const search = searchStringRef.current.toLowerCase();
    return (
      displayId.toLowerCase().includes(search) ||
      s.firstName?.toLowerCase().includes(search) ||
      s.lastName?.toLowerCase().includes(search)
    );
  });

  return (
    <>
      {isDropdownOpen &&
        dropdownPos &&
        createPortal(
          <div
            className="max-h-60 overflow-y-auto rounded-md border border-slate-700 bg-slate-800 p-1 shadow-md"
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: `${dropdownPos.top + 4}px`,
              left: `${dropdownPos.left}px`,
              width: `${dropdownPos.width}px`,
              zIndex: 9999
            }}
            tabIndex={-1}
          >
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map((subject) => {
                const displayId = removeSubjectIdScope(subject.id);
                return (
                  <button
                    className="flex w-full cursor-pointer select-none flex-col rounded-sm px-2 py-1.5 text-left text-sm text-slate-300 outline-none hover:bg-slate-700 hover:text-slate-100 focus:bg-slate-700 focus:text-slate-100"
                    key={subject.id}
                    type="button"
                    onClick={() => handleSelectOption(displayId)}
                  >
                    <span className="font-medium text-slate-200">{displayId}</span>
                    <span className="text-xs text-slate-400">
                      {subject.firstName} {subject.lastName}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-2 py-2 text-sm text-slate-400">
                {t({ en: 'No subjects found.', fr: 'Aucun sujet trouvé.' })}
              </div>
            )}
          </div>,
          document.body
        )}
      <Form
        preventResetValuesOnReset
        suspendWhileSubmitting
        className="mx-auto max-w-3xl"
        content={[
          {
            title: t('common.identificationMethod'),
            description: t('common.identificationMethodDesc'),
            fields: {
              subjectIdentificationMethod: {
                kind: 'string',
                label: 'Method',
                options: {
                  CUSTOM_ID: t('common.customIdentifier'),
                  PERSONAL_INFO: t('common.personalInfo')
                },
                variant: 'select'
              }
            }
          },
          {
            title: t('common.subjectIdentification.title'),
            fields: {
              subjectId: {
                kind: 'dynamic',
                deps: ['subjectIdentificationMethod'],
                render({ subjectIdentificationMethod }) {
                  return subjectIdentificationMethod === 'CUSTOM_ID'
                    ? {
                        kind: 'string',
                        label: t('common.identifier'),
                        variant: 'input'
                      }
                    : null;
                }
              },
              subjectFirstName: {
                kind: 'dynamic',
                deps: ['subjectIdentificationMethod'],
                render({ subjectIdentificationMethod }) {
                  return subjectIdentificationMethod === 'PERSONAL_INFO'
                    ? {
                        description: t('common.subjectIdentification.firstName.description'),
                        kind: 'string',
                        label: t('common.subjectIdentification.firstName.label'),
                        variant: 'input'
                      }
                    : null;
                }
              },
              subjectLastName: {
                kind: 'dynamic',
                deps: ['subjectIdentificationMethod'],
                render({ subjectIdentificationMethod }) {
                  return subjectIdentificationMethod === 'PERSONAL_INFO'
                    ? {
                        description: t('common.subjectIdentification.lastName.description'),
                        kind: 'string',
                        label: t('common.subjectIdentification.lastName.label'),
                        variant: 'input'
                      }
                    : null;
                }
              },
              subjectDateOfBirth: {
                kind: 'date',
                label: t('core.identificationData.dateOfBirth.label')
              },
              subjectSex: {
                description: t('core.identificationData.sex.description'),
                kind: 'string',
                label: t('core.identificationData.sex.label'),
                options: {
                  FEMALE: t('core.identificationData.sex.female'),
                  MALE: t('core.identificationData.sex.male')
                },
                variant: 'select'
              }
            }
          },
          {
            title: t('session.additionalData.title'),
            fields: {
              sessionType: {
                kind: 'string',
                label: t('session.type.label'),
                variant: 'select',
                options: {
                  RETROSPECTIVE: t('session.type.retrospective'),
                  IN_PERSON: t('session.type.in-person')
                }
              },
              sessionDate: {
                kind: 'dynamic',
                deps: ['sessionType'],
                render({ sessionType }) {
                  return sessionType === 'RETROSPECTIVE'
                    ? {
                        description: t('session.dateAssessed.description'),
                        kind: 'date',
                        label: t('session.dateAssessed.label')
                      }
                    : null;
                }
              }
            }
          }
        ]}
        data-testid="start-session-form"
        initialValues={initialValues}
        readOnly={readOnly}
        submitBtnLabel={t('core.submit')}
        validationSchema={z
          .object({
            subjectFirstName: z.string().optional(),
            subjectLastName: z.string().optional(),
            subjectIdentificationMethod: $SubjectIdentificationMethod,
            subjectId: z
              .string()
              .min(1)
              .refine(
                (arg) => !arg.includes('$'),
                t({
                  en: 'Illegal character: $',
                  fr: 'Caractère illégal : $'
                })
              )
              .optional(),
            subjectDateOfBirth: z
              .date()
              .max(MIN_DATE_OF_BIRTH, { message: t('session.errors.mustBeAdult') })
              .optional(),
            subjectSex: z.enum(['MALE', 'FEMALE']).optional(),
            sessionType: $SessionType.exclude(['REMOTE']),
            sessionDate: z
              .date()
              .max(currentDate, { message: t('session.errors.assessmentMustBeInPast') })
              .default(currentDate)
          })
          .superRefine((val, ctx) => {
            if (val.subjectIdentificationMethod === 'CUSTOM_ID') {
              if (!val.subjectId) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: t('core.form.requiredField'),
                  path: ['subjectId']
                });
              } else if (currentGroup?.settings.idValidationRegex) {
                try {
                  const regex = new RegExp(currentGroup?.settings.idValidationRegex);
                  if (!regex.test(val.subjectId)) {
                    ctx.addIssue({
                      code: z.ZodIssueCode.custom,
                      message:
                        currentGroup.settings.idValidationRegexErrorMessage?.[resolvedLanguage] ??
                        t({
                          en: `Must match regular expression: ${regex.source}`,
                          fr: `Doit correspondre à l'expression régulière : ${regex.source}`
                        }),
                      path: ['subjectId']
                    });
                  }
                } catch (err) {
                  // this should be checked already on the backend
                  console.error(err);
                }
              }
            } else if (val.subjectIdentificationMethod === 'PERSONAL_INFO') {
              const requiredKeys = ['subjectFirstName', 'subjectLastName', 'subjectSex', 'subjectDateOfBirth'] as const;
              for (const key of requiredKeys) {
                if (!val[key]) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t('core.form.requiredField'),
                    path: [key]
                  });
                }
              }
            }
          })}
        onSubmit={async ({
          sessionType,
          sessionDate,
          subjectId,
          subjectFirstName,
          subjectLastName,
          subjectDateOfBirth,
          subjectSex
        }) => {
          if (!subjectId) {
            subjectId = await generateSubjectHash({
              firstName: subjectFirstName!,
              lastName: subjectLastName!,
              dateOfBirth: subjectDateOfBirth!,
              sex: subjectSex!
            });
          } else {
            subjectId = encodeScopedSubjectId(subjectId, {
              groupName: currentGroup?.name ?? DEFAULT_GROUP_NAME
            });
          }
          await onSubmit({
            date: sessionDate,
            groupId: currentGroup?.id ?? null,
            username: username ?? null,
            type: sessionType,
            subjectData: {
              id: subjectId,
              firstName: subjectFirstName,
              lastName: subjectLastName,
              dateOfBirth: subjectDateOfBirth,
              sex: subjectSex
            }
          });
        }}
      />
    </>
  );
};

export type { StartSessionFormData };
