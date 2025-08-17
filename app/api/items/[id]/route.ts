import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getToken } from 'next-auth/jwt'
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Helper function to extract public ID from Cloudinary URL
function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Cloudinary URLs have the format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
    const urlParts = url.split('/')
    const uploadIndex = urlParts.findIndex(part => part === 'upload')
    
    if (uploadIndex === -1 || uploadIndex + 1 >= urlParts.length) {
      return null
    }
    
    // Skip the version number (v1234567890) and get the rest
    const publicIdParts = urlParts.slice(uploadIndex + 2)
    
    // Remove the file extension
    const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, '')
    
    return publicId
  } catch (error) {
    console.error('Error extracting public ID from URL:', error)
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { family: true }
    })

    if (!user?.familyId || !user?.family) {
      return NextResponse.json({ 
        error: 'User not assigned to a family. Please contact your administrator.' 
      }, { status: 400 })
    }

    const item = await prisma.item.findUnique({
      where: { id: params.id },
      include: { category: true }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check if item belongs to user's family
    if (item.familyId !== user.familyId) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(item)
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { family: true }
    })

    if (!user?.familyId || !user?.family) {
      return NextResponse.json({ 
        error: 'User not assigned to a family. Please contact your administrator.' 
      }, { status: 400 })
    }

    const item = await prisma.item.findUnique({
      where: { id: params.id }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check if item belongs to user's family
    if (item.familyId !== user.familyId) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const updates = await request.json()
    
    const updatedItem = await prisma.item.update({
      where: { id: params.id },
      data: updates,
      include: { category: true }
    })

    return NextResponse.json(updatedItem)
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { family: true }
    })

    if (!user?.familyId || !user?.family) {
      return NextResponse.json({ 
        error: 'User not assigned to a family. Please contact your administrator.' 
      }, { status: 400 })
    }

    const item = await prisma.item.findUnique({
      where: { id: params.id }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check if item belongs to user's family
    if (item.familyId !== user.familyId) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

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
        // The item will still be deleted from the database
      }
    }

    // Delete the item from the database
    await prisma.item.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
