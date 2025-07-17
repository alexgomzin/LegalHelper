import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

type DiagnosticsResponse = {
  success: boolean;
  apiKeyConfigured: boolean;
  apiKeyValid?: boolean;
  mockAnalysis: boolean;
  openaiVersion?: string;
  error?: string;
  envVars: {
    [key: string]: string | undefined;
  };
  fileSystem: {
    uploadsExists: boolean;
    uploadsWritable: boolean;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DiagnosticsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      apiKeyConfigured: false,
      mockAnalysis: false,
      error: 'Method not allowed',
      envVars: {},
      fileSystem: {
        uploadsExists: false,
        uploadsWritable: false
      }
    });
  }

  const diagnostics: DiagnosticsResponse = {
    success: false,
    apiKeyConfigured: false,
    mockAnalysis: process.env.MOCK_ANALYSIS === 'true',
    envVars: {
      NODE_ENV: process.env.NODE_ENV,
      PDF_STORAGE_PATH: process.env.PDF_STORAGE_PATH,
      MOCK_ANALYSIS: process.env.MOCK_ANALYSIS,
      // Mask the API key for security
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 
        `${process.env.OPENAI_API_KEY.substring(0, 7)}...` : undefined
    },
    fileSystem: {
      uploadsExists: false,
      uploadsWritable: false
    }
  };

  try {
    // Check upload directory
    const uploadDir = path.join(process.cwd(), 'uploads');
    diagnostics.fileSystem.uploadsExists = fs.existsSync(uploadDir);
    
    if (diagnostics.fileSystem.uploadsExists) {
      try {
        // Try to write a test file
        const testFile = path.join(uploadDir, 'test.txt');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile); // Delete test file
        diagnostics.fileSystem.uploadsWritable = true;
      } catch (error) {
        diagnostics.fileSystem.uploadsWritable = false;
      }
    } else {
      // Try to create the directory
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
        diagnostics.fileSystem.uploadsExists = true;
        diagnostics.fileSystem.uploadsWritable = true;
      } catch (error) {
        // Directory creation failed
      }
    }

    // Check OpenAI API configuration
    const apiKey = process.env.OPENAI_API_KEY;
    diagnostics.apiKeyConfigured = !!apiKey && apiKey.startsWith('sk-') && apiKey.length > 20;
    
    // If API key is configured and we're not forcing mock mode, test the API
    if (diagnostics.apiKeyConfigured && !diagnostics.mockAnalysis) {
      try {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY || '',
        });
        
        // Just check if the models endpoint works to validate the API key
        const models = await openai.models.list();
        diagnostics.apiKeyValid = true;
        diagnostics.openaiVersion = "v4.x (current)";
        diagnostics.success = true;
      } catch (error: any) {
        diagnostics.apiKeyValid = false;
        diagnostics.error = `OpenAI API error: ${error.message || 'Unknown error'}`;
      }
    } else if (diagnostics.mockAnalysis) {
      // If we're using mock mode, just mark success
      diagnostics.success = true;
      diagnostics.apiKeyValid = false; // We don't know if it's valid or not
    } else {
      // API key not configured
      diagnostics.success = false;
      diagnostics.error = 'OpenAI API key not configured properly';
    }
  } catch (error: any) {
    diagnostics.error = `Error running diagnostics: ${error.message || 'Unknown error'}`;
  }

  return res.status(200).json(diagnostics);
} 