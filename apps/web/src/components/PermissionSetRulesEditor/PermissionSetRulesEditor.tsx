import { Button, Table } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { $AppAction, $AppSubjectName, isGroupScopableSubject } from '@opendatacapture/schemas/core';
import { $PermissionSetScope, isPermissionSetGrantable } from '@opendatacapture/schemas/permission-set';
import type { PermissionSetRule, PermissionSetScope } from '@opendatacapture/schemas/permission-set';
import { GlobeIcon, PlusIcon, Trash2Icon, UsersIcon } from 'lucide-react';

import { CellSelect } from '@/components/CellSelect';
import { usePermissionLabels } from '@/hooks/usePermissionLabels';
import { createRuleDraft, isIncompleteRuleDraft } from '@/utils/permission-set-rules';
import type { PermissionSetRuleDraft } from '@/utils/permission-set-rules';
import { grantableActions, grantableSubjects, withoutIndex } from '@/utils/permissions';

type PermissionSetRulesEditorProps =
  | {
      drafts: PermissionSetRuleDraft[];
      highlightIncomplete?: boolean;
      onDraftsChange: (drafts: PermissionSetRuleDraft[]) => void;
      onRulesChange: (rules: PermissionSetRule[]) => void;
      readOnly?: false;
      rules: PermissionSetRule[];
    }
  | {
      readOnly: true;
      rules: PermissionSetRule[];
    };

/**
 * The rules of a permission set: the saved ones above, with rows for adding more beneath them. Only
 * what a set may contain is offered, so `manage all` never is. Read-only, it lists the rules alone.
 */
