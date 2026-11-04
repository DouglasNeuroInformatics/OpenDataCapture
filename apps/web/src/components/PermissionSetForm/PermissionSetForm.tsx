import { useState } from 'react';
import type { ReactNode } from 'react';

import { Form } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $CreatePermissionSetData } from '@opendatacapture/schemas/permission-set';
import type { PermissionSet } from '@opendatacapture/schemas/permission-set';

import { PermissionSetRulesEditor } from '@/components/PermissionSetRulesEditor';
import { createRuleDraft, isIncompleteRuleDraft, withRuleDrafts } from '@/utils/permission-set-rules';
import type { PermissionSetRuleDraft } from '@/utils/permission-set-rules';

type PermissionSetFormProps = {
  /** The set being edited; omitted when creating one. */
  initialValues?: Pick<PermissionSet, 'name' | 'rules'>;
  /** Resolves to a message to show on the form when the save fails, or nothing when it succeeds. */
  onSubmit: (data: $CreatePermissionSetData) => Promise<undefined | { errorMessage: string; success: false }>;
  /** A button rendered beside the submit button, such as one deleting the set being edited. */
  secondaryAction?: ReactNode;
  submitLabel: string;
};

/** The name and rules of a permission set, for creating one or editing it. */
export const PermissionSetForm = ({
  initialValues,
  onSubmit,
  secondaryAction,
  submitLabel
}: PermissionSetFormProps) => {
  const { t } = useTranslation();
  const [rules, setRules] = useState(initialValues?.rules ?? []);
  const [drafts, setDrafts] = useState<PermissionSetRuleDraft[]>([createRuleDraft()]);
  const [highlightIncomplete, setHighlightIncomplete] = useState(false);

  return (
    <Form
      preventResetValuesOnReset
      additionalButtons={{ right: secondaryAction }}
      className="mx-auto max-w-3xl"
      content={{
        name: {
          kind: 'string',
          label: t({ en: 'Name', es: 'Nombre', fr: 'Nom' }),
          variant: 'input'
        }
      }}
      data-testid="permission-set-form"
      fieldsFooter={
        <div className="flex flex-col gap-1.5 pb-6">
          <h4 className="text-sm font-medium">{t({ en: 'Rules', es: 'Reglas', fr: 'Règles' })}</h4>
          <p className="text-muted-foreground mb-1.5 text-sm">
            {t({
              en: "Each rule adds to a holder's base permission level from their next sign-in. Holder's groups means the groups they belong to at that time.",
              es: 'Cada regla se suma al nivel de permisos de base del titular a partir de su próximo inicio de sesión. Grupos del titular son los grupos a los que pertenece en ese momento.',
              fr: "Chaque règle s'ajoute au niveau de base du titulaire à partir de sa prochaine connexion. Les groupes du titulaire sont ceux auxquels il appartient à ce moment-là."
            })}
          </p>
          <PermissionSetRulesEditor
            drafts={drafts}
            highlightIncomplete={highlightIncomplete}
            rules={rules}
            onDraftsChange={setDrafts}
            onRulesChange={setRules}
          />
        </div>
      }
      initialValues={{ name: initialValues?.name }}
      submitBtnLabel={submitLabel}
      validationSchema={$CreatePermissionSetData.pick({ name: true })}
      onSubmit={async ({ name }) => {
        if (drafts.some(isIncompleteRuleDraft)) {
          setHighlightIncomplete(true);
          return {
            errorMessage: t({
              en: 'A rule row is incomplete. Choose its action and resource, or remove it.',
              es: 'Una fila de reglas está incompleta. Elija su acción y su recurso, o elimínela.',
              fr: 'Une ligne de règle est incomplète. Choisissez son action et sa ressource, ou retirez-la.'
            }),
            success: false
          };
        }
        setHighlightIncomplete(false);
        const nextRules = withRuleDrafts(rules, drafts);
        if (nextRules.length === 0) {
          return {
            errorMessage: t({
              en: 'Add at least one rule. A permission set without rules grants nothing.',
              es: 'Agregue al menos una regla. Un conjunto de permisos sin reglas no concede nada.',
              fr: "Ajoutez au moins une règle. Un ensemble d'autorisations sans règle n'accorde rien."
            }),
            success: false
          };
        }
        const result = await onSubmit({ name, rules: nextRules });
        if (!result) {
          setRules(nextRules);
          setDrafts([createRuleDraft()]);
        }
        return result;
      }}
    />
  );
};
