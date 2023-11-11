/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import crypto from 'crypto';

import { createAssignmentBundleDataSchema } from '@open-data-capture/common/assignment';

import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const subjectIdentifier = url.searchParams.get('subjectIdentifier');
  const data = await prisma.assignment.findMany({
    include: {
      record: true
    },
    where: {
      subjectIdentifier: subjectIdentifier ?? undefined
    }
  });
  data.map((assignment: any) => {
    if (assignment.record?.data) {
      assignment.record.data = JSON.parse(assignment.record.data);
    }
    return assignment;
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
