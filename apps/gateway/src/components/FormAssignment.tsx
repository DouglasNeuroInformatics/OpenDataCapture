// 'use client';

// import type { FormDataType } from '@douglasneuroinformatics/form-types';
// import { useNotificationsStore } from '@douglasneuroinformatics/ui';
// import { type FormInstrument } from '@open-data-capture/common/instrument';
// import { evaluateInstrument } from '@open-data-capture/instrument-runtime';
// import { FormStepper } from '@open-data-capture/react-core/components/FormStepper';
// import { translateFormInstrument } from '@open-data-capture/react-core/utils/translate-instrument';
// import { useTranslation } from 'react-i18next';

// export type FormAssignmentProps = {
//   id: string;
//   instrumentBundle: string;
// };

// export const FormAssignment = ({ id, instrumentBundle }: FormAssignmentProps) => {
//   const { i18n } = useTranslation();
//   const notifications = useNotificationsStore();

//   const instrument = evaluateInstrument<FormInstrument>(instrumentBundle);
//   const form = translateFormInstrument(instrument, i18n.resolvedLanguage === 'fr' ? 'fr' : 'en');

//   const handleSubmit = async (data: FormDataType) => {
//     const response = await fetch(`/api/assignments/${id}`, {
//       body: JSON.stringify({
//         record: {
//           data
//         }
//       }),
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       method: 'PATCH'
//     });
//     notifications.addNotification({ type: response.ok ? 'success' : 'error' });
//   };

//   return (
//     <div>
//       <h3 className="my-8 text-center text-xl font-bold">{form.details.title}</h3>
//       <FormStepper form={form} onSubmit={handleSubmit} />
//     </div>
//   );
// };
