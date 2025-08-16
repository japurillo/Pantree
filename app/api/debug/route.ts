import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    console.log('Debug API - Session:', session)
    console.log('Debug API - User:', session?.user)
    
    return NextResponse.json({
      authenticated: !!session?.user,
      user: session?.user || null,
      session: session || null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Debug API - Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
