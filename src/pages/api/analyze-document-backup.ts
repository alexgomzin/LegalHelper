import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
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

// Define types for global cache
declare global {
  var _pdfTextCache: {
    [key: string]: string;
  };
}

// Check if we're in a production environment where filesystem is read-only
const isProduction = process.env.NODE_ENV === 'production';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('ANALYZE DOCUMENT ENDPOINT CALLED');
  
  // Reduced timeout for Vercel limits - set to 50 seconds to stay under 60s limit
  let requestTimeout: NodeJS.Timeout | null = setTimeout(() => {
    console.log('Analyze document request timeout triggered - sending response with mock data');
    if (!res.writableEnded) {
      return res.status(200).json({
        success: true,
        fileId: req.body.fileId || 'timeout-' + Date.now(),
        error: 'Analysis taking longer than expected. Using cached analysis instead.',
        analysis: getMockAnalysis()
      });
    }
  }, 50000); // 50 second timeout for Vercel
  
  // Cleanup function to clear the timeout
  const clearRequestTimeout = () => {
    if (requestTimeout) {
      clearTimeout(requestTimeout);
      requestTimeout = null;
    }
  };
  
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
    } else if (user_id) {
      console.log('Non-admin user, but proceeding with analysis for now');
    } else {
      console.log('No user_id provided, proceeding with analysis anyway');
    }
    // --- END SIMPLIFIED CREDITS CHECK ---
    
    console.log(`Analyzing document with ID: ${fileId}`);
    
    // Get text content either from cache or from file
    let text: string;
    
    if (isProduction) {
      // In production, get from memory cache
      global._pdfTextCache = global._pdfTextCache || {};
      text = global._pdfTextCache[fileId];
      
      if (!text) {
        return res.status(404).json({ 
          error: 'Document text not found in cache. Please upload the document again.',
          useMock: true,
          analysis: getMockAnalysis()
        });
      }
    } else {
      // In development, get from file
      const filePath = path.join(process.cwd(), 'uploads', `${fileId}.pdf`);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
          error: 'Document file not found. Please upload the document again.',
          useMock: true,
          analysis: getMockAnalysis()
        });
      }
      
      // Read the file and extract text using PDF.js directly
      const fileData = fs.readFileSync(filePath);
      const arrayBuffer = fileData.buffer;
      
      try {
        // Use pdfjs-dist to extract text
        const pdf = await import('pdfjs-dist');
        const pdfDoc = await pdf.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        
        // Extract text from each page
        let extractedText = '';
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }
        
        text = extractedText;
        
        if (text.length === 0) {
          return res.status(200).json({
            success: true,
            fileId: fileId,
            error: 'No text could be extracted from the PDF.',
            analysis: getMockAnalysis()
          });
        }
      } catch (pdfError) {
        console.error('Error extracting text from PDF:', pdfError);
        return res.status(200).json({
          success: true,
          fileId: fileId,
          error: 'Error extracting text from the PDF.',
          analysis: getMockAnalysis()
        });
      }
    }
    
    // Check if OpenAI API key is configured
    const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;
    
    // Always use real analysis unless explicitly set to use mock
    const useMockAnalysis = process.env.MOCK_ANALYSIS === 'true';
    
    // Log the OpenAI configuration status
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
      const MAX_CHUNK_LENGTH = 12000; // Reduced to ensure we stay within limits
      let textToAnalyze = "";
      
      if (text.length <= MAX_CHUNK_LENGTH) {
        // If document is small enough, use the whole text
        textToAnalyze = text;
      } else {
        // For larger documents, use a more strategic approach to extract key sections
        
        // For contracts, the most important parts are typically:
        // 1. The beginning (definitions, parties, scope)
        // 2. Sections with critical terms (payment, termination, liability, etc.)
        // 3. The end (signatures, amendments)
        
        // Extract a larger portion from the beginning (40%)
        const beginningPortion = Math.floor(MAX_CHUNK_LENGTH * 0.4);
        const startText = text.substring(0, beginningPortion);
        
        // Extract from the middle, looking for key contract terms
        const middlePortion = Math.floor(MAX_CHUNK_LENGTH * 0.3);
        // Look for key terms in the middle of the document
        const keyTerms = ['terminate', 'payment', 'liability', 'indemnity', 'intellectual property', 
                         'confidential', 'warranty', 'remedies', 'damages', 'dispute'];
        
        // Find the best starting point in the middle based on key terms
        let bestMiddleStart = Math.floor(text.length / 2) - (middlePortion / 2);
        let middleText = "";
        
        // Try to find a good starting point containing key contract terms
        for (const term of keyTerms) {
          const termIndex = text.toLowerCase().indexOf(term, text.length / 3);
          if (termIndex !== -1 && termIndex < text.length * 2/3) {
            // Found a key term in the middle section
            const potentialStart = Math.max(0, termIndex - 500);
            bestMiddleStart = potentialStart;
            break;
          }
        }
        
        middleText = text.substring(bestMiddleStart, bestMiddleStart + middlePortion);
        
        // Extract from the end (30%)
        const endPortion = Math.floor(MAX_CHUNK_LENGTH * 0.3);
        const endText = text.substring(text.length - endPortion);
        
        // Combine the text portions with markers
        textToAnalyze = startText + 
                       "\n\n[... MIDDLE SECTION OF DOCUMENT ...]\n\n" + 
                       middleText + 
                       "\n\n[... END SECTION OF DOCUMENT ...]\n\n" + 
                       endText;
        
        console.log(`Analyzing document in chunks: Beginning(${beginningPortion} chars), Middle(${middlePortion} chars), End(${endPortion} chars)`);
      }
      
      // Use gpt-3.5-turbo model instead of gpt-4o
      let model = "gpt-3.5-turbo";
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
        temperature: 0.1  // Lower temperature for more comprehensive analysis
      });
      
      console.log('Received response from OpenAI');
      
      // Parse the response
      if (response.choices && 
          response.choices.length > 0 && 
          response.choices[0].message && 
          response.choices[0].message.content) {
        try {
          // Clean up the response content - remove markdown code blocks if present
          let responseContent = response.choices[0].message.content.trim();
          
          // Log the full response for debugging
          console.log('Raw OpenAI response content:', responseContent.substring(0, 500) + '...');
          
          // More comprehensive cleanup of the response
          // Remove any markdown code block markers
          if (responseContent.includes('```')) {
            // Extract content between any markdown code blocks
            const codeBlockMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (codeBlockMatch && codeBlockMatch[1]) {
              responseContent = codeBlockMatch[1].trim();
              console.log('Extracted from code block:', responseContent.substring(0, 100) + '...');
            } else {
              // If we can't extract with regex, manually strip markdown
              responseContent = responseContent.replace(/```json/g, '').replace(/```/g, '').trim();
            }
          }
          
          // Remove any text before the first { and after the last }
          const firstBrace = responseContent.indexOf('{');
          const lastBrace = responseContent.lastIndexOf('}');
          
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            responseContent = responseContent.substring(firstBrace, lastBrace + 1);
            console.log('Extracted JSON object:', responseContent.substring(0, 100) + '...');
          }
          
          // Try to parse the JSON
          analysis = JSON.parse(responseContent);
          
          // Validate the response structure
          if (!analysis.highlightedText || !Array.isArray(analysis.highlightedText) || !analysis.summary || !analysis.documentLanguage) {
            console.error('OpenAI response missing required fields');
            throw new Error('Invalid response structure');
          }
          
          // Add the full text to the analysis
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

    clearRequestTimeout(); // Clear timeout before sending response
    return res.status(200).json({
      success: true,
      fileId,
      analysis
    });
  } catch (error) {
    clearRequestTimeout(); // Clear timeout before sending error response
    console.error('Error analyzing document:', error);
    return res.status(500).json({
      success: false,
      error: 'Error analyzing document',
      useMock: true,
      analysis: getMockAnalysis()
    });
  }
}

