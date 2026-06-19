import { Checkbox, Label } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

type BoldToggleProps = {
  checked: boolean;
  id: string;
  onChange: (checked: boolean) => void;
};

/** Bold on/off toggle shown next to a section's "Show" checkbox. */
export const BoldToggle = ({ checked, id, onChange }: BoldToggleProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <Checkbox checked={checked} id={id} onCheckedChange={(c) => onChange(c === true)} />
      <Label className="cursor-pointer text-sm font-normal" htmlFor={id}>
        {t({ en: 'Bold', fr: 'Gras' })}
      </Label>
    </div>
  );
};
