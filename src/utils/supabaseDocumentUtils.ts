import { supabase } from '@/lib/supabase';

/**
 * Retry function for network operations
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Stores a document analysis result in Supabase and local storage for fallback
 * @param userId - The user ID
 * @param docId - The document ID
 * @param docName - The document name
 * @param analysis - The analysis result object
 * @param status - The analysis status
 */
export async function storeDocumentAnalysis(
  userId: string,
  docId: string, 
  docName: string,
  analysis: any,
  status: 'Processing' | 'Analyzed' | 'Error' = 'Analyzed'
): Promise<void> {
  try {
    // Store in Supabase with retry mechanism
    await retryOperation(async () => {
      const { error } = await supabase
      .from('document_analysis')
      .upsert({
        user_id: userId,
        document_id: docId,
        document_name: docName,
        analysis,
        status,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,document_id'
      });

      if (error) throw error;
    });

    console.log('Successfully stored document analysis in Supabase');

    // Also store in localStorage for offline/fallback access
    try {
      localStorage.setItem(`analysis-${userId}-${docId}`, JSON.stringify({
        ...analysis,
        _timestamp: new Date().toISOString(),
        _docId: docId,
        _userId: userId
      }));
      
      // Add to analyzedDocuments list if needed
      updateLocalDocumentsList(docId, docName, status, userId);
    } catch (localError) {
      console.warn('Failed to store in localStorage, but Supabase storage succeeded:', localError);
    }
  } catch (error) {
    console.error('Error storing document analysis:', error);
    
    // Fallback to local storage only
    try {
      localStorage.setItem(`analysis-${userId}-${docId}`, JSON.stringify({
        ...analysis,
        _timestamp: new Date().toISOString(),
        _docId: docId,
        _userId: userId
      }));
      
      // Add to analyzedDocuments list
      updateLocalDocumentsList(docId, docName, status, userId);
    } catch (localError) {
      console.error('Critical error: Failed to store document analysis anywhere:', localError);
    }
  }
}

/**
 * Updates local documents list in localStorage
 * @param docId - Document ID
 * @param docName - Document name  
 * @param status - Document status
 * @param userId - User ID for user-specific storage
 */
function updateLocalDocumentsList(docId: string, docName: string, status: string, userId?: string): void {
  try {
    // Use user-specific storage key if userId provided
    const storageKey = userId ? `analyzedDocuments_${userId}` : 'analyzedDocuments';
    
    const existingDocsStr = localStorage.getItem(storageKey);
    const existingDocs = existingDocsStr ? JSON.parse(existingDocsStr) : [];
    
    // Check if document already exists
    const existingIndex = existingDocs.findIndex((doc: any) => doc.id === docId);
    
    const documentEntry = {
      id: docId,
      name: docName,
      status: status,
      date: new Date().toISOString()
    };
    
    if (existingIndex !== -1) {
      // Update existing entry
      existingDocs[existingIndex] = documentEntry;
    } else {
      // Add new entry at the beginning
      existingDocs.unshift(documentEntry);
    }
    
    // Save back to localStorage with user-specific key
    localStorage.setItem(storageKey, JSON.stringify(existingDocs));
    
    console.log(`Updated local documents list for ${userId ? `user ${userId}` : 'legacy storage'}`);
  } catch (error) {
    console.error('Error updating local documents list:', error);
  }
}

/**
 * Gets a specific document analysis from localStorage with user isolation
 * @param docId - Document ID
 * @param userId - User ID for user-specific storage
 * @returns Document analysis or null if not found
 */
