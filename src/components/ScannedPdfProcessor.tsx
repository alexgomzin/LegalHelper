'use client';

import { useState, useEffect } from 'react';
import { processPDF } from '@/utils/pdfProcessing';

interface ScannedPdfProcessorProps {
  file: File;
  onTextExtracted: (text: string) => void;
  onError: (error: string) => void;
}

export default function ScannedPdfProcessor({
  file,
  onTextExtracted,
  onError
}: ScannedPdfProcessorProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function processFile() {
      if (!file || status !== 'idle') return;

      try {
        setStatus('processing');
        setProgress(10);

        // Update progress periodically to show activity
        const interval = setInterval(() => {
          setProgress(prev => {
            // Gradually increase up to 90% (the last 10% is reserved for completion)
            const newProgress = prev + Math.random() * 5;
            return newProgress > 90 ? 90 : newProgress;
          });
        }, 1000);

        // Process the PDF with OCR if needed
        const text = await processPDF(file);
        
        clearInterval(interval);
        setProgress(100);
        setStatus('complete');
        
        if (text.trim().length === 0) {
          onError('Could not extract any text from this PDF. The file might be corrupted or password-protected.');
          return;
        }
        
        onTextExtracted(text);
      } catch (error) {
        setStatus('error');
        onError('Error processing PDF: ' + (error instanceof Error ? error.message : String(error)));
      }
    }

    processFile();
  }, [file, onTextExtracted, onError]);

  return (
    <div className="my-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium mb-2">
        {status === 'idle' && 'Preparing to process document...'}
        {status === 'processing' && 'Processing document with OCR...'}
        {status === 'complete' && 'Document processing complete!'}
        {status === 'error' && 'Error processing document'}
      </h3>
      
      {status === 'processing' && (
        <>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            This may take a few minutes for scanned documents. Please be patient.
          </p>
        </>
      )}
      
      {status === 'complete' && (
        <p className="text-sm text-green-600">
          Text successfully extracted from document.
        </p>
      )}
    </div>
  );
} 