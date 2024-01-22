export const FormPage = () => {
  return null;
};

// import { useEffect } from 'react';

// import type { FormDataType } from '@douglasneuroinformatics/form-types';
// import { Spinner, useNotificationsStore } from '@douglasneuroinformatics/ui';
// import { FormStepper } from '@open-data-capture/react-core/components/FormStepper';
// import axios from 'axios';
// import { useNavigate, useParams } from 'react-router-dom';

// import { PageHeader } from '@/components/PageHeader';
// import { useActiveVisitStore } from '@/stores/active-visit-store';
// import { useAuthStore } from '@/stores/auth-store';

// import { useFormQuery } from '../hooks/useFormQuery';

// export const FormPage = () => {
//   const { activeVisit } = useActiveVisitStore();
//   const { currentGroup } = useAuthStore();
//   const params = useParams();
//   const navigate = useNavigate();
//   const notifications = useNotificationsStore();

//   const query = useFormQuery(params.id!);

//   useEffect(() => {
//     if (!activeVisit) {
//       navigate('/instruments/available-instruments');
//     }
//   }, [activeVisit]);

//   const handleSubmit = async (data: FormDataType) => {
//     await axios.post('/v1/instrument-records', {
//       data,
//       date: new Date(),
//       groupId: currentGroup?.id,
//       instrumentId: query.data?.id,
//       subjectId: activeVisit?.subject.id
//     });
//     notifications.addNotification({ type: 'success' });
//   };

//   if (!query.data) {
//     return <Spinner />;
//   }

//   return (
//     <div>
//       <PageHeader className="print:hidden" title={query.data.details.title} />
//       <div className="mx-auto max-w-3xl">
//         <FormStepper form={query.data} subject={activeVisit?.subject} onSubmit={handleSubmit} />
//       </div>
//     </div>
//   );
// };
