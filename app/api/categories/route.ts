import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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

// GET /api/categories - List all categories for user's family
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    
    if (!token?.id && !token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (token.id || token.sub) as string
    
    // Get user to find their family from app_users table
    const userResponse = await fetchFromSupabase(`app_users?id=eq.${userId}&select=familyId`)
    const users = userResponse as any[]
    
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const user = users[0]
    if (!user.familyId) {
      return NextResponse.json({ error: 'User not assigned to a family' }, { status: 400 })
    }

    // Only show categories from user's family
    const categoriesResponse = await fetchFromSupabase(`categories?familyId=eq.${user.familyId}&order=name.asc`)
    const categories = categoriesResponse as any[]

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
    
    // Get user to find their family from app_users table
    const userResponse = await fetchFromSupabase(`app_users?id=eq.${userId}&select=familyId`)
    const users = userResponse as any[]
    
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const user = users[0]
    if (!user.familyId) {
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
    const existingCategoryResponse = await fetchFromSupabase(`categories?name=eq.${name}&familyId=eq.${user.familyId}`)
    const existingCategories = existingCategoryResponse as any[]
    
    if (existingCategories && existingCategories.length > 0) {
      return NextResponse.json(
        { error: 'Category already exists in this family' },
        { status: 400 }
      )
    }

    const category = await mutateSupabase('categories', 'POST', {
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      description: (description || '').trim(),
      familyId: user.familyId // Assign category to user's family
    })

    return NextResponse.json(category[0], { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
