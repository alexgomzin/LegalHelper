import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('ANALYZE DOCUMENT SIMPLE ENDPOINT CALLED');
  
  try {
    const { fileId, user_id } = req.body;
    
    if (!fileId) {
      return res.status(400).json({ error: 'No fileId provided' });
    }

    console.log('Analyzing document with fileId:', fileId, 'for user_id:', user_id);

    // --- SIMPLIFIED CREDITS CHECK FOR ADMIN ---
    const ADMIN_USER_ID = '971b8cd0-8eb3-4f9b-94b0-34175c432baa';
    
    if (user_id && user_id === ADMIN_USER_ID) {
      console.log('Admin user detected, proceeding with analysis without credit checks');
    } else {
      console.log('Non-admin user or no user_id, proceeding with mock analysis');
    }
    // --- END SIMPLIFIED CREDITS CHECK ---
    
    // Return mock analysis for testing
    const mockAnalysis = {
      highlightedText: [
        {
          id: 1,
          text: "Test analysis result",
          riskLevel: "medium",
          explanation: "This is a test analysis to verify the API is working",
          recommendation: "This is working correctly"
        }
      ],
      summary: "API endpoint is working correctly - this is a simplified test response",
      documentLanguage: "en",
      fullText: "Test document content"
    };

    return res.status(200).json({
      success: true,
      fileId,
      analysis: mockAnalysis
    });
    
  } catch (error) {
    console.error('Error in simple analyze endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Error analyzing document'
    });
  }
} 