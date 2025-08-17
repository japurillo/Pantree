import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import bcrypt from 'bcryptjs'

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
    const errorText = await response.text()
    throw new Error(`Supabase mutation failed: ${response.status} ${response.statusText} - ${errorText}`)
  }
  
  return response.json()
}

// GET /api/users - List all users in the family (admin only)
export async function GET(request: NextRequest) {
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

    // Get all users in the same family from app_users table
    const familyUsersResponse = await fetchFromSupabase(`app_users?familyId=eq.${user.familyId}&select=id,username,email,role,createdAt&order=username.asc`)
    const familyUsers = familyUsersResponse as any[]

    return NextResponse.json(familyUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/users - Create a new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    
    if (!token?.id || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    const adminUserId = (token.id || token.sub) as string
    
    // Get admin user to find their family from app_users table
    const adminResponse = await fetchFromSupabase(`app_users?id=eq.${adminUserId}&select=familyId`)
    const adminUsers = adminResponse as any[]
    
    if (!adminUsers || adminUsers.length === 0) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
    }
    
    const adminUser = adminUsers[0]
    if (!adminUser.familyId) {
      return NextResponse.json({ error: 'Admin user not assigned to a family' }, { status: 400 })
    }

    // Parse request body
    const body = await request.json()
    const { username, email, password, role = 'USER' } = body

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json({ 
        error: 'Missing required fields: username, email, and password are required' 
      }, { status: 400 })
    }

    // Check if username already exists in app_users table
    const existingUsernameResponse = await fetchFromSupabase(`app_users?username=eq.${username}`)
    const existingUsername = existingUsernameResponse as any[]
    
    if (existingUsername && existingUsername.length > 0) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
    }

    // Check if email already exists in app_users table
    const existingEmailResponse = await fetchFromSupabase(`app_users?email=eq.${email}`)
    const existingEmail = existingEmailResponse as any[]
    
    if (existingEmail && existingEmail.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create new user in app_users table
    const newUser = {
      username,
      email,
      password: hashedPassword,
      role: role.toUpperCase(),
      familyId: adminUser.familyId
    }

    console.log('Creating user with data:', { ...newUser, password: '[REDACTED]' })

    const createdUser = await mutateSupabase('app_users', 'POST', newUser)
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = createdUser[0]
    
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
