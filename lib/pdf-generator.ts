import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface InterviewReportData {
  interviewDetails: {
    domain: string;
    duration: number;
    date: string;
    conversationTurns: number;
    interviewType: string;
  };
  conversationHistory: Array<{
    ai_message: string;
    user_response: string;
    timestamp: string;
  }>;
  feedback: {
    overall_score: number;
    strengths: string[];
    areas_for_improvement: string[];
    detailed_analysis: string;
    recommendations: string[];
    next_steps: string;
    code_analysis?: {
      correctness: number;
      efficiency: number;
      readability: number;
      time_complexity: string;
      space_complexity: string;
      suggestions: string[];
    };
  };
}

export const generateInterviewPDF = async (reportData: InterviewReportData): Promise<Blob> => {
  try {
    const pdf = new jsPDF();
  
  // Set up fonts and colors
  const primaryColor = '#2563eb';
  const secondaryColor = '#64748b';
  const successColor = '#059669';
  const warningColor = '#d97706';
  
  let yPosition = 20;
  
  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);
  };
  
  // Helper function to add a section header
  const addSectionHeader = (title: string, y: number) => {
    pdf.setFontSize(16);
    pdf.setTextColor(primaryColor);
    pdf.text(title, 20, y);
    pdf.setDrawColor(primaryColor);
    pdf.line(20, y + 2, 190, y + 2);
    return y + 10;
  };
  
  // Helper function to add a subsection
  const addSubsection = (title: string, y: number) => {
    pdf.setFontSize(12);
    pdf.setTextColor(secondaryColor);
    pdf.text(title, 20, y);
    return y + 6;
  };
  
  // Title
  pdf.setFontSize(24);
  pdf.setTextColor(primaryColor);
  pdf.text('AI Interview Report', 20, yPosition);
  yPosition += 15;
  
  // Interview Details
  yPosition = addSectionHeader('Interview Details', yPosition);
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  const details = [
    `Domain: ${reportData.interviewDetails.domain || 'Not specified'}`,
    `Type: ${reportData.interviewDetails.interviewType || 'Not specified'}`,
    `Duration: ${reportData.interviewDetails.duration || 0} minutes`,
    `Date: ${reportData.interviewDetails.date ? new Date(reportData.interviewDetails.date).toLocaleDateString() : 'Not specified'}`,
    `Conversation Turns: ${reportData.interviewDetails.conversationTurns || 0}`
  ];
  
  details.forEach(detail => {
    pdf.text(detail, 20, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;
  
  // Overall Score
  yPosition = addSectionHeader('Overall Performance', yPosition);
  
  pdf.setFontSize(36);
  pdf.setTextColor(primaryColor);
  pdf.text(`${reportData.feedback.overall_score || 0}/100`, 20, yPosition);
  
  pdf.setFontSize(10);
  pdf.setTextColor(secondaryColor);
  pdf.text('Overall Score', 20, yPosition + 8);
  
  yPosition += 20;
  
  // Detailed Analysis
  yPosition = addSectionHeader('Detailed Analysis', yPosition);
  
  yPosition = addSubsection('Analysis:', yPosition);
  yPosition = addWrappedText(reportData.feedback.detailed_analysis || 'No detailed analysis provided', 20, yPosition, 170) + 5;
  
  // Strengths
  yPosition = addSectionHeader('Strengths', yPosition);
  
  if (reportData.feedback.strengths && Array.isArray(reportData.feedback.strengths)) {
    reportData.feedback.strengths.forEach((strength, index) => {
      pdf.setFontSize(10);
      pdf.setTextColor(successColor);
      pdf.text('✓', 20, yPosition);
      pdf.setTextColor(0, 0, 0);
      pdf.text(strength || 'Strength not specified', 28, yPosition);
      yPosition += 6;
    });
  } else {
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text('No strengths specified', 20, yPosition);
    yPosition += 6;
  }
  
  yPosition += 5;
  
  // Areas for Improvement
  yPosition = addSectionHeader('Areas for Improvement', yPosition);
  
  if (reportData.feedback.areas_for_improvement && Array.isArray(reportData.feedback.areas_for_improvement)) {
    reportData.feedback.areas_for_improvement.forEach((area, index) => {
      pdf.setFontSize(10);
      pdf.setTextColor(warningColor);
      pdf.text('⚠', 20, yPosition);
      pdf.setTextColor(0, 0, 0);
      pdf.text(area || 'Area not specified', 28, yPosition);
      yPosition += 6;
    });
  } else {
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text('No areas for improvement specified', 20, yPosition);
    yPosition += 6;
  }
  
  yPosition += 5;
  
  // Code Analysis (if available)
  if (reportData.feedback.code_analysis) {
    yPosition = addSectionHeader('Code Analysis', yPosition);
    
    const codeAnalysis = reportData.feedback.code_analysis;
    
    yPosition = addSubsection('Correctness:', yPosition);
    pdf.text(`${codeAnalysis.correctness || 0}/100`, 20, yPosition);
    yPosition += 6;
    
    yPosition = addSubsection('Efficiency:', yPosition);
    pdf.text(`${codeAnalysis.efficiency || 0}/100`, 20, yPosition);
    yPosition += 6;
    
    yPosition = addSubsection('Readability:', yPosition);
    pdf.text(`${codeAnalysis.readability || 0}/100`, 20, yPosition);
    yPosition += 6;
    
    yPosition = addSubsection('Time Complexity:', yPosition);
    pdf.text(codeAnalysis.time_complexity || 'Not specified', 20, yPosition);
    yPosition += 6;
    
    yPosition = addSubsection('Space Complexity:', yPosition);
    pdf.text(codeAnalysis.space_complexity || 'Not specified', 20, yPosition);
    yPosition += 6;
    
    if (codeAnalysis.suggestions && Array.isArray(codeAnalysis.suggestions)) {
      yPosition = addSubsection('Suggestions:', yPosition);
      codeAnalysis.suggestions.forEach((suggestion, index) => {
        pdf.text(`• ${suggestion || 'No suggestion provided'}`, 20, yPosition);
        yPosition += 6;
      });
    }
    
    yPosition += 5;
  }
  
  // Recommendations
  yPosition = addSectionHeader('Recommendations', yPosition);
  
  if (reportData.feedback.recommendations && Array.isArray(reportData.feedback.recommendations)) {
    reportData.feedback.recommendations.forEach((rec, index) => {
      pdf.setFontSize(10);
      pdf.setTextColor(primaryColor);
      pdf.text('•', 20, yPosition);
      pdf.setTextColor(0, 0, 0);
      pdf.text(rec || 'Recommendation not specified', 28, yPosition);
      yPosition += 6;
    });
  } else {
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text('No recommendations provided', 20, yPosition);
    yPosition += 6;
  }
  
  yPosition += 5;
  
  // Next Steps
  yPosition = addSectionHeader('Next Steps', yPosition);
  yPosition = addWrappedText(reportData.feedback.next_steps || 'No next steps provided', 20, yPosition, 170) + 5;
  
  // Conversation History (if there's space)
  if (yPosition < 250 && reportData.conversationHistory && Array.isArray(reportData.conversationHistory)) {
    yPosition = addSectionHeader('Conversation Summary', yPosition);
    
    const exchanges = reportData.conversationHistory.slice(0, 3);
    for (let index = 0; index < exchanges.length; index++) {
      const exchange = exchanges[index];
      if (!exchange || !exchange.ai_message || !exchange.user_response) continue;
      
      pdf.setFontSize(9);
      pdf.setTextColor(secondaryColor);
      pdf.text(`Exchange ${index + 1}:`, 20, yPosition);
      yPosition += 4;
      
      pdf.setTextColor(primaryColor);
      pdf.text('AI:', 20, yPosition);
      yPosition = addWrappedText((exchange.ai_message || 'No AI message').substring(0, 100) + '...', 30, yPosition, 160, 9) + 2;
      
      pdf.setTextColor(0, 0, 0);
      pdf.text('Candidate:', 20, yPosition);
      yPosition = addWrappedText((exchange.user_response || 'No user response').substring(0, 100) + '...', 30, yPosition, 160, 9) + 5;
      
      if (yPosition > 280) break;
    }
  }
  
  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(secondaryColor);
  pdf.text('Generated by AI Career Coach', 20, 290);
  pdf.text(new Date().toLocaleString(), 150, 290);
  
  console.log('✅ PDF generated successfully');
  return pdf.output('blob');
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw new Error('Failed to generate PDF report. Please try again.');
  }
};

export const downloadPDF = (blob: Blob, filename: string) => {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('✅ PDF download initiated successfully');
  } catch (error) {
    console.error('❌ Error downloading PDF:', error);
    // Fallback: try to open in new tab
    try {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (fallbackError) {
      console.error('❌ Fallback download also failed:', fallbackError);
      alert('Failed to download PDF. Please try again or check your browser settings.');
    }
  }
};