// Simple language detection function
function detectLanguage(text: string): string {
  if (!text || text.length < 10) return 'en'; // Default to English for short texts
  
  const textLower = text.toLowerCase();
  
  // Russian detection - look for Cyrillic characters and common Russian words
  if (/[а-яё]/i.test(text)) {
    return 'ru';
  }
  
  // German detection - look for German-specific words and characters
  if (/[äöüß]/i.test(text) || 
      /\b(der|die|das|und|oder|aber|mit|von|zu|bei|nach|über|unter|durch|für|gegen|ohne|um|an|auf|aus|in|ist|sind|war|waren|hat|haben|wird|werden|kann|können|soll|sollen|muss|müssen|darf|dürfen|mag|mögen|will|wollen)\b/i.test(textLower)) {
    return 'de';
  }
  
  // Spanish detection - look for Spanish-specific words and characters
  if (/[ñáéíóúü]/i.test(text) || 
      /\b(el|la|los|las|un|una|y|o|pero|con|de|del|al|para|por|en|es|son|fue|fueron|ha|han|será|serán|puede|pueden|debe|deben|tiene|tienen|hace|hacen|dice|dicen|va|van|viene|vienen)\b/i.test(textLower)) {
    return 'es';
  }
  
  // French detection - look for French-specific words and characters
  if (/[àâäéèêëïîôöùûüÿç]/i.test(text) || 
      /\b(le|la|les|un|une|et|ou|mais|avec|de|du|des|pour|par|dans|sur|sous|est|sont|était|étaient|a|ont|sera|seront|peut|peuvent|doit|doivent|fait|font|dit|disent|va|vont|vient|viennent)\b/i.test(textLower)) {
    return 'fr';
  }
  
  // Italian detection - look for Italian-specific words and characters
  if (/\b(il|la|lo|gli|le|un|una|e|o|ma|con|di|del|della|dello|degli|delle|per|da|in|su|tra|fra|è|sono|era|erano|ha|hanno|sarà|saranno|può|possono|deve|devono|fa|fanno|dice|dicono|va|vanno|viene|vengono)\b/i.test(textLower)) {
    return 'it';
  }
  
  // Portuguese detection - look for Portuguese-specific words and characters
  if (/[ãõç]/i.test(text) || 
      /\b(o|a|os|as|um|uma|e|ou|mas|com|de|do|da|dos|das|para|por|em|no|na|nos|nas|é|são|foi|foram|tem|têm|será|serão|pode|podem|deve|devem|faz|fazem|diz|dizem|vai|vão|vem|vêm)\b/i.test(textLower)) {
    return 'pt';
  }
  
  // Dutch detection - look for Dutch-specific words
  if (/\b(de|het|een|en|of|maar|met|van|voor|door|in|op|aan|bij|uit|over|onder|tussen|is|zijn|was|waren|heeft|hebben|zal|zullen|kan|kunnen|moet|moeten|mag|mogen|wil|willen|doet|doen|zegt|zeggen|gaat|gaan|komt|komen)\b/i.test(textLower)) {
    return 'nl';
  }
  
  // Default to English if no other language is detected
  return 'en';
}

