import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('NextAuth - Authorize called with:', credentials?.username)
        
        if (!credentials?.username || !credentials?.password) {
          console.log('NextAuth - Missing credentials')
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username
          }
        })

        if (!user) {
          console.log('NextAuth - User not found:', credentials.username)
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          console.log('NextAuth - Invalid password for user:', credentials.username)
          return null
        }

        console.log('NextAuth - User authenticated successfully:', user.username, 'Role:', user.role)
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('NextAuth - JWT callback - Full token:', token)
      console.log('NextAuth - JWT callback - User:', user)
      
      if (user) {
        token.id = user.id
        token.role = user.role
        token.username = user.username
        console.log('NextAuth - JWT callback - Updated token:', token)
      }
      return token
    },
    async session({ session, token }) {
      console.log('NextAuth - Session callback - Full token:', token)
      console.log('NextAuth - Session callback - Initial session:', session)
      
      // Ensure we have a user object
      if (!session.user) {
        session.user = {} as any
      }
      
      // Set all the custom fields with proper type assertions
      session.user.id = (token.id || token.sub) as string
      session.user.role = token.role as string
      session.user.username = token.username as string
      session.user.email = token.email as string
      
      console.log('NextAuth - Final session after setting fields:', session)
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
})

export { handler as GET, handler as POST }
