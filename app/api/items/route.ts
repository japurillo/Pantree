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
  console.log('Supabase mutation:', { endpoint, method, data })
  
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
    const errorText = await response.text()
    console.error('Supabase mutation failed:', { status: response.status, statusText: response.statusText, error: errorText })
    throw new Error(`Supabase mutation failed: ${response.status} ${response.statusText} - ${errorText}`)
  }
  
  return response.json()
}

// GET /api/items - List all items
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
      return NextResponse.json({ 
        error: 'User not assigned to a family. Please contact your administrator.' 
      }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let query = `items?familyId=eq.${user.familyId}&select=*,category:categories(name)&order=name.asc`

    if (category && category !== 'all') {
      query = `items?familyId=eq.${user.familyId}&categoryId=eq.${category}&select=*,category:categories(name)&order=name.asc`
    }

    if (search) {
      // For search, we'll use a simpler approach with Supabase
      query = `items?familyId=eq.${user.familyId}&or=(name.ilike.*${search}*,description.ilike.*${search}*)&select=*,category:categories(name)&order=name.asc`
    }

    const itemsResponse = await fetchFromSupabase(query)
    const items = itemsResponse as any[]

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

    // Get user to find their family from app_users table
    const userResponse = await fetchFromSupabase(`app_users?id=eq.${userId}&select=familyId`)
    const users = userResponse as any[]
    
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const user = users[0]
    if (!user.familyId) {
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
    const categoryResponse = await fetchFromSupabase(`categories?id=eq.${categoryId}&familyId=eq.${user.familyId}`)
    const categories = categoryResponse as any[]
    
    if (!categories || categories.length === 0) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Check if item already exists in this family
    const existingItemResponse = await fetchFromSupabase(`items?name=eq.${name}&familyId=eq.${user.familyId}`)
    const existingItems = existingItemResponse as any[]
    
    if (existingItems && existingItems.length > 0) {
      return NextResponse.json({ error: 'Item already exists in this family' }, { status: 400 })
    }

    // Create the item - ensure all required fields are present
    // Generate a simple ID for now (temporary fix until database schema is updated)
    const newItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      description: (description || '').trim(),
      imageUrl: imageUrl || null,
      quantity: parseInt(quantity) || 0,
      threshold: parseInt(threshold) || 1,
      notes: (notes || '').trim(),
      categoryId: categoryId,
      createdBy: userId,
      familyId: user.familyId
    }

    console.log('Creating item with data:', newItem)
    const createdItem = await mutateSupabase('items', 'POST', newItem)

    return NextResponse.json(createdItem[0], { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
