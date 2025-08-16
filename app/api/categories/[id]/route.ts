import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getToken } from 'next-auth/jwt'

const prisma = new PrismaClient()

// PATCH /api/categories/[id] - Update category
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

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Check if category exists and belongs to user's family
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (existingCategory.familyId !== user.familyId) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if new name conflicts with existing categories in the same family
    if (name !== existingCategory.name) {
      const conflictingCategory = await prisma.category.findFirst({
        where: { 
          name,
          familyId: user.familyId,
          id: { not: params.id }
        }
      })

      if (conflictingCategory) {
        return NextResponse.json(
          { error: 'A category with this name already exists in your family' },
          { status: 400 }
        )
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: params.id },
      data: { name, description }
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/categories/[id] - Delete category
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

    // Check if category exists and belongs to user's family
    const category = await prisma.category.findUnique({
      where: { id: params.id }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (category.familyId !== user.familyId) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if category has items (we might want to prevent deletion if it does)
    const itemsInCategory = await prisma.item.count({
      where: { categoryId: params.id }
    })

    if (itemsInCategory > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that contains items. Please reassign or delete the items first.' },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
