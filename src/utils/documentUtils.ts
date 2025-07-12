/**
 * Document utilities for managing document status and analysis
 */

interface DocumentRecord {
  id: string;
  name: string;
  date: string;
  status: string;
}

/**
 * Update a document's status in localStorage
 * @param docId - The document ID to update
 * @param status - The new status ('Processing', 'Analyzed', etc.)
 */
export function updateDocumentStatus(docId: string, status: string): void {
  try {
    const existingDocsStr = localStorage.getItem('analyzedDocuments')
    if (existingDocsStr) {
      const docs = JSON.parse(existingDocsStr) as DocumentRecord[]
      const updatedDocs = docs.map((doc) => {
        if (doc.id === docId) {
          return { ...doc, status }
        }
        return doc
      })
      localStorage.setItem('analyzedDocuments', JSON.stringify(updatedDocs))
      console.log(`Updated document ${docId} status to ${status}`)
    }
  } catch (error) {
    console.error('Error updating document status:', error)
  }
}

/**
 * Add a new document to localStorage
 * @param docId - Document ID
 * @param name - Document name
 * @param status - Initial status ('Processing', 'Analyzed', etc.)
 */
export function addDocument(docId: string, name: string, status: string = 'Processing'): void {
  try {
    const documentRecord: DocumentRecord = {
      id: docId,
      name,
      date: new Date().toISOString(),
      status
    }
    
    let analyzedDocuments: DocumentRecord[] = []
    const existingDocs = localStorage.getItem('analyzedDocuments')
    
    if (existingDocs) {
      analyzedDocuments = JSON.parse(existingDocs)
    }
    
    // Add new document at the beginning
    analyzedDocuments.unshift(documentRecord)
    localStorage.setItem('analyzedDocuments', JSON.stringify(analyzedDocuments))
    console.log(`Added document ${docId} to localStorage with status ${status}`)
  } catch (error) {
    console.error('Error adding document to localStorage:', error)
  }
}

/**
 * Store analysis results for a document
 * @param docId - Document ID
 * @param analysis - Analysis results object
 */
export function storeAnalysisResults(docId: string, analysis: any): void {
  try {
    // Add a timestamp to help with debugging
    const storageData = {
      ...analysis,
      _timestamp: new Date().toISOString(),
      _docId: docId
    };
    
    console.log(`Storing analysis results for document ${docId}`, storageData);
    
    // Store in sessionStorage for current session
    sessionStorage.setItem('analysisResults', JSON.stringify(storageData));
    sessionStorage.setItem('fileId', docId);
    
    // Store in localStorage with document ID for persistence
    localStorage.setItem(`analysis-${docId}`, JSON.stringify(storageData));
    
    // Verify the data was stored correctly
    const verifyStorage = localStorage.getItem(`analysis-${docId}`);
    if (!verifyStorage) {
      console.warn(`Failed to verify storage for document ${docId}. Trying alternate approach.`);
      // Try an alternate approach - sometimes storage fails due to data size or encoding issues
      const minimalData = {
        summary: analysis.summary || "Document analysis completed",
        documentLanguage: analysis.documentLanguage || "en",
        highlightedText: analysis.highlightedText || [],
        _timestamp: new Date().toISOString(),
        _docId: docId
      };
      
      localStorage.setItem(`analysis-${docId}`, JSON.stringify(minimalData));
    }
    
    // Update document status to Analyzed
    updateDocumentStatus(docId, 'Analyzed');
    
    console.log(`Successfully stored analysis results for document ${docId}`);
  } catch (error) {
    console.error('Error storing analysis results:', error);
    
    // Try a minimal fallback approach
    try {
      const fallbackData = {
        summary: "Document analysis completed (storage error occurred)",
        documentLanguage: "en",
        highlightedText: [],
        _error: true,
        _timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`analysis-${docId}`, JSON.stringify(fallbackData));
      sessionStorage.setItem('analysisResults', JSON.stringify(fallbackData));
      sessionStorage.setItem('fileId', docId);
      
      console.log('Stored fallback analysis data');
    } catch (fallbackError) {
      console.error('Critical error: Failed to store even fallback data', fallbackError);
    }
  }
}

/**
 * Get analysis results for a document
 * @param docId - Document ID
 * @returns Analysis results object or null if not found
 */
export function getAnalysisResults(docId: string): any {
  try {
    const analysisStr = localStorage.getItem(`analysis-${docId}`)
    return analysisStr ? JSON.parse(analysisStr) : null
  } catch (error) {
    console.error('Error retrieving analysis results:', error)
    return null
  }
}

/**
 * Check if a document exists in localStorage
 * @param docId - Document ID to check
 * @returns Boolean indicating if document exists
 */
export function documentExists(docId: string): boolean {
  try {
    const existingDocsStr = localStorage.getItem('analyzedDocuments')
    if (existingDocsStr) {
      const docs = JSON.parse(existingDocsStr) as DocumentRecord[]
      return docs.some(doc => doc.id === docId)
    }
    return false
  } catch (error) {
    console.error('Error checking if document exists:', error)
    return false
  }
} 