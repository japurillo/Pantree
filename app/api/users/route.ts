import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import bcrypt from 'bcryptjs'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// POST /api/users - Create a new user (admin only, needs bcrypt)
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })

    if (!token?.id || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    const adminUserId = (token.id || token.sub) as string

    // Parse request body
    const body = await request.json()
    const { username, email, password, role = 'USER' } = body

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json({
        error: 'Missing required fields: username, email, and password are required'
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({
        error: 'Password must be at least 6 characters long'
      }, { status: 400 })
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user via Convex
    const newUser = await convex.mutation(api.users.createUser, {
      adminUserId: adminUserId as Id<"users">,
      username,
      email,
      hashedPassword,
      role: role.toUpperCase() as "USER" | "ADMIN",
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
