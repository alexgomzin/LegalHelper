import { supabase } from '@/lib/supabase';

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
    // Store in Supabase
    const { data, error } = await supabase
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

    if (error) {
      console.error('Error storing document analysis in Supabase:', error);
      throw error;
    }

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
 * Gets document analysis from Supabase, with localStorage as fallback
 * @param userId - The user ID
 * @param docId - The document ID
 * @returns The analysis result or null if not found
 */
export async function getDocumentAnalysis(userId: string, docId: string): Promise<any> {
  try {
    // Try to get from Supabase
    const { data, error } = await supabase
      .from('document_analysis')
      .select('*')
      .eq('user_id', userId)
      .eq('document_id', docId)
      .single();

    if (error) {
      console.warn('Error fetching document analysis from Supabase, trying localStorage:', error);
      // Try to get from localStorage as fallback
      return getLocalDocumentAnalysis(docId);
    }

    if (data) {
      // Store in localStorage for future offline access
      try {
        localStorage.setItem(`analysis-${docId}`, JSON.stringify({
          ...data.analysis,
          _timestamp: data.updated_at,
          _docId: docId
        }));
      } catch (localError) {
        console.warn('Failed to cache Supabase analysis in localStorage:', localError);
      }
      
      return data.analysis;
    }

    // If not found in Supabase, try localStorage
    return getLocalDocumentAnalysis(docId);
  } catch (error) {
    console.error('Error getting document analysis:', error);
    // Try localStorage as fallback
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
 * Gets all document analyses for a user from Supabase
 * @param userId - The user ID
 * @returns Array of document analyses
 */
export async function getAllUserDocuments(userId: string): Promise<any[]> {
  try {
    // Get from Supabase
    const { data, error } = await supabase
      .from('document_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Also try to merge with any local-only documents
    const mergedDocuments = mergeWithLocalDocuments(data || []);
    
    return mergedDocuments;
  } catch (error) {
    console.error('Error getting all user documents:', error);
    
    // Fallback to local storage
    try {
      const localDocsStr = localStorage.getItem('analyzedDocuments');
      return localDocsStr ? JSON.parse(localDocsStr) : [];
    } catch (localError) {
      console.error('Error getting local documents:', localError);
      return [];
    }
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