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

CRITICAL LANGUAGE INSTRUCTION: 
1. First, automatically detect the primary language of the document by analyzing the text content
2. Provide ALL explanations and recommendations in the SAME language as the document
3. If the document is in Russian, respond in Russian
4. If the document is in German, respond in German
5. If the document is in Spanish, respond in Spanish
6. If the document is in French, respond in French
7. If the document is in English, respond in English
8. For mixed-language documents, use the predominant language

EXTREMELY IMPORTANT: Your response MUST be valid JSON only, with no markdown formatting, code blocks, or explanation text. Do not wrap the JSON in \`\`\` or any other formatting. Just return the raw JSON object.

You must respond ONLY with a valid JSON object using the following structure:
{
  "highlightedText": [
    {
      "id": 1,
      "text": "exact text from document containing the risk",
      "riskLevel": "high|medium|low",
      "explanation": "clear explanation of the risk in the same language as the document",
      "recommendation": "specific suggestion to address the risk in the same language as the document"
    },
    ...
    {
      "id": n,
      "text": "exact text from document containing the risk",
      "riskLevel": "high|medium|low",
      "explanation": "clear explanation of the risk in the same language as the document",
      "recommendation": "specific suggestion to address the risk in the same language as the document"
    }
  ],
  "summary": "overall assessment of the document's risks and general recommendations in the same language as the document",
  "documentLanguage": "detected language code (en, ru, de, es, fr, etc.)"
}`
          },
          {
            role: "user",
            content: `Please analyze this legal document thoroughly and identify ALL potential risks and issues. Automatically detect the language of the document and provide all explanations and recommendations in that same language:\n\n${textToAnalyze}`
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

// Simple language detection function
function detectLanguage(text: string): string {
  if (!text || text.length < 10) return 'en';
  const textLower = text.toLowerCase();
  
  if (/[а-яё]/i.test(text)) return 'ru';
  if (/[äöüß]/i.test(text) || /\b(der|die|das|und|ist|sind|hat|haben|wird|werden)\b/i.test(textLower)) return 'de';
  if (/[ñáéíóúü]/i.test(text) || /\b(el|la|los|las|y|es|son|tiene|tienen)\b/i.test(textLower)) return 'es';
  if (/[àâäéèêëïîôöùûüÿç]/i.test(text) || /\b(le|la|les|et|est|sont|a|ont)\b/i.test(textLower)) return 'fr';
  
  return 'en';
}

// Mock analysis function for testing or when OpenAI is not available
function getMockAnalysis(text: string = "") {
  const detectedLang = detectLanguage(text);
  
  const translations: { [key: string]: any } = {
    'en': {
      risks: [
        {
          id: 1,
          text: "The Parties may terminate this Agreement with 30 days' notice.",
          riskLevel: "high",
          explanation: "This termination clause is too vague and may allow either party to terminate without cause, which creates uncertainty for your business operations.",
          recommendation: "Specify clear conditions under which the Agreement may be terminated. Add specific cause requirements and consider different notice periods for different types of termination."
        },
        {
          id: 2,
          text: "Payment terms are Net-60 from invoice date.",
          riskLevel: "medium",
          explanation: "A 60-day payment term is longer than industry standard and could impact your cash flow.",
          recommendation: "Negotiate shorter payment terms (Net-30 is standard in most industries) or include incentives for early payment and penalties for late payment."
        }
      ],
      summary: "This document contains several high-risk provisions that should be addressed before signing. Consider negotiating these terms to create a more balanced agreement that protects your interests."
    },
    'ru': {
      risks: [
        {
          id: 1,
          text: "Стороны могут расторгнуть данное Соглашение с уведомлением за 30 дней.",
          riskLevel: "high",
          explanation: "Данная оговорка о расторжении слишком расплывчата и может позволить любой стороне расторгнуть договор без причины, что создает неопределенность для вашей деловой деятельности.",
          recommendation: "Укажите четкие условия, при которых Соглашение может быть расторгнуто. Добавьте конкретные требования к причинам и рассмотрите различные сроки уведомления для разных типов расторжения."
        },
        {
          id: 2,
          text: "Условия оплаты - нетто-60 дней с даты выставления счета.",
          riskLevel: "medium",
          explanation: "60-дневный срок оплаты превышает отраслевой стандарт и может повлиять на ваш денежный поток.",
          recommendation: "Договоритесь о более коротких сроках оплаты (нетто-30 является стандартом в большинстве отраслей) или включите стимулы для досрочной оплаты и штрафы за просрочку платежа."
        }
      ],
      summary: "Данный документ содержит несколько положений высокого риска, которые следует рассмотреть перед подписанием. Рассмотрите возможность пересмотра этих условий для создания более сбалансированного соглашения, защищающего ваши интересы."
    }
  };
  
  const lang = translations[detectedLang] || translations['en'];
  
  return {
    highlightedText: lang.risks,
    summary: lang.summary,
    documentLanguage: detectedLang,
    fullText: text
  };
} 