import prisma from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const assignment = await prisma.assignment.findFirst({
    where: { id: params.id }
  });
  return Response.json(assignment);
}
