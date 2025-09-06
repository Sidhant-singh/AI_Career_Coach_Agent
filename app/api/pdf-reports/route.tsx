import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/configs/db';
import { HistoryTable } from '@/configs/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { recordId, pdfData, interviewData } = await request.json();

    if (!recordId || !pdfData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In a real implementation, you would upload the PDF to ImageKit here
    // For now, we'll simulate the upload and store the metadata
    
    const pdfUrl = `https://ik.imagekit.io/your-imagekit-id/interview-reports/${recordId}.pdf`;
    const pdfId = `interview-report-${recordId}`;

    // Update the history record with PDF information
    await db.update(HistoryTable)
      .set({
        pdfReportUrl: pdfUrl,
        pdfReportId: pdfId,
        interviewType: interviewData?.interviewType,
        interviewDuration: interviewData?.duration,
        domain: interviewData?.domain,
        conversationHistory: interviewData?.conversationHistory,
        finalScore: interviewData?.finalScore,
        codeAnalysis: interviewData?.codeAnalysis,
        avatarVideoUrl: interviewData?.avatarVideoUrl,
        avatarVideoId: interviewData?.avatarVideoId
      })
      .where(eq(HistoryTable.recordId, recordId));

    return NextResponse.json({
      success: true,
      pdfUrl,
      pdfId,
      message: 'PDF report saved successfully'
    });

  } catch (error) {
    console.error('Error saving PDF report:', error);
    return NextResponse.json({ 
      error: 'Failed to save PDF report' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get('recordId');

    if (!recordId) {
      return NextResponse.json({ error: 'Missing recordId' }, { status: 400 });
    }

    // Get the history record with PDF information
    const result = await db.select()
      .from(HistoryTable)
      .where(eq(HistoryTable.recordId, recordId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const record = result[0];

    return NextResponse.json({
      success: true,
      data: {
        recordId: record.recordId,
        pdfReportUrl: record.pdfReportUrl,
        pdfReportId: record.pdfReportId,
        interviewType: record.interviewType,
        interviewDuration: record.interviewDuration,
        domain: record.domain,
        conversationHistory: record.conversationHistory,
        finalScore: record.finalScore,
        codeAnalysis: record.codeAnalysis,
        avatarVideoUrl: record.avatarVideoUrl,
        avatarVideoId: record.avatarVideoId,
        createdAt: record.createdAt
      }
    });

  } catch (error) {
    console.error('Error fetching PDF report:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch PDF report' 
    }, { status: 500 });
  }
}


