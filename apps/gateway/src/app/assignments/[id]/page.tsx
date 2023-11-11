import type { Assignment } from '@prisma/client';
import { notFound } from 'next/navigation';

import { FormAssignment } from '@/components/FormAssignment';

type AssignmentPageProps = {
  params: {
    id: string;
  };
};

const getAssignment = async (id: string) => {
  const response = await fetch(`${process.env.GATEWAY_BASE_URL}/api/assignments/${id}`);
  if (!response.ok) {
    return null;
  }
  return response.json() as Promise<Assignment>;
};

const AssignmentPage = async ({ params }: AssignmentPageProps) => {
  const assignment = await getAssignment(params.id);

  if (!assignment) {
    notFound();
  }

  return (
    <div>
      <FormAssignment id={params.id} instrumentBundle={assignment.instrumentBundle} />
    </div>
  );
};

export default AssignmentPage;
