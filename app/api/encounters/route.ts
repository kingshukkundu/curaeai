import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const patientId = searchParams.get('patientId');

    let appointments;
    if (date) {
      // Get today's appointments for the doctor
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      appointments = await prisma.appointment.findMany({
        where: {
          doctorId: session.user.id,
          datetime: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: 'SCHEDULED'
        },
        include: {
          patient: {
            include: {
              user: true
            }
          }
        }
      });
    }

    let patients;
    if (patientId) {
      // Search for specific patient
      patients = await prisma.patient.findMany({
        where: {
          OR: [
            {
              user: {
                id: patientId
              }
            },
            {
              user: {
                name: {
                  contains: patientId,
                  mode: 'insensitive'
                }
              }
            }
          ]
        },
        include: {
          user: true
        }
      });
    }

    return NextResponse.json({ appointments, patients });
  } catch (error) {
    console.error('Error in encounters API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || session.user.role !== 'DOCTOR') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { patientId, symptoms, diagnosis, prescription, notes, tests, referrals } = body;

    // Create the medical record (encounter)
    const record = await prisma.medicalRecord.create({
      data: {
        type: 'ENCOUNTER',
        userId: patientId,
        doctorId: session.user.id,
        symptoms,
        diagnosis,
        prescription,
        notes,
      }
    });

    interface TestInput {
      name: string;
      description?: string;
    }

    interface ReferralInput {
      doctorId: string;
      reason: string;
      notes?: string;
    }

    // Create tests if any
    if (tests && tests.length > 0) {
      await prisma.test.createMany({
        data: (tests as TestInput[]).map((test) => ({
          name: test.name,
          description: test.description,
          patientId: patientId,
          recordId: record.id
        }))
      });
    }

    // Create referrals if any
    if (referrals && referrals.length > 0) {
      await prisma.referral.createMany({
        data: (referrals as ReferralInput[]).map((referral) => ({
          patientId: patientId,
          referringDoctorId: session.user.id,
          referredDoctorId: referral.doctorId,
          reason: referral.reason,
          notes: referral.notes,
          recordId: record.id
        }))
      });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error creating encounter:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
