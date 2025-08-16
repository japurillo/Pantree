'use client'

import { useState } from 'react'
import ImageUpload from '@/components/ui/ImageUpload'

export default function TestImagePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageSelect = async (file: File) => {
    console.log('Selected file:', file.name, 'Size:', file.size, 'bytes')
    setSelectedImage(URL.createObjectURL(file))
    
    // Upload the optimized image automatically
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        setUploadedUrl(data.url)
        console.log('Upload successful:', data.url)
      } else {
        const errorData = await response.json()
        console.error('Upload failed:', errorData)
        alert('Upload failed: ' + errorData.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload error: ' + error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageRemove = () => {
    setSelectedImage(null)
    setUploadedUrl(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Image Optimization Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Upload Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Upload & Optimize Image</h2>
            <ImageUpload
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              selectedImage={selectedImage}
              autoOptimize={true}
            />
          </div>

          {/* Results Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            
            {isUploading && (
              <div className="text-blue-600 mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 inline-block mr-2"></div>
                Uploading...
              </div>
            )}
            
            {uploadedUrl && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">Uploaded Image:</h3>
                  <img 
                    src={uploadedUrl} 
                    alt="Uploaded" 
                    className="mt-2 max-w-full h-auto rounded-lg border"
                  />
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">Image URL:</h3>
                  <p className="text-sm text-gray-600 break-all mt-1">{uploadedUrl}</p>
                </div>
              </div>
            )}
            
            {!uploadedUrl && !isUploading && (
              <p className="text-gray-500">Upload an image to see results</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-2">How to Test:</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>Select a large image (larger than 400x400px)</li>
            <li>Watch the optimization process</li>
            <li>Check the console for file size logs</li>
            <li>Verify the uploaded image is properly sized</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
