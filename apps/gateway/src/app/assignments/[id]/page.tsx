import type { Assignment } from '@prisma/client';

import { FormAssignment } from '@/app/components/FormAssignment';

type AssignmentPageProps = {
  params: {
    id: string;
  };
};

const getAssignment = async (id: string) => {
  const response = await fetch(`${process.env.GATEWAY_BASE_URL}/api/assignments/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json() as Promise<Assignment>;
};

const AssignmentPage = async ({ params }: AssignmentPageProps) => {
  const assignment = await getAssignment(params.id);

  return (
    <div className="mx-auto max-w-3xl pt-8">
      <FormAssignment instrumentBundle={assignment.instrumentBundle} />
    </div>
  );
};

export default AssignmentPage;
