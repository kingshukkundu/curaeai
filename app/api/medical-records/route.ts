import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    console.error('No user ID in session:', session);
    return new NextResponse('User ID not found in session', { status: 401 });
  }
  


  try {
    const body = await request.json();
    const { conversation } = body;

    if (!Array.isArray(conversation) || conversation.length === 0) {
      console.error('Invalid or empty conversation data:', conversation);
      return new NextResponse('Invalid conversation data', { status: 400 });
    }

    // Create a formatted diagnosis text from the conversation
    const diagnosisText = conversation
      .map((item: { question: string; answer: string }) => {
        if (!item?.question || !item?.answer) {
          console.error('Invalid conversation item:', item);
          throw new Error('Invalid conversation format');
        }
        return `Q: ${item.question}\nA: ${item.answer}`;
      })
      .join('\n\n');

    // Create the medical record
    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        diagnosis: 'AI Diagnosis Session',
        prescription: 'N/A',
        notes: diagnosisText,
        user: {
          connect: {
            id: session.user.id
          }
        }
      }
    });

    return NextResponse.json(medicalRecord);
  } catch (error) {
    console.error('Error creating medical record:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
