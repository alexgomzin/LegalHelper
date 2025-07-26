'use client'

import { useState, useRef } from 'react'
import axios from 'axios'
import { addDocument } from '@/utils/documentUtils'
import { useTranslation } from '@/contexts/LanguageContext'

interface DocumentUploaderProps {
  onUploadStart: () => void
  onUploadProgress: (percent: number) => void
  onUploadComplete: () => void
  onError: (errorMessage: string) => void
  onFileSelected?: (file: File, startUpload: () => void) => void
  disabled?: boolean
}

export default function DocumentUploader({
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onError,
  onFileSelected,
  disabled = false
}: DocumentUploaderProps) {
  const { t } = useTranslation()
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (disabled) return;
    
    const files = e.dataTransfer.files
    if (files.length) {
      handleFileSelection(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0])
    }
  }

  const handleFileSelection = (file: File) => {
    // Notify about file selection first - this allows parent to check credits
    if (onFileSelected) {
      onFileSelected(file, () => handleFileUpload(file));
      // Parent component will call startUpload if credits are available
      return;
    }
    
    // Fallback: if no onFileSelected callback, proceed with upload
    handleFileUpload(file);
  }

  const handleFileUpload = async (file: File) => {
    // Check file type (PDF only)
    if (file.type !== 'application/pdf') {
      onError(t('analyze.pleaseUploadPdf'))
      return
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError(t('analyze.fileTooLarge'))
      return
    }
    
    // Note: onFileSelected is handled in handleFileSelection, not here
    // This function is called directly only when credits are already verified
    
    onUploadStart()
    console.log('Starting file upload for:', file.name)
    
    try {
      // Create FormData
      const formData = new FormData()
      formData.append('document', file)
      
      // Use a single endpoint for uploading files
      const endpoint = '/api/upload'
      console.log(`Uploading to endpoint: ${endpoint}`)
      
      // Upload the file
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onUploadProgress(percentCompleted)
          }
        }
      })
      
      console.log(`Upload response:`, response.data)
      
      // Check if the upload was successful
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || 'Upload failed')
      }
      
      // Check if we have a file ID
      if (!response.data.fileId) {
        throw new Error('Server response missing file ID')
      }
      
      // Save the file ID to session storage
      const fileId = response.data.fileId
      sessionStorage.setItem('fileId', fileId)
      console.log(`File ID ${fileId} stored in session storage`)
      
      // Add the document to localStorage with "Processing" status
      addDocument(fileId, file.name, 'Processing')
      
      // Complete the upload process
      onUploadComplete()
    } catch (error: any) {
      console.error('Upload error:', error)
      
      if (axios.isAxiosError(error) && error.response) {
        onError(t('analyze.uploadFailed') + ': ' + (error.response.data?.error || error.message))
      } else {
        onError(t('analyze.uploadFailed') + ': ' + (error.message || 'Unknown error'))
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* File requirements info panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-blue-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {t('analyze.importantRequirements')}
        </h3>
        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside ml-1 space-y-1">
          <li dangerouslySetInnerHTML={{ __html: t('analyze.uploadTextBasedPdf') }} />
          <li>{t('analyze.scannedDocumentsWarning')}</li>
          <li>{t('analyze.maximumFileSize')}</li>
        </ul>
      </div>

      {/* Dropzone */}
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          disabled ? 'border-gray-200 bg-gray-50 cursor-not-allowed' :
          isDragging ? 'border-blue-400 bg-blue-50 cursor-pointer' : 'border-gray-300 hover:border-blue-300 cursor-pointer'
        }`}
        onDragOver={disabled ? undefined : handleDragOver}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDrop={disabled ? undefined : handleDrop}
        onClick={disabled ? undefined : () => fileInputRef.current?.click()}
      >
        <input
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={disabled}
        />
        
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="mx-auto h-12 w-12 text-blue-500" 
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        
        <h3 className="mt-4 text-lg font-medium text-gray-700">
          {t('analyze.uploadYourDocument')}
        </h3>
        
        <p className="mt-2 text-base text-gray-600">
          {t('analyze.dragAndDropPdf')}
        </p>
        
        <div className="mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500">
          {t('analyze.selectPdfFile')}
        </div>
      </div>
      
      {/* Best practices */}
      <div className="text-sm text-gray-500 mt-4">
        <h4 className="font-medium text-gray-700 mb-2">{t('analyze.forBestResults')}</h4>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>{t('analyze.useTextBasedPdfs')}</li>
          <li>{t('analyze.ensureNotPasswordProtected')}</li>
          <li>{t('analyze.makeSureTextClear')}</li>
        </ul>
      </div>
    </div>
  )
} 