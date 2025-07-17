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
      localStorage.setItem(`analysis-${docId}`, JSON.stringify({
        ...analysis,
        _timestamp: new Date().toISOString(),
        _docId: docId
      }));
      
      // Add to analyzedDocuments list if needed
      updateLocalDocumentsList(docId, docName, status);
    } catch (localError) {
      console.warn('Failed to store in localStorage, but Supabase storage succeeded:', localError);
    }
  } catch (error) {
    console.error('Error storing document analysis:', error);
    
    // Fallback to local storage only
    try {
      localStorage.setItem(`analysis-${docId}`, JSON.stringify({
        ...analysis,
        _timestamp: new Date().toISOString(),
        _docId: docId
      }));
      
      // Add to analyzedDocuments list
      updateLocalDocumentsList(docId, docName, status);
    } catch (localError) {
      console.error('Critical error: Failed to store document analysis anywhere:', localError);
    }
  }
}

/**
 * Updates local documents list in localStorage
 */
function updateLocalDocumentsList(docId: string, docName: string, status: string): void {
  try {
    const existingDocsStr = localStorage.getItem('analyzedDocuments');
    let analyzedDocuments = [];
    
    if (existingDocsStr) {
      analyzedDocuments = JSON.parse(existingDocsStr);
      // Update existing document if it exists
      const docIndex = analyzedDocuments.findIndex((doc: any) => doc.id === docId);
      if (docIndex >= 0) {
        analyzedDocuments[docIndex] = {
          ...analyzedDocuments[docIndex],
          name: docName,
          status,
          date: new Date().toISOString()
        };
      } else {
        // Add new document to the beginning of the list
        analyzedDocuments.unshift({
          id: docId,
          name: docName,
          status,
          date: new Date().toISOString()
        });
      }
    } else {
      // Create new documents list
      analyzedDocuments = [{
        id: docId,
        name: docName,
        status,
        date: new Date().toISOString()
      }];
    }
    
    localStorage.setItem('analyzedDocuments', JSON.stringify(analyzedDocuments));
  } catch (error) {
    console.error('Error updating local documents list:', error);
  }
}

/**
 * Gets document analysis from Supabase with improved error handling
 * @param userId - The user ID
 * @param docId - The document ID
 * @returns The analysis result or null if not found
 */
export async function getDocumentAnalysis(userId: string, docId: string): Promise<any> {
  try {
    console.log(`Loading analysis for document: ${docId}, user: ${userId}`);
    
    // Try to get from Supabase with retry mechanism
    const supabaseAnalysis = await retryOperation(async () => {
    const { data, error } = await supabase
      .from('document_analysis')
      .select('*')
      .eq('user_id', userId)
      .eq('document_id', docId)
      .single();

    if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - this is expected, not an error
          return null;
        }
        throw error;
      }

      return data;
    });

    if (supabaseAnalysis) {
      console.log(`Found analysis in Supabase for document: ${docId}`);
      
      // Store in localStorage for future offline access
      try {
        localStorage.setItem(`analysis-${docId}`, JSON.stringify({
          ...supabaseAnalysis.analysis,
          _timestamp: supabaseAnalysis.updated_at,
          _docId: docId
        }));
      } catch (localError) {
        console.warn('Failed to cache Supabase analysis in localStorage:', localError);
      }
      
      return supabaseAnalysis.analysis;
    }

    // If not found in Supabase, try localStorage
    console.log(`No analysis found in Supabase for document: ${docId}, checking localStorage`);
    return getLocalDocumentAnalysis(docId);
  } catch (error) {
    console.error('Error getting document analysis from Supabase:', error);
    
    // Try localStorage as fallback
    console.log(`Falling back to localStorage for document: ${docId}`);
    return getLocalDocumentAnalysis(docId);
  }
}

/**
 * Gets document analysis from localStorage
 * @param docId - The document ID
 * @returns The analysis result or null if not found
 */
function getLocalDocumentAnalysis(docId: string): any {
  try {
    const analysisStr = localStorage.getItem(`analysis-${docId}`);
    return analysisStr ? JSON.parse(analysisStr) : null;
  } catch (error) {
    console.error('Error getting document analysis from localStorage:', error);
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
      const localDocuments = getLocalDocuments();
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
      localStorage.setItem('analyzedDocuments', JSON.stringify(documentsList));
      
      // Cache individual analyses
      transformedDocuments.forEach(doc => {
        if (doc.analysis) {
          localStorage.setItem(`analysis-${doc.id}`, JSON.stringify({
            ...doc.analysis,
            _timestamp: doc.date,
            _docId: doc.id
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
    const localDocuments = getLocalDocuments();
    
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
 */
function getLocalDocuments(): any[] {
    try {
      const localDocsStr = localStorage.getItem('analyzedDocuments');
      return localDocsStr ? JSON.parse(localDocsStr) : [];
    } catch (localError) {
      console.error('Error getting local documents:', localError);
      return [];
  }
}

/**
 * Merges Supabase documents with localStorage documents
 * @param supabaseDocuments - Documents from Supabase
 * @returns Merged array of documents
 */
function mergeWithLocalDocuments(supabaseDocuments: any[]): any[] {
  try {
    const localDocsStr = localStorage.getItem('analyzedDocuments');
    if (!localDocsStr) return supabaseDocuments;
    
    const localDocs = JSON.parse(localDocsStr);
    
    // Create a map of Supabase documents by ID
    const supabaseDocsMap = new Map(
      supabaseDocuments.map(doc => [doc.document_id, {
        id: doc.document_id,
        name: doc.document_name,
        status: doc.status,
        date: doc.updated_at || doc.created_at
      }])
    );
    
    // Add local documents that don't exist in Supabase
    for (const localDoc of localDocs) {
      if (!supabaseDocsMap.has(localDoc.id)) {
        supabaseDocsMap.set(localDoc.id, localDoc);
      }
    }
    
    // Convert back to array and sort by date
    return Array.from(supabaseDocsMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error merging documents:', error);
    return supabaseDocuments;
  }
}

/**
 * Deletes a document analysis
 * @param userId - The user ID
 * @param docId - The document ID
 */
export async function deleteDocumentAnalysis(userId: string, docId: string): Promise<void> {
  try {
    // Delete from Supabase
    const { error } = await supabase
      .from('document_analysis')
      .delete()
      .eq('user_id', userId)
      .eq('document_id', docId);

    if (error) throw error;
    
    // Also delete from localStorage
    localStorage.removeItem(`analysis-${docId}`);
    
    // Update analyzedDocuments list
    const existingDocsStr = localStorage.getItem('analyzedDocuments');
    if (existingDocsStr) {
      const docs = JSON.parse(existingDocsStr);
      const filteredDocs = docs.filter((doc: any) => doc.id !== docId);
      localStorage.setItem('analyzedDocuments', JSON.stringify(filteredDocs));
    }
    
    console.log(`Successfully deleted document analysis for ${docId}`);
  } catch (error) {
    console.error('Error deleting document analysis:', error);
    
    // Try to delete from localStorage anyway
    try {
      localStorage.removeItem(`analysis-${docId}`);
      
      const existingDocsStr = localStorage.getItem('analyzedDocuments');
      if (existingDocsStr) {
        const docs = JSON.parse(existingDocsStr);
        const filteredDocs = docs.filter((doc: any) => doc.id !== docId);
        localStorage.setItem('analyzedDocuments', JSON.stringify(filteredDocs));
      }
    } catch (localError) {
      console.error('Error deleting from localStorage:', localError);
    }
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