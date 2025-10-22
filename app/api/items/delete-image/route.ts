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
    const token = await getToken({ req: request })
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { publicId } = await request.json()

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID is required' }, { status: 400 })
    }
    
    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId)
    
    if (result.result === 'ok') {
      return NextResponse.json({ message: 'Image deleted successfully' })
    } else {
      console.error(`Failed to delete image from Cloudinary: ${publicId}, result:`, result)
      return NextResponse.json({ 
        error: `Failed to delete image from Cloudinary: ${result.result}`
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error)
    return NextResponse.json({ 
      error: 'Internal server error'
    }, { status: 500 })
  }
}
