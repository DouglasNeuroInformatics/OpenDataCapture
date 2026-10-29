import { Select } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import type { CanonicalField } from '@/utils/bulk-assignments';

/** The value standing for "this column is ignored", which a Select cannot express as `undefined`. */
const NOT_USED = '__not_used__';

const FIELD_LABELS: { [K in CanonicalField]: { en: string; es: string; fr: string } } = {
  dateOfBirth: { en: 'Date of Birth', es: 'Fecha de nacimiento', fr: 'Date de naissance' },
  email: { en: 'Email', es: 'Correo electrónico', fr: 'Courriel' },
  firstName: { en: 'First Name', es: 'Nombre', fr: 'Prénom' },
  lastName: { en: 'Last Name', es: 'Apellido', fr: 'Nom' },
  sex: { en: 'Sex at Birth', es: 'Sexo al nacer', fr: 'Sexe à la naissance' },
  subjectId: { en: 'Subject ID', es: 'Identificador del sujeto', fr: 'Identifiant du sujet' }
};

type ColumnFieldSelectProps = {
  /** Fields another column already claims, which this one may not take as well. */
  claimed: Set<CanonicalField>;
  'data-testid': string;
  /** The fields this mapper offers at all, in the order they are offered. */
  fields: readonly CanonicalField[];
  onChange: (field: CanonicalField | undefined) => void;
  value: CanonicalField | undefined;
};

/**
 * Says what one column of an uploaded file holds. Shared by the subject batch and the email list,
 * which offer different fields but have to read, name and claim them identically - a column meaning
 * one thing in one panel and another in the other is how a batch gets assigned to the wrong people.
 */
export const ColumnFieldSelect = ({
  claimed,
  'data-testid': testId,
  fields,
  onChange,
  value
}: ColumnFieldSelectProps) => {
  const { t } = useTranslation();
  return (
    <Select
      value={value ?? NOT_USED}
      onValueChange={(next) => onChange(next === NOT_USED ? undefined : (next as CanonicalField))}
    >
      <Select.Trigger className={value ? 'w-48' : 'text-muted-foreground w-48 italic'} data-testid={testId}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value={NOT_USED}>{t({ en: 'Not Used', es: 'No utilizada', fr: 'Non utilisée' })}</Select.Item>
        {fields
          .filter((field) => !claimed.has(field) || field === value)
          .map((field) => (
            <Select.Item key={field} value={field}>
              {t(FIELD_LABELS[field])}
            </Select.Item>
          ))}
      </Select.Content>
    </Select>
  );
};
