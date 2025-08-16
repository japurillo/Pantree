import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getToken } from 'next-auth/jwt'

const prisma = new PrismaClient()

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

    await prisma.item.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
