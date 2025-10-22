import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { v2 as cloudinary } from 'cloudinary'

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Helper function for Supabase queries
async function fetchFromSupabase(query: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  })
  
  if (!response.ok) {
    throw new Error(`Supabase query failed: ${response.statusText}`)
  }
  
  return response.json()
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API: Starting upload process')
    
    const token = await getToken({ req: request })
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (token.id || token.sub) as string
    console.log('Upload API: User ID:', userId)
    
    // Get user to find their family
    const userResponse = await fetchFromSupabase(`app_users?id=eq.${userId}&select=familyId`)
    const users = userResponse as any[]
    
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const user = users[0]
    if (!user.familyId) {
      return NextResponse.json({ error: 'User not assigned to a family' }, { status: 400 })
    }

    console.log('Upload API: User family ID:', user.familyId)

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('Upload API: File received:', file.name, 'Size:', file.size, 'bytes')

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }

    // Convert file to buffer
    console.log('Upload API: Converting file to buffer')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary with timeout
    const folder = process.env.CLOUDINARY_FOLDER || 'pantree'
    const username = token.username || 'unknown'
    
    console.log('Upload API: Starting Cloudinary upload to folder:', `${folder}/${username}`)
    
    const result = await Promise.race([
      new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: `${folder}/${username}`,
            transformation: [
              { width: 400, height: 400, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Upload API: Cloudinary error:', error)
              reject(error)
            } else {
              console.log('Upload API: Cloudinary upload successful')
              resolve(result)
            }
          }
        ).end(buffer)
      }),
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Upload timeout after 30 seconds'))
        }, 30000) // 30 second timeout
      })
    ])

    console.log('Upload API: Upload completed successfully')
    return NextResponse.json({
      url: (result as any).secure_url,
      publicId: (result as any).public_id
    })
  } catch (error) {
    console.error('Upload API: Upload error:', error)
    
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json({ error: 'Upload timeout. Please try again with a smaller image.' }, { status: 408 })
    }
    
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
