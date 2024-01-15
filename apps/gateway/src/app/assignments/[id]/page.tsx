// import type { Assignment, AssignmentRecord } from '@prisma/client';
// import { notFound, redirect } from 'next/navigation';

// import { FormAssignment } from '@/components/FormAssignment';

// type AssignmentPageProps = {
//   params: {
//     id: string;
//   };
// };

// const getAssignment = async (id: string) => {
//   const response = await fetch(`${process.env.GATEWAY_BASE_URL}/api/assignments/${id}`, { cache: 'no-store' });
//   if (!response.ok) {
//     return null;
//   }
//   return response.json() as Promise<
//     Assignment & {
//       record?: AssignmentRecord;
//     }
//   >;
// };

// const AssignmentPage = async ({ params }: AssignmentPageProps) => {
//   const assignment = await getAssignment(params.id);

//   if (!assignment) {
//     notFound();
//   } else if (assignment.record?.completedAt) {
//     redirect('/assignments/completed');
//   } else if (assignment.status === 'CANCELED') {
//     redirect('/assignments/canceled');
//   }

//   return (
//     <div>
//       <FormAssignment id={params.id} instrumentBundle={assignment.instrumentBundle} />
//     </div>
//   );
// };

// export default AssignmentPage;
