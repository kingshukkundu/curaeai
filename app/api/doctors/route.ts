import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession();
  
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR'
      },
      select: {
        id: true,
        name: true
      }
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
