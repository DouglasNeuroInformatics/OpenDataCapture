import { Button } from '@douglasneuroinformatics/ui';
import { useTranslation } from 'react-i18next';

export type ReviewFormProps = {
  onSubmit: () => void;
};

export const ReviewForm = ({ onSubmit }: ReviewFormProps) => {
  const { t } = useTranslation();
  return (
    <div>
      <p>Review</p>
      <Button label={t('submit')} type="button" onClick={onSubmit} />
    </div>
  );
};
