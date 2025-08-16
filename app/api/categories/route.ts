import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getToken } from 'next-auth/jwt'

const prisma = new PrismaClient()

// GET /api/categories - List all categories for user's family
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

    if (!user?.familyId) {
      return NextResponse.json({ error: 'User not assigned to a family' }, { status: 400 })
    }

    // Only show categories from user's family
    const categories = await prisma.category.findMany({
      where: { familyId: user.familyId },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/categories - Create new category (admin only)
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    
    if (!token?.id || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    const userId = (token.id || token.sub) as string
    
    // Get user to find their family
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { family: true }
    })

    if (!user?.familyId) {
      return NextResponse.json({ error: 'User not assigned to a family' }, { status: 400 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Check if category already exists in this family
    const existingCategory = await prisma.category.findFirst({
      where: { 
        name,
        familyId: user.familyId
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category already exists in this family' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        familyId: user.familyId // Assign category to user's family
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
