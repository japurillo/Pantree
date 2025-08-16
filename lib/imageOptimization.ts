// Image optimization utilities for Cloudinary uploads

export interface ImageDimensions {
  width: number
  height: number
}

export interface OptimizedImage {
  file: File
  dimensions: ImageDimensions
  size: number
}

// Maximum dimensions for uploaded images
export const MAX_IMAGE_DIMENSIONS = {
  width: 400,
  height: 400
}

// Maximum file size in bytes (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024

// Supported image types
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]

// Check if file is a supported image type
export function isSupportedImageType(file: File): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(file.type)
}

// Check if file size is within limits
export function isFileSizeValid(file: File): boolean {
  return file.size <= MAX_FILE_SIZE
}

// Get image dimensions from a file
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

// Calculate new dimensions while maintaining aspect ratio
export function calculateResizedDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = MAX_IMAGE_DIMENSIONS.width,
  maxHeight: number = MAX_IMAGE_DIMENSIONS.height
): ImageDimensions {
  let { width, height } = { width: originalWidth, height: originalHeight }
  
  // Calculate aspect ratio
  const aspectRatio = width / height
  
  // Resize if image is larger than maximum dimensions
  if (width > maxWidth || height > maxHeight) {
    if (width > height) {
      // Landscape image
      width = maxWidth
      height = Math.round(width / aspectRatio)
      
      // If height is still too large, recalculate
      if (height > maxHeight) {
        height = maxHeight
        width = Math.round(height * aspectRatio)
      }
    } else {
      // Portrait or square image
      height = maxHeight
      width = Math.round(height * aspectRatio)
      
      // If width is still too large, recalculate
      if (width > maxWidth) {
        width = maxWidth
        height = Math.round(width / aspectRatio)
      }
    }
  }
  
  return { width, height }
}

// Resize image using Canvas API
export function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }
    
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      
      // Set canvas dimensions
      canvas.width = targetWidth
      canvas.height = targetHeight
      
      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // Draw resized image
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new file with optimized dimensions
            const optimizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(optimizedFile)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        file.type,
        quality
      )
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

// Main function to optimize image before upload
export async function optimizeImageForUpload(file: File): Promise<OptimizedImage> {
  // Validate file type
  if (!isSupportedImageType(file)) {
    throw new Error('Unsupported image type. Please use JPEG, PNG, WebP, or GIF.')
  }
  
  // Validate file size
  if (!isFileSizeValid(file)) {
    throw new Error('File size too large. Maximum size is 5MB.')
  }
  
  // Get original dimensions
  const originalDimensions = await getImageDimensions(file)
  
  // Calculate new dimensions
  const newDimensions = calculateResizedDimensions(
    originalDimensions.width,
    originalDimensions.height
  )
  
  // Check if resizing is needed
  if (
    originalDimensions.width <= MAX_IMAGE_DIMENSIONS.width &&
    originalDimensions.height <= MAX_IMAGE_DIMENSIONS.height
  ) {
    // No resizing needed, return original file
    return {
      file,
      dimensions: originalDimensions,
      size: file.size
    }
  }
  
  // Resize image
  const optimizedFile = await resizeImage(
    file,
    newDimensions.width,
    newDimensions.height
  )
  
  return {
    file: optimizedFile,
    dimensions: newDimensions,
    size: optimizedFile.size
  }
}

// Utility to format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get compression ratio
export function getCompressionRatio(originalSize: number, optimizedSize: number): number {
  return Math.round(((originalSize - optimizedSize) / originalSize) * 100)
}
