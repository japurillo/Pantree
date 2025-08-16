'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { useImageOptimization, useFileValidation } from '@/hooks/useImageOptimization'
import { optimizeImageForUpload } from '@/lib/imageOptimization'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  onImageRemove: () => void
  selectedImage?: string | null
  className?: string
  disabled?: boolean
  maxSize?: number // in MB
  acceptedTypes?: string[]
  autoOptimize?: boolean // Whether to automatically optimize and pass the optimized image
  onOptimizationStart?: () => void
  onOptimizationComplete?: () => void
}

export default function ImageUpload({
  onImageSelect,
  onImageRemove,
  selectedImage,
  className,
  disabled = false,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  autoOptimize = true,
  onOptimizationStart,
  onOptimizationComplete
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  
  const {
    isOptimizing,
    error: optimizationError,
    reset: resetOptimization
  } = useImageOptimization()

  const {
    selectedFile,
    validationError,
    validateAndSetFile,
    clearValidation
  } = useFileValidation()

  const handleFileSelect = useCallback(async (file: File) => {
    if (disabled) return

    console.log('ImageUpload: File selected:', file.name, 'Size:', file.size, 'bytes')
    clearValidation()
    resetOptimization()

    if (!validateAndSetFile(file)) {
      return
    }

    try {
      if (autoOptimize) {
        console.log('ImageUpload: Starting automatic optimization...')
        
        // Call onStart callback
        onOptimizationStart?.()
        
        const result = await optimizeImageForUpload(file)
        console.log('ImageUpload: Optimization completed, result:', result)
        
        // Pass the optimized image directly to the parent
        console.log('ImageUpload: Passing optimized image to parent')
        onImageSelect(result.file)
        
        // Call onComplete callback
        onOptimizationComplete?.()
      } else {
        // Manual mode - just pass the original file
        onImageSelect(file)
      }
    } catch (err) {
      console.error('ImageUpload: Image optimization failed:', err)
      // Fallback to original file if optimization fails
      onImageSelect(file)
    }
  }, [disabled, validateAndSetFile, clearValidation, resetOptimization, autoOptimize, onImageSelect])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [disabled, handleFileSelect])

  const handleRemoveImage = useCallback(() => {
    onImageRemove()
    resetOptimization()
    clearValidation()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onImageRemove, resetOptimization, clearValidation])

  const handleUploadClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])

  // Use selected file for preview
  const currentImageUrl = selectedImage || (selectedFile ? URL.createObjectURL(selectedFile) : null)

  return (
    <div className={cn('space-y-4', className)}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area */}
      {!currentImageUrl && (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <ImageIcon className="h-full w-full" />
            </div>
            
            <div>
              <p className="text-sm text-gray-600">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                  disabled={disabled}
                >
                  Click to upload
                </button>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {acceptedTypes.join(', ').toUpperCase()} up to {maxSize}MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Image Preview */}
      {currentImageUrl && (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden border border-gray-200">
            <img
              src={currentImageUrl}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            
            {/* Remove Button */}
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Simple Loading Indicator */}
          {isOptimizing && (
            <div className="mt-2 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Errors */}
          {(validationError || optimizationError) && (
            <div className="mt-2 p-3 bg-red-50 rounded-md">
              <div className="flex items-center space-x-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span>{validationError || optimizationError}</span>
              </div>
            </div>
          )}
        </div>
      )}


    </div>
  )
}
