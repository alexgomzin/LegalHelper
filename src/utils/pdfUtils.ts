'use client';

import { estimateTokenCount } from './pdfProcessing';
import * as pdfjs from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

// Add Tesseract.js for OCR (Optical Character Recognition)
// Note: You'll need to run 'npm install tesseract.js' to add this dependency
// import { createWorker } from 'tesseract.js'; 
// For now, we'll comment out the import to avoid requiring installation

// We need to set the worker source path for pdfjs to work
if (typeof window !== 'undefined') {
  // Set the worker source
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  }
}

// Note: There are font loading warnings in the console - these are benign and don't affect functionality
// These would require a more complex setup to fix completely but don't impact extraction quality

interface PdfData {
  text: string;
  numPages: number;
  isScanned: boolean;
}

/**
 * Parse PDF buffer and extract text
 * @param {Buffer | ArrayBuffer} pdfBuffer - The PDF file buffer
 * @returns {Promise<PdfData>} - The extracted text and number of pages
 */
export async function parsePdf(pdfBuffer: Buffer | ArrayBuffer): Promise<PdfData> {
  try {
    // Convert Buffer to Uint8Array
    let uint8Array: Uint8Array;
    
    if (pdfBuffer instanceof Buffer) {
      uint8Array = new Uint8Array(pdfBuffer);
    } else {
      uint8Array = new Uint8Array(pdfBuffer);
    }

    // Setup standard font data URL to fix the font loading issues
    const standardFontDataUrl = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`;
    
    // Load the PDF document with font configuration
    const loadingTask = pdfjs.getDocument({
      data: uint8Array,
      standardFontDataUrl: standardFontDataUrl,
      // Disable range requests for simplified loading
      disableRange: true,
      // Disable streaming for more reliable loading
      disableStream: true,
      // Ignore CMap errors for better compatibility with various PDFs
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
    });

    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    
    let fullText = '';
    let isScanned = false;
    
    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent({
        // Enable better text extraction 
        // Note: These parameters might not be typed in the TypeScript definitions
        // but they are supported by the PDF.js API
      });
      
      const pageText = textContent.items
        .map((item: any) => {
          // Only map items that have the str property (TextItem)
          return item.str || '';
        })
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    // Check if the text seems to need normalization
    // Signs that a PDF might be scanned or have extraction issues:
    // 1. Very little text extracted
    // 2. Lots of single letters separated by spaces (indicating potential OCR issues)
    // 3. Common patterns like "P art" that indicate broken words
    
    const needsNormalization = 
      fullText.length < 100 || // Very little text extracted
      /\b[A-Za-z]\s[A-Za-z]\s[A-Za-z]\b/.test(fullText) || // Single letters with spaces
      /\b[A-Z][a-z]*\s[a-z]{2,}\b/.test(fullText); // Broken words pattern
    
    // Check if this might be a scanned document with almost no text
    const mightBeScanned = fullText.trim().length < 50 && numPages > 0;
    
    if (mightBeScanned) {
      console.log('PDF appears to be scanned with little text content');
      isScanned = true;
      
      // NOTE: If we want to enable OCR, we would need to:
      // 1. Uncomment the Tesseract.js import
      // 2. Install the dependency
      // 3. Uncomment and enable the code below
      
      /* 
      // Try OCR on the first page as a test
      console.log('Attempting OCR on first page...');
      try {
        const firstPage = await pdfDocument.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1.5 }); // Higher scale for better OCR
        
        // Set up a canvas for rendering
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Render PDF page to canvas
          await firstPage.render({
            canvasContext: ctx,
            viewport: viewport
          }).promise;
          
          // Get image data for OCR
          const imageData = canvas.toDataURL('image/png');
          
          // Use Tesseract.js to perform OCR
          const worker = await createWorker();
          await worker.loadLanguage('eng');
          await worker.initialize('eng');
          
          const { data } = await worker.recognize(imageData);
          const ocrText = data.text;
          
          if (ocrText && ocrText.length > fullText.length) {
            console.log('OCR successful, found more text than direct extraction');
            fullText = ocrText;
          }
          
          await worker.terminate();
        }
      } catch (ocrError) {
        console.error('OCR failed:', ocrError);
      }
      */
      
      // For now, just notify that this is probably a scanned document
      fullText += "\n[This appears to be a scanned document. OCR processing is required for better text extraction.]";
    }
    
    if (needsNormalization) {
      console.log('PDF appears to have extraction issues, applying text normalization');
      fullText = normalizeExtractedText(fullText);
    } else {
      console.log('Clean PDF text extraction, applying minimal normalization');
      // Apply only light normalization for normal PDFs
      fullText = lightNormalizeText(fullText);
    }
    
    return {
      text: fullText,
      numPages,
      isScanned
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return {
      text: '',
      numPages: 0,
      isScanned: false
    };
  }
}

/**
 * Light normalization for clean PDFs
 * @param text - Raw extracted text
 * @returns Lightly normalized text
 */
function lightNormalizeText(text: string): string {
  if (!text) return '';
  
  // Just fix basic spacing issues and standardize whitespace
  let normalized = text.replace(/\s+/g, ' ');
  
  // Fix whitespace around punctuation
  normalized = normalized.replace(/\s+([.,;:!?)])/g, '$1');
  normalized = normalized.replace(/([({])\s+/g, '$1');
  
  return normalized.trim();
}

/**
 * Heavy normalization for scanned PDFs with OCR issues
 * @param text - Raw extracted text
 * @returns Normalized text
 */
function normalizeExtractedText(text: string): string {
  if (!text) return '';
  
  // Step 1: Replace sequences of spaces with a single space
  let normalized = text.replace(/\s+/g, ' ');
  
  // Step 2: Fix broken words with spaces between characters (like "P a r t n e r")
  // This regex looks for patterns where single letters are separated by spaces
  normalized = normalized.replace(/\b([A-Za-z])\s+(?=[A-Za-z]\s+[A-Za-z])/g, '$1');
  
  // Additional pass to catch remaining patterns of spaced letters
  normalized = normalized.replace(/\b([A-Za-z])\s([A-Za-z])\b/g, '$1$2');
  
  // Fix specific patterns like "P artne r" -> "Partner"
  normalized = normalized.replace(/\b([A-Za-z])\s([A-Za-z]{2,})\b/g, '$1$2');
  
  // Fix common OCR errors for letters that look similar
  normalized = normalized.replace(/\bI'rn\b/g, "I'm"); // Fix I'm misrecognized as I'rn
  normalized = normalized.replace(/\bI'\/e\b/g, "I've"); // Fix I've misrecognized as I'/e
  
  // Handle quotes and apostrophes
  normalized = normalized.replace(/''|''|"|"|``|''/g, '"');
  normalized = normalized.replace(/`|'/g, "'");
  
  // Join hyphenated words that were broken across lines
  normalized = normalized.replace(/(\w+)-\s+(\w+)/g, '$1$2');
  
  // Step 3: Fix common legal terms that might be broken
  normalized = normalized.replace(/\b[Aa]gree\s*[Mm]ent\b/g, 'Agreement');
  normalized = normalized.replace(/\b[Cc]on\s*tract\b/g, 'Contract');
  normalized = normalized.replace(/\b[Pp]ar\s*ties\b/g, 'Parties');
  normalized = normalized.replace(/\b[Pp]ar\s*ty\b/g, 'Party');
  normalized = normalized.replace(/\b[Tt]erm\s*in\s*at\s*ion\b/g, 'Termination');
  normalized = normalized.replace(/\b[Rr]e\s*present\s*ative\b/g, 'Representative');
  normalized = normalized.replace(/\b[Ii]n\s*demn\s*if\s*ication\b/g, 'Indemnification');
  normalized = normalized.replace(/\b[Ii]n\s*demn\s*ify\b/g, 'Indemnify');
  normalized = normalized.replace(/\b[Ll]ia\s*bil\s*ity\b/g, 'Liability');
  normalized = normalized.replace(/\b[Cc]on\s*fi\s*den\s*tial\s*ity\b/g, 'Confidentiality');
  normalized = normalized.replace(/\b[Pp]art\s*ner\s*ship\b/g, 'Partnership');
  normalized = normalized.replace(/\b[Ii]n\s*sti\s*tu\s*tion\b/g, 'Institution');
  
  // Fix whitespace around punctuation
  normalized = normalized.replace(/\s+([.,;:!?)])/g, '$1');
  normalized = normalized.replace(/([({])\s+/g, '$1');
  
  return normalized.trim();
}

/**
 * Estimate token count for a given text (simple estimate for pricing)
 * @param text - Text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  return estimateTokenCount(text);
}

// Custom renderer to improve text extraction
function renderPage(pageData: any) {
  // Check if the page contains text
  if (!pageData.getTextContent) {
    return Promise.resolve('');
  }
  
  return pageData.getTextContent({
    normalizeWhitespace: true,
    disableCombineTextItems: false
  })
  .then((textContent: any) => {
    let lastY = -1;
    let text = '';
    
    // Process each text item
    for (const item of textContent.items) {
      // Add a newline if y-position changes significantly
      if (lastY !== -1 && Math.abs(lastY - item.transform[5]) > 5) {
        text += '\n';
      }
      
      text += item.str;
      lastY = item.transform[5];
    }
    
    return text;
  });
}

// Get sample lease text for testing
function getSampleText(): string {
  return `SAMPLE LEASE AGREEMENT

THIS LEASE AGREEMENT (hereinafter referred to as the "Agreement") made and entered into this _____ day of ____________, 20____, by and between ________________________ (hereinafter referred to as "Landlord") and ________________________ (hereinafter referred to as "Tenant").

WITNESSETH:
WHEREAS, Landlord is the fee owner of certain real property being, lying and situated in _______________ County, _______________, such real property having a street address of ________________________________________________ (hereinafter referred to as the "Premises").

WHEREAS, Landlord desires to lease the Premises to Tenant upon the terms and conditions as contained herein; and

WHEREAS, Tenant desires to lease the Premises from Landlord on the terms and conditions as contained herein;

NOW, THEREFORE, for and in consideration of the covenants and obligations contained herein and other good and valuable consideration, the receipt and sufficiency of which is hereby acknowledged, the parties hereto agree as follows:`;
} 