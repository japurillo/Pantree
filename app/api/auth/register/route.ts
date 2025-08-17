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

    console.log('Starting registration for:', username, email)

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
    console.log('Password hashed successfully')

    // Generate a unique family ID
    const familyId = `family-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.log('Generated family ID:', familyId)

    // Create new user as admin in app_users table (without familyId initially)
    console.log('Creating user...')
    const newUser = await mutateSupabase('app_users', 'POST', {
      username: username.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: 'ADMIN'
      // Don't set familyId yet
    })
    console.log('User created successfully:', newUser[0].id)

    // Create new family for this user
    console.log('Creating family...')
    const newFamily = await mutateSupabase('families', 'POST', {
      id: familyId,
      name: `${username}'s Family`,
      adminId: newUser[0].id
    })
    console.log('Family created successfully:', newFamily[0].id)

    // Update user with familyId
    console.log('Updating user with familyId...')
    await mutateSupabase(`app_users?id=eq.${newUser[0].id}`, 'PATCH', {
      familyId: familyId
    })
    console.log('User updated with familyId successfully')

    // Create default categories for the new family
    console.log('Creating default categories...')
    const defaultCategories = [
      { id: `cat-${Date.now()}-1`, name: 'Pantry', description: 'Dry goods and non-perishables', familyId: familyId },
      { id: `cat-${Date.now()}-2`, name: 'Refrigerator', description: 'Cold items and leftovers', familyId: familyId },
      { id: `cat-${Date.now()}-3`, name: 'Freezer', description: 'Frozen foods', familyId: familyId },
      { id: `cat-${Date.now()}-4`, name: 'Spices', description: 'Herbs and seasonings', familyId: familyId }
    ]

    for (const category of defaultCategories) {
      console.log('Creating category:', category.name, 'with ID:', category.id)
      await mutateSupabase('categories', 'POST', {
        id: category.id,
        name: category.name,
        description: category.description,
        familyId: category.familyId
      })
      console.log('Category created:', category.name)
    }

    // Get the spices category to add a sample item
    console.log('Getting spices category...')
    const spicesCategoryResponse = await fetchFromSupabase(`categories?name=eq.Spices&familyId=eq.${familyId}`)
    const spicesCategories = spicesCategoryResponse as any[]
    
    if (spicesCategories && spicesCategories.length > 0) {
      const category = spicesCategories[0]
      console.log('Found spices category, creating sample item...')
      
      // Add a sample item
      await mutateSupabase('items', 'POST', {
        id: `item-${Date.now()}-sample`,
        name: 'Black Pepper',
        description: 'Ground black pepper for seasoning',
        quantity: 1,
        threshold: 1,
        categoryId: category.id,
        createdBy: newUser[0].id,
        familyId: familyId
      })
      console.log('Sample item created successfully')
    }

    console.log('Registration completed successfully')
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
