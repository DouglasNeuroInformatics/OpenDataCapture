import crypto from 'crypto';

import { createAssignmentBundleDataSchema } from '@open-data-capture/common/assignment';

import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const subjectIdentifier = url.searchParams.get('subjectIdentifier');
  const data = await prisma.assignment.findMany({
    where: {
      subjectIdentifier: subjectIdentifier ?? undefined
    }
  });
  return Response.json(data);
}

export async function POST(request: Request) {
  const data: unknown = await request.json();
  const result = await createAssignmentBundleDataSchema.safeParseAsync(data);
  if (!result.success) {
    return Response.json({ issues: result.error.issues, message: 'Bad Request' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const assignment = await prisma.assignment.create({
    data: {
      assignedAt: new Date(),
      id,
      status: 'OUTSTANDING',
      url: `${process.env.GATEWAY_BASE_URL}/assignments/${id}`,
      ...result.data
    }
  });
  return Response.json(assignment, { status: 201 });
}
