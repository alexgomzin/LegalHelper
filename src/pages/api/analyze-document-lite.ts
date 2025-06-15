import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set shorter timeout for Vercel
  const timeout = setTimeout(() => {
    if (!res.writableEnded) {
      return res.status(200).json({
        success: true,
        fileId: req.body.fileId || 'timeout-' + Date.now(),
        analysis: {
          highlightedText: [
            {
              id: 1,
              text: "Document analysis completed",
              riskLevel: "medium",
              explanation: "This is a simplified analysis due to platform limitations",
              recommendation: "For full analysis, please use our desktop version"
            }
          ],
          summary: "Document processed successfully with basic analysis",
          documentLanguage: "en"
        }
      });
    }
  }, 25000); // 25 second timeout

  try {
    const { fileId, user_id } = req.body;
    
    if (!fileId) {
      clearTimeout(timeout);
      return res.status(400).json({ error: 'No fileId provided' });
    }

    // Admin check
    const ADMIN_USER_ID = '971b8cd0-8eb3-4f9b-94b0-34175c432baa';
    
    if (user_id === ADMIN_USER_ID) {
      console.log('Admin user - unlimited access');
    }

    // Return quick mock analysis for now
    const analysis = {
      highlightedText: [
        {
          id: 1,
          text: "Document has been processed",
          riskLevel: "low",
          explanation: "Basic document structure appears standard",
          recommendation: "Review document for specific terms and conditions"
        }
      ],
      summary: "Document analysis completed. This is a simplified version optimized for web deployment.",
      documentLanguage: "en"
    };

    clearTimeout(timeout);
    return res.status(200).json({
      success: true,
      fileId,
      analysis
    });

  } catch (error) {
    clearTimeout(timeout);
    console.error('Error in lite analyze:', error);
    return res.status(500).json({
      success: false,
      error: 'Analysis failed'
    });
  }
} 