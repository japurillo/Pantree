import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getToken } from 'next-auth/jwt'
import { v2 as cloudinary } from 'cloudinary'
import { PrismaClient } from '@prisma/client'
import { 
  isSupportedImageType, 
  isFileSizeValid, 
  MAX_FILE_SIZE,
  SUPPORTED_IMAGE_TYPES 
} from '@/lib/imageOptimization'

const prisma = new PrismaClient()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    // Try getServerSession first
    let session = await getServerSession()
    
    console.log('Upload API - Full session from getServerSession:', session)
    
    // If session doesn't have user ID, try getToken as fallback
    if (!session?.user?.id) {
      console.log('Upload API - Session missing user ID, trying getToken...')
      const token = await getToken({ req: request })
      console.log('Upload API - Token from getToken:', token)
      
      if (token?.id || token?.sub) {
        // Create a mock session from token
        session = {
          user: {
            id: (token.id || token.sub) as string,
            role: token.role as string,
            username: token.username as string,
            email: token.email as string
          }
        } as any
        console.log('Upload API - Created session from token:', session)
      }
    }
    
    console.log('Upload API - Final session:', session)
    console.log('Upload API - User:', session?.user)
    
    if (!session?.user?.id) {
      console.log('Upload API - Unauthorized: No session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('Upload API - File received:', file.name, 'Size:', file.size, 'bytes')
    console.log('Upload API - File type:', file.type)

    // Validate file type
    if (!isSupportedImageType(file)) {
      return NextResponse.json(
        { 
          error: `Unsupported file type. Supported types: ${SUPPORTED_IMAGE_TYPES.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (!isFileSizeValid(file)) {
      return NextResponse.json(
        { 
          error: `File size too large. Maximum size: ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB` 
        },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get folder from environment variable with fallback
    const folder = process.env.CLOUDINARY_FOLDER || 'pantree'
    console.log('Upload API - Using Cloudinary folder:', folder)

    // Get user to find their family and admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { family: { include: { admin: true } } }
    })

    if (!user?.family?.admin?.username) {
      console.log('Upload API - User not in a family or family has no admin')
      return NextResponse.json({ error: 'User not properly configured' }, { status: 400 })
    }

    // Create family-specific folder path
    const familyFolder = `${folder}/${user.family.admin.username}`
    console.log('Upload API - Using family folder:', familyFolder)

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: familyFolder, // Now uses family-specific folder
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    console.log('Upload API - Cloudinary result:', (result as any).secure_url)

    return NextResponse.json({
      url: (result as any).secure_url,
      publicId: (result as any).public_id,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    )
  }
}