export const PermissionSetRulesEditor = (props: PermissionSetRulesEditorProps) => {
  const { t } = useTranslation();
  const { actionLabels, columnLabels, subjectLabels } = usePermissionLabels();
  const { rules } = props;
  const editor = props.readOnly ? null : props;

  const scopeLabels: { [K in PermissionSetScope]: string } = {
    ALL_GROUPS: t({ en: 'Every group', es: 'Todos los grupos', fr: 'Tous les groupes' }),
    HOLDER_GROUPS: t({ en: "Holder's groups", es: 'Grupos del titular', fr: 'Groupes du titulaire' })
  };
  const placeholder = t({ en: 'Choose…', es: 'Elija…', fr: 'Choisir…' });
  const removeLabel = t({ en: 'Remove rule', es: 'Retirar la regla', fr: 'Retirer la règle' });
  const addLabel = t({ en: 'Add Rule', es: 'Agregar una regla', fr: 'Ajouter une règle' });

  const updateDraft = (index: number, changes: Partial<PermissionSetRuleDraft>) => {
    editor?.onDraftsChange(
      editor.drafts.map((draft, draftIndex) => (draftIndex === index ? { ...draft, ...changes } : draft))
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg border">
        <Table className="table-fixed" data-testid="permission-set-rules-table">
          <Table.Header>
            <Table.Row className="bg-background/60 hover:bg-background/60">
              <Table.Head className="w-[25%]">{columnLabels.action}</Table.Head>
              <Table.Head className="w-[33%]">{columnLabels.subject}</Table.Head>
              <Table.Head className="w-[30%]">{columnLabels.scope}</Table.Head>
              {editor && <Table.Head className="w-24" />}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rules.map((rule, index) => (
              <Table.Row
                data-testid="permission-set-rule-row"
                key={`${index}-${rule.action}-${rule.subject}-${rule.scope}`}
              >
                <Table.Cell className="font-medium">{actionLabels[rule.action]}</Table.Cell>
                <Table.Cell>{subjectLabels[rule.subject]}</Table.Cell>
                <Table.Cell data-testid="permission-set-rule-scope">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5',
                      rule.scope === 'ALL_GROUPS' && 'text-amber-700 dark:text-amber-300'
                    )}
                  >
                    {rule.scope === 'ALL_GROUPS' ? (
                      <GlobeIcon aria-hidden className="h-3.5 w-3.5" />
                    ) : (
                      <UsersIcon aria-hidden className="h-3.5 w-3.5" />
                    )}
                    {scopeLabels[rule.scope]}
                  </span>
                </Table.Cell>
                {editor && (
                  <Table.Cell className="py-1.5 text-right">
                    <Button
                      aria-label={removeLabel}
                      className="text-muted-foreground hover:text-destructive"
                      data-testid="permission-set-rule-remove"
                      size="icon"
                      type="button"
                      variant="ghost"
                      onClick={() => editor.onRulesChange(withoutIndex(rules, index))}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </Table.Cell>
                )}
              </Table.Row>
            ))}
          </Table.Body>
          {editor && (
            <Table.Footer className="bg-transparent font-normal">
              {editor.drafts.map((draft, index) => {
                const { action, scope, subject } = draft;
                const isFlagged = editor.highlightIncomplete && isIncompleteRuleDraft(draft);
                return (
                  <Table.Row
                    aria-invalid={isFlagged || undefined}
                    className={cn(isFlagged && 'bg-destructive/10 hover:bg-destructive/10')}
                    data-testid="add-rule-row"
                    key={index}
                  >
                    <Table.Cell>
                      <CellSelect
                        label={columnLabels.action}
                        name="rule-action"
                        options={Object.fromEntries(
                          grantableActions(subject, isPermissionSetGrantable).map((option) => [
                            option,
                            actionLabels[option]
                          ])
                        )}
                        placeholder={placeholder}
                        value={action}
                        onValueChange={(value) => updateDraft(index, { action: $AppAction.parse(value) })}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <CellSelect
                        label={columnLabels.subject}
                        name="rule-subject"
                        options={Object.fromEntries(
                          grantableSubjects(action, isPermissionSetGrantable).map((option) => [
                            option,
                            subjectLabels[option]
                          ])
                        )}
                        placeholder={placeholder}
                        value={subject}
                        onValueChange={(value) => updateDraft(index, { subject: $AppSubjectName.parse(value) })}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      {subject !== undefined &&
                        (isGroupScopableSubject(subject) ? (
                          <CellSelect
                            label={columnLabels.scope}
                            name="rule-scope"
                            options={scopeLabels}
                            placeholder={placeholder}
                            value={scope}
                            onValueChange={(value) => updateDraft(index, { scope: $PermissionSetScope.parse(value) })}
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm" data-testid="rule-scope-fixed">
                            {scopeLabels.ALL_GROUPS}
                          </span>
                        ))}
                    </Table.Cell>
                    <Table.Cell className="py-1.5 text-right">
                      <Button
                        aria-label={removeLabel}
                        data-testid="rule-draft-remove"
                        size="icon"
                        type="button"
                        variant="ghost"
                        onClick={() => editor.onDraftsChange(withoutIndex(editor.drafts, index))}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                      <Button
                        aria-label={addLabel}
                        className="text-muted-foreground hover:text-primary"
                        data-testid="rule-draft-add"
                        size="icon"
                        type="button"
                        variant="ghost"
                        onClick={() => editor.onDraftsChange([...editor.drafts, createRuleDraft()])}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
              {editor.drafts.length === 0 && (
                <Table.Row>
                  <Table.Cell className="text-right" colSpan={4}>
                    <Button
                      aria-label={addLabel}
                      data-testid="rule-draft-add"
                      type="button"
                      variant="ghost"
                      onClick={() => editor.onDraftsChange([createRuleDraft()])}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Footer>
          )}
        </Table>
      </div>
      {editor?.highlightIncomplete && editor.drafts.some(isIncompleteRuleDraft) && (
        <p className="text-destructive text-sm font-medium" data-testid="rule-drafts-incomplete" role="alert">
          {t({
            en: 'Complete or remove the highlighted rule rows before saving.',
            es: 'Complete o elimine las filas de reglas resaltadas antes de guardar.',
            fr: 'Complétez ou retirez les lignes de règle en surbrillance avant d’enregistrer.'
          })}
        </p>
      )}
    </div>
  );
};
