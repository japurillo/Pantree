import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getToken } from 'next-auth/jwt'

const prisma = new PrismaClient()

// GET /api/items - List all items
export async function GET(request: NextRequest) {
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.familyId || !user.family) {
      return NextResponse.json({ 
        error: 'User not assigned to a family. Please contact your administrator.' 
      }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: any = {
      familyId: user.familyId // Only show items from user's family
    }

    if (category && category !== 'all') {
      where.categoryId = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/items - Create new item
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    
    if (!token?.id && !token?.sub) {
      console.log('Items API - Unauthorized: No token or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (token.id || token.sub) as string
    console.log('Items API - Authorized access for user ID:', userId)

    // Get user to find their family
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { family: true }
    })

    if (!user?.familyId) {
      console.log('Items API - User not assigned to a family')
      return NextResponse.json({ error: 'User not assigned to a family' }, { status: 400 })
    }

    const { name, description, imageUrl, quantity, threshold, notes, categoryId } = await request.json()

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      )
    }

    // Verify the category exists and belongs to user's family
    const category = await prisma.category.findUnique({
      where: { 
        id: categoryId,
        familyId: user.familyId // Ensure category belongs to user's family
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found or not accessible' },
        { status: 400 }
      )
    }

    console.log('Items API - Creating item with user ID:', userId, 'Family ID:', user.familyId)

    const item = await prisma.item.create({
      data: {
        name,
        description,
        imageUrl,
        quantity: quantity || 0,
        threshold: threshold || 1,
        notes,
        categoryId,
        createdBy: userId,
        familyId: user.familyId // Assign item to user's family
      },
      include: {
        category: true,
      }
    })

    console.log('Items API - Item created successfully:', item.id)
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
