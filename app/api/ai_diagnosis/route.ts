import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { threadId, userResponse } = body;

    // If no threadId, this is the start of a new conversation
    if (!threadId) {
      return NextResponse.json({
        threadId: session.user.id, // Use user ID as thread ID for simplicity
        question: 'Describe your problem',
        exitCode: false
      });
    }

    // If we have a response, store it and end the conversation
    if (userResponse) {
      // Store the conversation in medical records
      await prisma.medicalRecord.create({
        data: {
          type: 'AI_DIAGNOSIS',
          diagnosis: 'AI Diagnosis Session',
          prescription: 'N/A',
          notes: `Patient&apos;s Description: ${userResponse}`,
          userId: session.user.id,
          doctorId: session.user.id // For AI diagnosis, set doctor as self
        }
      });

      // Return final response with exit code
      return NextResponse.json({
        threadId,
        question: 'Thank you for your response. Your information has been recorded.',
        exitCode: true
      });
    }

    // This shouldn't happen, but handle it gracefully
    return NextResponse.json({
      threadId,
      question: 'An error occurred. Please start a new conversation.',
      exitCode: true
    });
  } catch (error) {
    console.error('Error in AI diagnosis:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
