declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    info: Record<string, any>;
    metadata: Record<string, any>;
    version: string;
  }

  type RenderOptions = {
    pagerender?: (pageData: any) => Promise<string>;
  };

  function pdfParse(dataBuffer: Buffer, options?: RenderOptions): Promise<PDFData>;
  
  export default pdfParse;
} 