import { Spinner } from '@douglasneuroinformatics/ui';
import { useParams } from 'react-router-dom';

import { PageHeader } from '@/components/PageHeader';

import { FormStepper } from '../components/FormStepper';
import { useFormQuery } from '../hooks/useFormQuery';

export const FormPage = () => {
  const params = useParams();

  const query = useFormQuery(params.id!);

  if (!query.data) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader title={query.data.details.title} />
      <div className="mx-auto max-w-3xl">
        <FormStepper
          form={query.data}
          onSubmit={(data) => {
            // eslint-disable-next-line no-alert
            alert(JSON.stringify(data));
          }}
        />
      </div>
    </div>
  );
};
