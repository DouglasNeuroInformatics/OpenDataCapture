import { type FormInstrument, evaluateInstrument } from '@open-data-capture/common/instrument';
import { FormStepper } from '@open-data-capture/react-core/components';
import { translateFormInstrument } from '@open-data-capture/react-core/utils/translate-instrument';

type IndexPageProps = {
  bundle: string;
};

const IndexPage = ({ bundle }: IndexPageProps) => {
  const instrument = evaluateInstrument<FormInstrument>(bundle);
  const form = translateFormInstrument(instrument, 'en');

  return (
    <div className="mx-auto mt-8 max-w-3xl">
      <FormStepper
        form={form}
        onSubmit={(data) => {
          // eslint-disable-next-line no-alert
          alert(JSON.stringify(data));
        }}
      />
    </div>
  );
};

export default IndexPage;
