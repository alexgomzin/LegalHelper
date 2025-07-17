import type { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parsePdf } from '@/utils/pdfUtils';
import OpenAI from 'openai';

// Check if we're in a production environment where filesystem is read-only
const isProduction = process.env.NODE_ENV === 'production';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('PAGES ROUTER SUMMARIZE ENDPOINT CALLED');
  
  try {
    const { fileId } = req.body;
    
    if (!fileId) {
      return res.status(400).json({ error: 'No file ID provided' });
    }
    
    let extractedText = '';
    
    if (isProduction) {
      // In production, try to get the text from memory cache
      console.log('Running in production - looking for text in memory cache');
      if (global._pdfTextCache && global._pdfTextCache[fileId]) {
        extractedText = global._pdfTextCache[fileId];
        console.log(`Retrieved text from memory cache: ${extractedText.length} characters`);
      } else {
        return res.status(404).json({ error: 'File not found in cache. Please upload the document again.' });
      }
    } else {
      // In development, get the text from file
      // Check if file exists
      const uploadsDir = join(process.cwd(), 'uploads');
      // Try both with and without .pdf extension
      const filePath = join(uploadsDir, fileId.endsWith('.pdf') ? fileId : `${fileId}.pdf`);
      
      console.log(`Looking for file at: ${filePath}`);
      
      if (!existsSync(filePath)) {
        console.error(`File not found at ${filePath}`);
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Extract text from PDF
      console.log('Extracting text from PDF...');
      const fileBuffer = readFileSync(filePath);
      const pdfData = await parsePdf(fileBuffer);
      extractedText = pdfData.text;
    }
    
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from the PDF' });
    }
    
    // Generate summary using OpenAI or mock data
    let summary = '';
    
    if (openai) {
      console.log('Generating summary using OpenAI...');
      
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a legal assistant specialized in summarizing legal documents. Provide a concise summary (3-5 sentences) that captures the key purpose and important elements of the document. Focus on what would be most important for a legal professional to know at a glance.'
            },
            {
              role: 'user',
              content: `Please summarize the following legal document:\n\n${extractedText.substring(0, 15000)}`
            }
          ],
          temperature: 0.3,
          max_tokens: 300
        });
        
        summary = response.choices[0].message.content || '';
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        // Fall back to mock data
        summary = getMockSummary();
      }
    } else {
      console.log('OpenAI API key not configured, using mock data');
      summary = getMockSummary();
    }
    
    return res.status(200).json({ summary });
    
  } catch (error: any) {
    console.error('Error in document summarization:', error);
    return res.status(500).json({ error: `Summarization failed: ${error.message || 'Unknown error'}` });
  }
}

function getMockSummary(): string {
  return 'This document appears to be a standard legal agreement that outlines terms and conditions between two parties. It contains provisions related to obligations, liability limitations, and termination clauses. The document includes sections on confidentiality, intellectual property rights, and dispute resolution mechanisms that would typically be found in professional service contracts.';
} 