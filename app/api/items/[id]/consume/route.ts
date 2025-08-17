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

// POST /api/items/[id]/consume - Consume an item
export async function POST(
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
    const userResponse = await fetchFromSupabase(`app_users?id=eq.${userId}&select=familyId`)
    const users = userResponse as any[]
    
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const user = users[0]
    if (!user.familyId) {
      return NextResponse.json({ error: 'User not assigned to a family' }, { status: 400 })
    }

    const { amount = 1 } = await request.json()

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    // Get the item to check if it exists and get current quantity
    const itemResponse = await fetchFromSupabase(`items?id=eq.${params.id}&familyId=eq.${user.familyId}&select=*`)
    const items = itemResponse as any[]
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const item = items[0]

    // Check if there's enough quantity to consume
    if (item.quantity < amount) {
      return NextResponse.json(
        { error: `Not enough quantity. Available: ${item.quantity}, Requested: ${amount}` },
        { status: 400 }
      )
    }

    // Update the item quantity
    const newQuantity = Math.max(0, item.quantity - amount)
    const updatedItem = await mutateSupabase(`items?id=eq.${params.id}`, 'PATCH', {
      quantity: newQuantity
    })

    return NextResponse.json(updatedItem[0])
  } catch (error) {
    console.error('Error consuming item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
