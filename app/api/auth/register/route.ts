import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    // Hash password (must be done server-side, not in Convex mutation)
    const hashedPassword = await bcrypt.hash(password, 12)

    await convex.mutation(api.auth.register, {
      username,
      email,
      hashedPassword,
    })

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    if (error.message?.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
