import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET endpoint to fetch medical records
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    let records;
    
    if (session.user.role === 'PATIENT') {
      // Patients can only see their own records
      records = await prisma.medicalRecord.findMany({
        where: {
          userId: session.user.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: true
        }
      });
    } else {
      // Doctors and admins can see all records
      records = await prisma.medicalRecord.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: true
        }
      });
    }

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST endpoint to create a medical record
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { diagnosis, prescription, notes, userId, doctorId } = body;

    // Create the medical record
    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        diagnosis: diagnosis || 'N/A',
        prescription: prescription || 'N/A',
        notes: notes || '',
        user: {
          connect: {
            id: userId || session.user.id
          }
        },
        ...(doctorId && {
          doctor: {
            connect: {
              id: doctorId
            }
          }
        })
      },
      include: {
        user: true
      }
    });

    return NextResponse.json(medicalRecord);
  } catch (error) {
    console.error('Error creating medical record:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
