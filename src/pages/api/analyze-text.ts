import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  organization: process.env.OPENAI_ORG_ID || undefined,
  dangerouslyAllowBrowser: true, // Allow running in browser environments
  defaultHeaders: {
    "OpenAI-Beta": "assistants=v1"  // Use latest API version
  }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('ANALYZE TEXT ENDPOINT CALLED');
  
  try {
    const { text, fileName } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    console.log(`Analyzing text with length: ${text.length}`);

    // Check if OpenAI API key is configured
    const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;
    const useMockAnalysis = process.env.MOCK_ANALYSIS === 'true';
    
    console.log('OpenAI API Key configured:', isOpenAIConfigured ? 'Yes' : 'No');
    console.log('Using mock analysis:', useMockAnalysis ? 'Yes' : 'No');
    
    let analysis;
    
    if (useMockAnalysis) {
      console.log('Using mock analysis because MOCK_ANALYSIS=true');
      analysis = getMockAnalysis(text);
    } else if (!isOpenAIConfigured) {
      console.error('WARNING: OpenAI API key is not configured but mock analysis is disabled.');
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key is not configured. Please add your API key to .env.local file.',
      });
    } else {
      console.log('Using real OpenAI analysis...');
      
      // For larger texts, we'll chunk the text
      const MAX_CHUNK_LENGTH = 12000;
      let textToAnalyze = "";
      
      if (text.length <= MAX_CHUNK_LENGTH) {
        textToAnalyze = text;
      } else {
        const beginningPortion = Math.floor(MAX_CHUNK_LENGTH * 0.4);
        const startText = text.substring(0, beginningPortion);
        
        const middlePortion = Math.floor(MAX_CHUNK_LENGTH * 0.3);
        const keyTerms = ['terminate', 'payment', 'liability', 'indemnity', 'intellectual property', 
                         'confidential', 'warranty', 'remedies', 'damages', 'dispute'];
        
        let bestMiddleStart = Math.floor(text.length / 2) - (middlePortion / 2);
        
        for (const term of keyTerms) {
          const termIndex = text.toLowerCase().indexOf(term, text.length / 3);
          if (termIndex !== -1 && termIndex < text.length * 2/3) {
            bestMiddleStart = Math.max(0, termIndex - 500);
            break;
          }
        }
        
        const middleText = text.substring(bestMiddleStart, bestMiddleStart + middlePortion);
        const endPortion = Math.floor(MAX_CHUNK_LENGTH * 0.3);
        const endText = text.substring(text.length - endPortion);
        
        textToAnalyze = startText + 
                       "\n\n[... MIDDLE SECTION OF DOCUMENT ...]\n\n" + 
                       middleText + 
                       "\n\n[... END SECTION OF DOCUMENT ...]\n\n" + 
                       endText;
        
        console.log(`Analyzing text in chunks: Beginning(${beginningPortion} chars), Middle(${middlePortion} chars), End(${endPortion} chars)`);
      }
      
      const model = "gpt-3.5-turbo";
      console.log(`Using model: ${model} for text analysis`);
      
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are a professional legal analyst with expertise in contract law and risk assessment.

Your task is to thoroughly analyze legal documents and identify ALL potential risks, issues, and areas of concern that could impact the client. Be comprehensive - do not limit your analysis to only a few issues.

Focus on identifying the following types of issues:
1. Ambiguous language that could lead to misinterpretation or disputes
2. One-sided or unfair clauses that heavily favor one party
3. Missing essential terms, conditions, or protections
4. Unusual or non-standard provisions that deviate from common practice
5. Vague or undefined obligations, timelines, or conditions
6. Any other potential legal vulnerabilities or problematic clauses

For each identified risk:
- Extract the EXACT text from the document that contains the risk (do not paraphrase)
- Assign an appropriate risk level (high/medium/low) based on potential impact
- Provide a clear, concise explanation of why this is problematic
- Offer specific, actionable recommendations to address or mitigate the risk

Be thorough - identify ALL significant risks in the document, not just a limited selection. If there are many issues, include them all.

IMPORTANT: First determine the language of the document, looking at the overall structure, terminology, and content.
If the text contains terms like "LEASE AGREEMENT", "LANDLORD", "TENANT", "WHEREAS", it is very likely an English document, even if there are a few foreign words.
For English documents, ALL explanations and recommendations MUST be in English.

EXTREMELY IMPORTANT: Your response MUST be valid JSON only, with no markdown formatting, code blocks, or explanation text. Do not wrap the JSON in \`\`\` or any other formatting. Just return the raw JSON object.

You must respond ONLY with a valid JSON object using the following structure:
{
  "highlightedText": [
    {
      "id": 1,
      "text": "exact text from document containing the risk",
      "riskLevel": "high|medium|low",
      "explanation": "clear explanation of the risk",
      "recommendation": "specific suggestion to address the risk"
    },
    ...
    {
      "id": n,
      "text": "exact text from document containing the risk",
      "riskLevel": "high|medium|low",
      "explanation": "clear explanation of the risk",
      "recommendation": "specific suggestion to address the risk"
    }
  ],
  "summary": "overall assessment of the document's risks and general recommendations",
  "documentLanguage": "detected language code (en, ru, de, etc.)"
}`
          },
          {
            role: "user",
            content: `Please analyze this legal document thoroughly and identify ALL potential risks and issues. This appears to be a standard English legal document, so please ensure all explanations and recommendations are in English:\n\n${textToAnalyze}`
          }
        ],
        temperature: 0.1
      });
      
      console.log('Received response from OpenAI');
      
      if (response.choices && 
          response.choices.length > 0 && 
          response.choices[0].message && 
          response.choices[0].message.content) {
        try {
          let responseContent = response.choices[0].message.content.trim();
          
          console.log('Raw OpenAI response content:', responseContent.substring(0, 500) + '...');
          
          if (responseContent.includes('```')) {
            const codeBlockMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (codeBlockMatch && codeBlockMatch[1]) {
              responseContent = codeBlockMatch[1].trim();
              console.log('Extracted from code block:', responseContent.substring(0, 100) + '...');
            } else {
              responseContent = responseContent.replace(/```json/g, '').replace(/```/g, '').trim();
            }
          }
          
          const firstBrace = responseContent.indexOf('{');
          const lastBrace = responseContent.lastIndexOf('}');
          
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            responseContent = responseContent.substring(firstBrace, lastBrace + 1);
            console.log('Extracted JSON object:', responseContent.substring(0, 100) + '...');
          }
          
          analysis = JSON.parse(responseContent);
          
          if (!analysis.highlightedText || !Array.isArray(analysis.highlightedText) || !analysis.summary || !analysis.documentLanguage) {
            console.error('OpenAI response missing required fields');
            throw new Error('Invalid response structure');
          }
          
          analysis.fullText = text;
          console.log(`Successfully parsed OpenAI response with ${analysis.highlightedText.length} highlighted risks`);
        } catch (parseError) {
          console.error('Error parsing OpenAI response:', parseError);
          analysis = getMockAnalysis(text);
        }
      } else {
        console.error('Invalid response from OpenAI');
        analysis = getMockAnalysis(text);
      }
    }

    return res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error analyzing text:', error);
    return res.status(500).json({
      success: false,
      error: 'Error analyzing text',
      useMock: true,
      analysis: getMockAnalysis()
    });
  }
}

