import { updateAssignmentDataSchema } from '@open-data-capture/common/assignment';

import prisma from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const assignment = await prisma.assignment.findFirst({
    where: { id: params.id }
  });
  return Response.json(assignment);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  console.log('Recieved patch!!');
  const data: unknown = await request.json();
  const result = await updateAssignmentDataSchema.safeParseAsync(data);
  if (!result.success) {
    return Response.json({ issues: result.error.issues, message: 'Bad Request' }, { status: 400 });
  }

  const assignment = await prisma.assignment.update({
    data: result.data,
    where: { id: params.id }
  });
  return Response.json(assignment);
}