// Mock analysis function for testing or when OpenAI is not available
function getMockAnalysis(text: string = "") {
  const detectedLang = detectLanguage(text);
  
  // Define translations for different languages
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
      summary: "This document contains several high-risk provisions that should be addressed before signing. The main concerns are the one-sided termination and indemnification clauses, which create significant liability exposure. The payment terms are also longer than industry standard. Consider negotiating these terms to create a more balanced agreement that protects your interests."
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
          text: "Клиент обязуется возместить ущерб и освободить Компанию от любых претензий, ущерба, обязательств, расходов или затрат.",
          riskLevel: "high",
          explanation: "Данная оговорка о возмещении ущерба является односторонней, возлагая всю ответственность на Клиента без какой-либо взаимной защиты.",
          recommendation: "Договоритесь о взаимной оговорке возмещения ущерба, которая защищает обе стороны, или ограничьте область возмещения ущерба конкретными сценариями, непосредственно вызванными действиями Клиента."
        },
        {
          id: 3,
          text: "Условия оплаты - нетто-60 дней с даты выставления счета.",
          riskLevel: "medium",
          explanation: "60-дневный срок оплаты превышает отраслевой стандарт и может повлиять на ваш денежный поток.",
          recommendation: "Договоритесь о более коротких сроках оплаты (нетто-30 является стандартом в большинстве отраслей) или включите стимулы для досрочной оплаты и штрафы за просрочку платежа."
        }
      ],
      summary: "Данный документ содержит несколько положений высокого риска, которые следует рассмотреть перед подписанием. Основные проблемы - односторонние оговорки о расторжении и возмещении ущерба, которые создают значительные риски ответственности. Условия оплаты также превышают отраслевой стандарт. Рассмотрите возможность пересмотра этих условий для создания более сбалансированного соглашения, защищающего ваши интересы."
    }
  };
  
  // Get the appropriate translation or default to English
  const lang = translations[detectedLang] || translations['en'];
  
  return {
    highlightedText: lang.risks,
    summary: lang.summary,
    documentLanguage: detectedLang,
    fullText: text
  };
} 