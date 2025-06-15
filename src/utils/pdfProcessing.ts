import * as pdfjs from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// Initialize PDF.js - make sure it uses a CDN for the worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

/**
 * Try to extract text from a PDF page using PDF.js
 * @param page - The PDF page to extract text from
 * @returns Extracted text if available
 */
async function extractTextFromPage(page: any): Promise<string> {
  try {
    const textContent = await page.getTextContent();
    return textContent.items.map((item: any) => item.str).join(' ');
  } catch (error) {
    console.error('Error extracting text:', error);
    return '';
  }
}

/**
 * Extract an image from a PDF page for OCR processing
 * @param page - The PDF page to extract image from
 * @returns Image data URL
 */
async function extractImageFromPage(page: any): Promise<string | null> {
  try {
    const scale = 1.5; // Increase scale for better OCR results
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not create canvas context');
    }
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({
      canvasContext: context,
      viewport,
    }).promise;
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error extracting image:', error);
    return null;
  }
}

/**
 * Process an image with OCR to extract text
 * @param imageData - Image data URL to process
 * @returns Extracted text from the image
 */
async function processImageWithOCR(imageData: string): Promise<string> {
  // For Tesseract.js v6, we need to create a worker with the language specified
  const worker = await createWorker('eng');
  
  try {
    // In v6, we don't need to load language or initialize separately
    const { data } = await worker.recognize(imageData);
    return data.text;
  } catch (error) {
    console.error('OCR processing error:', error);
    return '';
  } finally {
    await worker.terminate();
  }
}

/**
 * Check if a PDF page has meaningful text content
 * @param text - Extracted text from the page
 * @returns Whether the page contains meaningful text
 */
function hasTextContent(text: string): boolean {
  // Filter out whitespace and check if there's significant text content
  const cleanText = text.replace(/\s+/g, '');
  return cleanText.length > 50; // Arbitrary threshold - adjust as needed
}

/**
 * Process a PDF file, handling both text-based and scanned PDFs
 * @param file - PDF file to process
 * @returns Extracted text from the PDF
 */
export async function processPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      
      // Try to extract text first
      let pageText = await extractTextFromPage(page);
      
      // If page doesn't have enough text content, try OCR
      if (!hasTextContent(pageText)) {
        console.log(`Page ${i} appears to be scanned, applying OCR...`);
        const imageData = await extractImageFromPage(page);
        if (imageData) {
          pageText = await processImageWithOCR(imageData);
        }
      }
      
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error in advanced PDF processing:', error);
    throw new Error('Failed to process PDF. The file may be corrupted or password-protected.');
  }
}

/**
 * Estimate the number of tokens in a text
 * @param text - The text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  // A very rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Extract metadata from a PDF file
 * @param file - PDF file to extract metadata from
 * @returns PDF metadata object
 */
export async function extractPDFMetadata(file: File): Promise<any> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    
    const metadata = await pdf.getMetadata().catch(() => null);
    
    return {
      pageCount: pdf.numPages,
      info: metadata?.info || {},
      metadata: metadata?.metadata || {},
      version: pdf._pdfInfo.version,
      textLength: 0,
      estimatedTokens: 0
    };
  } catch (error) {
    console.error('Error extracting PDF metadata:', error);
    return null;
  }
} 