export function getUserDocumentAnalysis(docId: string, userId: string): any {
  try {
    // Try user-specific key first
    const userSpecificData = localStorage.getItem(`analysis-${userId}-${docId}`);
    if (userSpecificData) {
      return JSON.parse(userSpecificData);
    }
    
    // For backward compatibility, try legacy key but only if no userId-specific data exists
    const legacyData = localStorage.getItem(`analysis-${docId}`);
    if (legacyData) {
      const parsed = JSON.parse(legacyData);
      // Migrate to user-specific storage
      localStorage.setItem(`analysis-${userId}-${docId}`, legacyData);
      // Remove legacy key to prevent future conflicts
      localStorage.removeItem(`analysis-${docId}`);
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user document analysis:', error);
    return null;
  }
}

/**
 * Gets document analysis from localStorage (legacy function - use getUserDocumentAnalysis instead)
 * @param docId - Document ID
 * @returns Document analysis or null if not found
 */
function getLocalDocumentAnalysis(docId: string): any {
  try {
    const analysisData = localStorage.getItem(`analysis-${docId}`);
    return analysisData ? JSON.parse(analysisData) : null;
  } catch (error) {
    console.error('Error getting local document analysis:', error);
    return null;
  }
}

/**
 * Gets all document analyses for a user from Supabase with improved error handling
 * @param userId - The user ID
 * @returns Array of document analyses
 */
export async function getAllUserDocuments(userId: string): Promise<any[]> {
  try {
    console.log(`Loading documents for user: ${userId}`);
    
    // Get from Supabase with retry mechanism
    const supabaseDocuments = await retryOperation(async () => {
    const { data, error } = await supabase
      .from('document_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      return data || [];
    });

    console.log(`Found ${supabaseDocuments.length} documents in Supabase`);

    // Transform Supabase documents to the expected format
    const transformedDocuments = supabaseDocuments.map(doc => ({
      id: doc.document_id,
      name: doc.document_name,
      status: doc.status,
      date: doc.updated_at || doc.created_at,
      analysis: doc.analysis // Include analysis data for immediate access
    }));

    // Only merge with local documents if Supabase returned empty results
    if (transformedDocuments.length === 0) {
      console.log('No documents found in Supabase, checking localStorage');
      const localDocuments = getLocalDocuments(userId);
      if (localDocuments.length > 0) {
        console.log(`Found ${localDocuments.length} documents in localStorage`);
        return localDocuments;
      }
    }

    // Cache the results locally for offline access
    try {
      const documentsList = transformedDocuments.map(doc => ({
        id: doc.id,
        name: doc.name,
        status: doc.status,
        date: doc.date
      }));
      
      // Use user-specific storage key
      const storageKey = `analyzedDocuments_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(documentsList));
      
      // Cache individual analyses with user-specific keys
      transformedDocuments.forEach(doc => {
        if (doc.analysis) {
          localStorage.setItem(`analysis-${userId}-${doc.id}`, JSON.stringify({
            ...doc.analysis,
            _timestamp: doc.date,
            _docId: doc.id,
            _userId: userId
          }));
        }
      });
    } catch (localError) {
      console.warn('Failed to cache documents locally:', localError);
    }
    
    return transformedDocuments;
  } catch (error) {
    console.error('Error getting all user documents from Supabase:', error);
    
    // Fallback to local storage with better error handling
    console.log('Falling back to localStorage');
    const localDocuments = getLocalDocuments(userId);
    
    if (localDocuments.length === 0) {
      console.log('No documents found in localStorage either');
      // Return empty array instead of throwing error
      return [];
    }
    
    console.log(`Returning ${localDocuments.length} documents from localStorage`);
    return localDocuments;
  }
}

/**
 * Gets documents from localStorage with error handling
 * @param userId - User ID to filter documents (optional for backward compatibility)
 */
function getLocalDocuments(userId?: string): any[] {
  try {
    // If userId provided, use user-specific storage key
    const storageKey = userId ? `analyzedDocuments_${userId}` : 'analyzedDocuments';
    const localDocsStr = localStorage.getItem(storageKey);
    
    if (!localDocsStr) {
      // If no user-specific documents found, try legacy key but only if no userId provided
      if (!userId) {
        const legacyDocsStr = localStorage.getItem('analyzedDocuments');
        return legacyDocsStr ? JSON.parse(legacyDocsStr) : [];
      }
      return [];
    }
    
    return JSON.parse(localDocsStr);
  } catch (localError) {
    console.error('Error getting local documents:', localError);
    return [];
  }
}

/**
 * Deletes a document analysis from Supabase and localStorage
 * @param userId - The user ID
 * @param docId - The document ID
 * @returns Promise<boolean> - Success status
 */
export async function deleteDocumentAnalysis(userId: string, docId: string): Promise<boolean> {
  try {
    // Delete from Supabase
    const { error } = await supabase
      .from('document_analysis')
      .delete()
      .eq('user_id', userId)
      .eq('document_id', docId);

    if (error) {
      console.error('Error deleting from Supabase:', error);
      // Continue to try localStorage cleanup even if Supabase fails
    }

    // Delete from localStorage (user-specific)
    try {
      // Remove analysis data
      localStorage.removeItem(`analysis-${userId}-${docId}`);
      
      // Remove from documents list
      const storageKey = `analyzedDocuments_${userId}`;
      const docsStr = localStorage.getItem(storageKey);
      if (docsStr) {
        const docs = JSON.parse(docsStr);
        const filteredDocs = docs.filter((doc: any) => doc.id !== docId);
        localStorage.setItem(storageKey, JSON.stringify(filteredDocs));
      }

      // Also clean up legacy storage
      localStorage.removeItem(`analysis-${docId}`);
      const legacyDocsStr = localStorage.getItem('analyzedDocuments');
      if (legacyDocsStr) {
        const legacyDocs = JSON.parse(legacyDocsStr);
        const filteredLegacyDocs = legacyDocs.filter((doc: any) => doc.id !== docId);
        localStorage.setItem('analyzedDocuments', JSON.stringify(filteredLegacyDocs));
      }
    } catch (localError) {
      console.error('Error cleaning up localStorage:', localError);
    }

    return !error; // Return true if Supabase deletion succeeded
  } catch (error) {
    console.error('Error in deleteDocumentAnalysis:', error);
    return false;
  }
}

/**
 * Updates a document's status
 * @param userId - The user ID
 * @param docId - The document ID
 * @param status - The new status
 */
export async function updateDocumentStatus(
  userId: string,
  docId: string, 
  status: 'Processing' | 'Analyzed' | 'Error'
): Promise<void> {
  try {
    // Update in Supabase
    const { error } = await supabase
      .from('document_analysis')
      .update({ 
        status,
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId)
      .eq('document_id', docId);

    if (error) throw error;
    
    // Update in localStorage
    updateLocalDocumentStatus(docId, status);
    
    console.log(`Successfully updated document status to ${status} for ${docId}`);
  } catch (error) {
    console.error('Error updating document status:', error);
    
    // Update in localStorage anyway
    updateLocalDocumentStatus(docId, status);
  }
}

/**
 * Updates a document's status in localStorage
 */
function updateLocalDocumentStatus(docId: string, status: string): void {
  try {
    const existingDocsStr = localStorage.getItem('analyzedDocuments');
    if (existingDocsStr) {
      const docs = JSON.parse(existingDocsStr);
      const updatedDocs = docs.map((doc: any) => {
        if (doc.id === docId) {
          return { ...doc, status };
        }
        return doc;
      });
      localStorage.setItem('analyzedDocuments', JSON.stringify(updatedDocs));
    }
  } catch (error) {
    console.error('Error updating local document status:', error);
  }
} 