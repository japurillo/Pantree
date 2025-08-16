import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { getToken } from 'next-auth/jwt'

const prisma = new PrismaClient()

// GET /api/users - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Use getToken directly since getServerSession isn't working properly
    const token = await getToken({ req: request })
    
    if (!token?.id || token.role !== 'ADMIN') {
      console.log('Users API GET - Unauthorized access attempt:', { 
        hasToken: !!token, 
        userId: token?.id, 
        userRole: token?.role 
      })
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    console.log('Users API GET - Authorized access for user:', token.username, 'Role:', token.role)

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    // Use getToken directly since getServerSession isn't working properly
    const token = await getToken({ req: request })
    
    if (!token?.id || token.role !== 'ADMIN') {
      console.log('Users API POST - Unauthorized access attempt:', { 
        hasToken: !!token, 
        userId: token?.id, 
        userRole: token?.role 
      })
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    console.log('Users API POST - Authorized access for user:', token.username, 'Role:', token.role)

    const { username, email, password, role = 'USER' } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    let userData: any = {
      username,
      email,
      password: hashedPassword,
      role: role as 'USER' | 'ADMIN',
    }

    let newFamily: any = null

    // If creating a new admin, create a new family
    if (role === 'ADMIN') {
      console.log('Creating new family for admin user:', username)
      
      // Create new family
      newFamily = await prisma.family.create({
        data: {
          name: `${username}'s Family`,
          settings: {
            defaultThreshold: 1,
            notifications: true,
            theme: 'light'
          }
        }
      })

      // Create default categories for the new family
      const defaultCategories = [
        { name: 'Pantry', description: 'Dry goods and staples' },
        { name: 'Refrigerator', description: 'Cold storage items' },
        { name: 'Freezer', description: 'Frozen foods' },
        { name: 'Spices', description: 'Herbs and seasonings' },
        { name: 'Beverages', description: 'Drinks and liquids' }
      ]

      for (const category of defaultCategories) {
        await prisma.category.create({
          data: {
            ...category,
            familyId: newFamily.id
          }
        })
      }

      // Create sample items for the new family
      const sampleItems = [
        {
          name: 'Rice',
          description: 'Long grain white rice',
          quantity: 5,
          threshold: 2,
          notes: 'Store in airtight container',
          categoryName: 'Pantry'
        },
        {
          name: 'Milk',
          description: 'Whole milk',
          quantity: 2,
          threshold: 1,
          notes: 'Check expiration date',
          categoryName: 'Refrigerator'
        },
        {
          name: 'Chicken Breast',
          description: 'Boneless skinless chicken breast',
          quantity: 3,
          threshold: 2,
          notes: 'Freeze if not using within 2 days',
          categoryName: 'Freezer'
        }
      ]

      for (const item of sampleItems) {
        const category = await prisma.category.findFirst({
          where: {
            name: item.categoryName,
            familyId: newFamily.id
          }
        })

        if (category) {
          await prisma.item.create({
            data: {
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              threshold: item.threshold,
              notes: item.notes,
              categoryId: category.id,
              createdBy: token.id as string, // The creating admin
              familyId: newFamily.id
            }
          })
        }
      }

      // Set the new family as the admin's family
      userData.familyId = newFamily.id

      console.log('✅ New family created with sample items for admin:', username)
    } else {
      // Regular user gets assigned to the creating admin's family
      userData.familyId = token.familyId
    }

    // Create user
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        familyId: true,
        createdAt: true,
      }
    })

    // If this is a new admin user, update the family with the correct admin ID
    if (role === 'ADMIN') {
      await prisma.family.update({
        where: { id: newFamily.id },
        data: { adminId: user.id } // Use the new admin's ID, not the creating admin's ID
      })
      console.log('✅ Family admin updated with new admin ID:', user.id)
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
