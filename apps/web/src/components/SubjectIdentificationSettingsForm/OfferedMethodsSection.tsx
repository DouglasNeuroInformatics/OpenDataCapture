import { Checkbox, Heading, Label } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { $SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';
import type { SubjectIdentificationMethod } from '@opendatacapture/schemas/subject';

import { getValueForLanguage } from '@/utils/language';
import { sortByLabel } from '@/utils/sort-by-label';
import type { CustomFieldsDraft } from '@/utils/subject-identification-draft';

type OfferedMethodsSectionProps = {
  customFields: CustomFieldsDraft | null;
  onChange: (offeredMethods: SubjectIdentificationMethod[]) => void;
  showErrors: boolean;
  title: string;
  value: SubjectIdentificationMethod[];
};

export const OfferedMethodsSection = ({
  customFields,
  onChange,
  showErrors,
  title,
  value
}: OfferedMethodsSectionProps) => {
  const { resolvedLanguage, t } = useTranslation();
  const labels: { [K in SubjectIdentificationMethod]: string } = {
    CUSTOM_FIELDS:
      (customFields && getValueForLanguage(customFields.label, resolvedLanguage)) ??
      t({ en: 'Custom fields', es: 'Campos personalizados', fr: 'Champs personnalisés' }),
    CUSTOM_ID: t('common.customIdentifier'),
    PERSONAL_INFO: t('common.personalInfo')
  };

  const toggle = (method: SubjectIdentificationMethod) => {
    onChange(value.includes(method) ? value.filter((offered) => offered !== method) : [...value, method]);
  };

  return (
    <section className="flex flex-col gap-3" data-testid="offered-methods">
      <Heading variant="h5">{title}</Heading>
      <p className="text-muted-foreground text-sm">
        {t({
          en: 'The methods staff can identify subjects by in Start Session, the data hub lookup and a group’s default method. Changing them changes no subject’s id, so it can be undone.',
          es: 'Los métodos con los que el personal puede identificar a los sujetos al iniciar una sesión, en la búsqueda del centro de datos y como método predeterminado de un grupo. Cambiarlos no modifica el identificador de ningún sujeto, por lo que se puede deshacer.',
          fr: "Les méthodes par lesquelles le personnel peut identifier les sujets au démarrage d'une session, dans la recherche du centre de données et comme méthode par défaut d'un groupe. Les modifier ne change l'identifiant d'aucun sujet ; c'est donc réversible."
        })}
      </p>
      {sortByLabel($SubjectIdentificationMethod.options.map((method) => ({ label: labels[method], method }))).map(
        ({ label, method }) => {
          // Custom fields can be offered only once they are defined; the definition is saved with this.
          const isUnavailable = method === 'CUSTOM_FIELDS' && customFields === null;
          return (
            <div className="flex items-center gap-2" key={method}>
              <Checkbox
                checked={value.includes(method)}
                data-testid={`offered-method-${method}`}
                disabled={isUnavailable}
                id={`offered-method-${method}`}
                onCheckedChange={() => toggle(method)}
              />
              <Label htmlFor={`offered-method-${method}`}>{label}</Label>
            </div>
          );
        }
      )}
      {showErrors && value.length === 0 && (
        <p className="text-destructive text-sm font-medium" data-testid="offered-methods-error">
          {t({
            en: 'Offer at least one method.',
            es: 'Ofrezca al menos un método.',
            fr: 'Proposez au moins une méthode.'
          })}
        </p>
      )}
    </section>
  );
};
