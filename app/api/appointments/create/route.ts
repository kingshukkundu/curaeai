import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { doctorId, datetime, notes } = body;

    // Validate required fields
    if (!doctorId || !datetime) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Get the patient ID for the current user
    const patient = await prisma.patient.findFirst({
      where: {
        userId: session.user.id
      }
    });

    if (!patient) {
      return new NextResponse('Patient profile not found', { status: 404 });
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId,
        datetime: new Date(datetime),
        notes,
        status: 'SCHEDULED'
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        doctor: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
