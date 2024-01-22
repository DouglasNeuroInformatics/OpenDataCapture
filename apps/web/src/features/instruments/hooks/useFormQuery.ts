// import type { Language } from '@open-data-capture/common/core';
// import { $InstrumentBundleContainer, type InstrumentKind } from '@open-data-capture/common/instrument';
// import { InstrumentInterpreter } from '@open-data-capture/instrument-interpreter';
// import { translateFormInstrument } from '@open-data-capture/react-core/utils/translate-instrument';
// import { useQuery } from '@tanstack/react-query';
// import axios from 'axios';
// import { useTranslation } from 'react-i18next';

// const interpreter = new InstrumentInterpreter();

// export function useFormQuery(id: string) {
//   const { i18n } = useTranslation();
//   return useQuery({
//     queryFn: async () => {
//       const response = await axios.get(`/v1/instruments/${id}`, {
//         params: {
//           kind: 'FORM' satisfies InstrumentKind
//         }
//       });
//       const { bundle } = await $InstrumentBundleContainer.parseAsync(response.data);
//       const form = await interpreter.interpret(bundle, { kind: 'FORM', validate: import.meta.env.DEV });
//       return Object.assign(translateFormInstrument(form, i18n.resolvedLanguage as Language), {
//         id
//       });
//     },
//     queryKey: ['form', id, i18n.resolvedLanguage]
//   });
// }
