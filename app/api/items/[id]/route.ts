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

// Helper function for Supabase mutations
async function mutateSupabase(endpoint: string, method: string, data?: any) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    method,
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: data ? JSON.stringify(data) : undefined
  })
  
  if (!response.ok) {
    throw new Error(`Supabase mutation failed: ${response.statusText}`)
  }
  
  return response.json()
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Helper function to extract public ID from Cloudinary URL
function extractPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) {
    return null
  }
  
  try {
    const urlParts = url.split('/')
    const uploadIndex = urlParts.findIndex(part => part === 'upload')
    if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
      return null
    }
    
    const publicIdParts = urlParts.slice(uploadIndex + 2)
    const publicId = publicIdParts.join('/').split('.')[0] // Remove file extension
    
    return publicId
  } catch (error) {
    console.error('Error extracting public ID:', error)
    return null
  }
}

// GET /api/items/[id] - Get specific item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request })
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (token.id || token.sub) as string
    
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

    // Get the item with category information
    const itemResponse = await fetchFromSupabase(`items?id=eq.${params.id}&familyId=eq.${user.familyId}&select=*,category:categories(name)`)
    const items = itemResponse as any[]
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(items[0])
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/items/[id] - Update item
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request })
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (token.id || token.sub) as string
    
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

    const { quantity, threshold, notes } = await request.json()

    // Verify the item exists and belongs to user's family
    const existingItemResponse = await fetchFromSupabase(`items?id=eq.${params.id}&familyId=eq.${user.familyId}`)
    const existingItems = existingItemResponse as any[]
    
    if (!existingItems || existingItems.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Update the item
    const updatedItem = await mutateSupabase(`items?id=eq.${params.id}`, 'PATCH', {
      quantity: quantity || 0,
      threshold: threshold || 1,
      notes: notes || ''
    })

    return NextResponse.json(updatedItem[0])
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/items/[id] - Delete item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request })
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (token.id || token.sub) as string
    
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

    // Get the item to check if it exists and get image URL
    const itemResponse = await fetchFromSupabase(`items?id=eq.${params.id}&familyId=eq.${user.familyId}&select=*`)
    const items = itemResponse as any[]
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const item = items[0]

    // Delete image from Cloudinary if it exists
    if (item.imageUrl) {
      try {
        const publicId = extractPublicIdFromUrl(item.imageUrl)
        if (publicId) {
          console.log(`Deleting image from Cloudinary: ${publicId}`)
          await cloudinary.uploader.destroy(publicId)
          console.log(`Successfully deleted image: ${publicId}`)
        } else {
          console.warn(`Could not extract public ID from URL: ${item.imageUrl}`)
        }
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError)
        // Don't fail the entire operation if image deletion fails
      }
    }

    // Delete the item
    await mutateSupabase(`items?id=eq.${params.id}`, 'DELETE')

    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
