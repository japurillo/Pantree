import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { getToken } from 'next-auth/jwt'

const prisma = new PrismaClient()

// PATCH /api/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use getToken directly since getServerSession isn't working properly
    const token = await getToken({ req: request })
    
    if (!token?.id || token.role !== 'ADMIN') {
      console.log('Users API PATCH - Unauthorized access attempt:', { 
        hasToken: !!token, 
        userId: token?.id, 
        userRole: token?.role 
      })
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    console.log('Users API PATCH - Authorized access for user:', token.username, 'Role:', token.role)

    const { username, email, role, password } = await request.json()
    const userId = params.id

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if username/email already exists (excluding current user)
    if (username || email) {
      const duplicateUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : [])
          ],
          NOT: { id: userId }
        }
      })

      if (duplicateUser) {
        return NextResponse.json(
          { error: 'Username or email already exists' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (username) updateData.username = username
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use getToken directly since getServerSession isn't working properly
    const token = await getToken({ req: request })
    
    if (!token?.id || token.role !== 'ADMIN') {
      console.log('Users API DELETE - Unauthorized access attempt:', { 
        hasToken: !!token, 
        userId: token?.id, 
        userRole: token?.role 
      })
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    console.log('Users API DELETE - Authorized access for user:', token.username, 'Role:', token.role)

    const userId = params.id

    // Prevent admin from deleting themselves
    if (token.id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
