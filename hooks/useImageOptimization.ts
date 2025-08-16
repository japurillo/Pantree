import { useState, useCallback } from 'react'
import { 
  optimizeImageForUpload, 
  OptimizedImage, 
  ImageDimensions,
  formatFileSize,
  getCompressionRatio 
} from '@/lib/imageOptimization'

interface UseImageOptimizationReturn {
  isOptimizing: boolean
  optimizedImage: OptimizedImage | null
  optimizationProgress: number
  error: string | null
  optimizeImage: (file: File, callbacks?: { onStart?: () => void; onComplete?: () => void }) => Promise<void>
  reset: () => void
  getOptimizationStats: () => {
    originalSize: string
    optimizedSize: string
    compressionRatio: number
    dimensions: ImageDimensions
  } | null
}



export function useImageOptimization(): UseImageOptimizationReturn {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedImage, setOptimizedImage] = useState<OptimizedImage | null>(null)
  const [optimizationProgress, setOptimizationProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const optimizeImage = useCallback(async (file: File, callbacks?: { onStart?: () => void; onComplete?: () => void }) => {
    try {
      setIsOptimizing(true)
      setError(null)
      setOptimizationProgress(0)

      // Call onStart callback
      callbacks?.onStart?.()

      // Simulate progress (since actual optimization is fast)
      const progressInterval = setInterval(() => {
        setOptimizationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 50)

      // Optimize the image
      const result = await optimizeImageForUpload(file)
      
      clearInterval(progressInterval)
      setOptimizationProgress(100)
      
      setOptimizedImage(result)
      
      // Reset progress after a short delay
      setTimeout(() => setOptimizationProgress(0), 500)
      
      // Call onComplete callback
      callbacks?.onComplete?.()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize image')
      setOptimizationProgress(0)
    } finally {
      setIsOptimizing(false)
    }
  }, [])

  const reset = useCallback(() => {
    setOptimizedImage(null)
    setError(null)
    setOptimizationProgress(0)
  }, [])

  const getOptimizationStats = useCallback(() => {
    if (!optimizedImage) return null
    
    return {
      originalSize: formatFileSize(optimizedImage.file.size),
      optimizedSize: formatFileSize(optimizedImage.size),
      compressionRatio: getCompressionRatio(optimizedImage.file.size, optimizedImage.size),
      dimensions: optimizedImage.dimensions
    }
  }, [optimizedImage])

  return {
    isOptimizing,
    optimizedImage,
    optimizationProgress,
    error,
    optimizeImage,
    reset,
    getOptimizationStats
  }
}

// Hook for handling file selection and validation
export function useFileValidation() {
  const [validationError, setValidationError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const validateAndSetFile = useCallback((file: File | null) => {
    setValidationError(null)
    setSelectedFile(file)

    if (!file) return true

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setValidationError(`Invalid file type. Please select: ${validTypes.join(', ')}`)
      return false
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setValidationError(`File too large. Maximum size: ${(maxSize / (1024 * 1024)).toFixed(1)}MB`)
      return false
    }

    return true
  }, [])

  const clearValidation = useCallback(() => {
    setValidationError(null)
  }, [])

  return {
    selectedFile,
    validationError,
    validateAndSetFile,
    clearValidation
  }
}
