import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// POST /api/auth/register - Allow new users to register themselves
export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
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

    // Create new user (default role is USER)
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'USER',
      }
    })

    // Create a new family for this user
    const newFamily = await prisma.family.create({
      data: {
        name: `${username}'s Family`,
        adminId: newUser.id
      }
    })
    
    // Update the user to be the admin of their own family
    await prisma.user.update({
      where: { id: newUser.id },
      data: { 
        familyId: newFamily.id,
        role: 'ADMIN'
      }
    })

    // Create default categories for the new family
    const defaultCategories = [
      { name: 'Pantry', description: 'Dry goods and non-perishable items' },
      { name: 'Refrigerator', description: 'Items that need to be kept cold' },
      { name: 'Freezer', description: 'Frozen items' },
      { name: 'Spices', description: 'Herbs, spices, and seasonings' },
      { name: 'Beverages', description: 'Drinks and liquid items' }
    ]

    for (const category of defaultCategories) {
      await prisma.category.create({
        data: {
          name: category.name,
          description: category.description,
          familyId: newFamily.id
        }
      })
    }

    // Create sample items for the new family
    const sampleItems = [
      { name: 'Chicken Breast', description: 'Fresh chicken breast', categoryName: 'Refrigerator' },
      { name: 'Milk', description: 'Fresh milk', categoryName: 'Refrigerator' },
      { name: 'Rice', description: 'Long grain white rice', categoryName: 'Pantry' }
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
            quantity: 0,
            threshold: 1,
            categoryId: category.id,
            familyId: newFamily.id,
            createdBy: newUser.id
          }
        })
      }
    }

    // Return success (without password)
    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