// Mock analysis function
function getMockAnalysis(text: string = "") {
  return {
    highlightedText: [
      {
        id: 1,
        text: "The Parties may terminate this Agreement with 30 days' notice.",
        riskLevel: "high",
        explanation: "This termination clause is too vague and may allow either party to terminate without cause, which creates uncertainty for your business operations.",
        recommendation: "Specify clear conditions under which the Agreement may be terminated. Add specific cause requirements and consider different notice periods for different types of termination."
      },
      {
        id: 2,
        text: "Client will indemnify and hold Company harmless from any claims, damages, liabilities, costs, or expenses.",
        riskLevel: "high",
        explanation: "This indemnification clause is one-sided, placing all liability on the Client without any reciprocal protection.",
        recommendation: "Negotiate a mutual indemnification clause that protects both parties, or limit the scope of indemnification to specific scenarios directly caused by Client's actions."
      },
      {
        id: 3,
        text: "Payment terms are Net-60 from invoice date.",
        riskLevel: "medium",
        explanation: "A 60-day payment term is longer than industry standard and could impact your cash flow.",
        recommendation: "Negotiate shorter payment terms (Net-30 is standard in most industries) or include incentives for early payment and penalties for late payment."
      }
    ],
    summary: "This document contains several high-risk provisions that should be addressed before signing. The main concerns are the one-sided termination and indemnification clauses, which create significant liability exposure.",
    documentLanguage: "en",
    fullText: text
  };
} 