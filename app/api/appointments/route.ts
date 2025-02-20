import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession();
  
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    let appointments;
    
    if (session.user.role === 'PATIENT') {
      // For patients, only return their own appointments
      appointments = await prisma.appointment.findMany({
        where: {
          patientId: session.user.id
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
    } else {
      // For doctors and admins, return all appointments
      appointments = await prisma.appointment.findMany({
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
    }

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
