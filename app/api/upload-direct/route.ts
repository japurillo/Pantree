import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    console.log('Direct Upload API: Starting upload process')
    
    const token = await getToken({ req: request })
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('Direct Upload API: File received:', file.name, 'Size:', file.size, 'bytes')

    // Check file size (limit to 5MB for direct upload)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Use direct upload method with shorter timeout
    const folder = process.env.CLOUDINARY_FOLDER || 'pantree'
    const username = token.username || 'unknown'
    
    console.log('Direct Upload API: Starting Cloudinary direct upload')
    
    const result = await cloudinary.uploader.upload(
      `data:${file.type};base64,${buffer.toString('base64')}`,
      {
        folder: `${folder}/${username}`,
        transformation: [
          { width: 400, height: 400, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ],
        timeout: 20000, // 20 second timeout
        resource_type: 'auto'
      }
    )

    console.log('Direct Upload API: Upload completed successfully')
    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id
    })
  } catch (error) {
    console.error('Direct Upload API: Upload error:', error)
    
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json({ error: 'Upload timeout. Please try again with a smaller image.' }, { status: 408 })
    }
    
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
