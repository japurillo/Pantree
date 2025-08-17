import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists in app_users table
    const existingUserResponse = await fetchFromSupabase(`app_users?or=(username.eq.${username},email.eq.${email})`)
    const existingUsers = existingUserResponse as any[]
    
    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new family for this user
    const newFamily = await mutateSupabase('families', 'POST', {
      name: `${username}'s Family`
      // Don't set adminId initially - will be updated after user creation
    })

    // Create new user as admin in app_users table
    const newUser = await mutateSupabase('app_users', 'POST', {
      username: username.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: 'ADMIN',
      familyId: newFamily[0].id
    })

    // Update family with admin ID
    await mutateSupabase(`families?id=eq.${newFamily[0].id}`, 'PATCH', {
      adminId: newUser[0].id
    })

    // Create default categories for the new family
    const defaultCategories = [
      { name: 'Pantry', description: 'Dry goods and non-perishables', familyId: newFamily[0].id },
      { name: 'Refrigerator', description: 'Cold items and leftovers', familyId: newFamily[0].id },
      { name: 'Freezer', description: 'Frozen foods', familyId: newFamily[0].id },
      { name: 'Spices', description: 'Herbs and seasonings', familyId: newFamily[0].id }
    ]

    for (const category of defaultCategories) {
      await mutateSupabase('categories', 'POST', {
        name: category.name,
        description: category.description,
        familyId: category.familyId
      })
    }

    // Get the spices category to add a sample item
    const spicesCategoryResponse = await fetchFromSupabase(`categories?name=eq.Spices&familyId=eq.${newFamily[0].id}`)
    const spicesCategories = spicesCategoryResponse as any[]
    
    if (spicesCategories && spicesCategories.length > 0) {
      const category = spicesCategories[0]
      
      // Add a sample item
      await mutateSupabase('items', 'POST', {
        name: 'Black Pepper',
        description: 'Ground black pepper for seasoning',
        quantity: 1,
        threshold: 1,
        categoryId: category.id,
        createdBy: newUser[0].id,
        familyId: newFamily[0].id
      })
    }

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
