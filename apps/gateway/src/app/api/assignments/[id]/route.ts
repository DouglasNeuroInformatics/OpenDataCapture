import { updateAssignmentDataSchema } from '@open-data-capture/common/assignment';
import type { Assignment } from '@prisma/client';

import prisma from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const assignment = await prisma.assignment.findFirst({
    include: {
      record: true
    },
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

  let assignment: Assignment;
  if (result.data.record) {
    assignment = await prisma.assignment.update({
      data: {
        expiresAt: result.data.expiresAt,
        record: {
          create: {
            completedAt: new Date(),
            data: result.data.record.data
          }
        },
        status: 'COMPLETE'
      },
      where: { id: params.id }
    });
  } else {
    assignment = await prisma.assignment.update({
      data: result.data as Omit<typeof result.data, 'record'>,
      where: { id: params.id }
    });
  }

  return Response.json(assignment);
}
