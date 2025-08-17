import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for user operations (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for bypassing RLS (use carefully)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Database types (using Supabase directly)
export type Database = {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          name: string
          adminId: string | null
          settings: any | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          adminId?: string | null
          settings?: any | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          adminId?: string | null
          settings?: any | null
          createdAt?: string
          updatedAt?: string
        }
      }
      users: {
        Row: {
          id: string
          username: string
          email: string
          password: string
          role: 'USER' | 'ADMIN'
          familyId: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          password: string
          role?: 'USER' | 'ADMIN'
          familyId?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          password?: string
          role?: 'USER' | 'ADMIN'
          familyId?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          familyId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          familyId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          familyId?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      items: {
        Row: {
          id: string
          name: string
          description: string | null
          imageUrl: string | null
          quantity: number
          threshold: number
          notes: string | null
          categoryId: string
          createdBy: string
          familyId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          imageUrl?: string | null
          quantity?: number
          threshold?: number
          notes?: string | null
          categoryId: string
          createdBy: string
          familyId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          imageUrl?: string | null
          quantity?: number
          threshold?: number
          notes?: string | null
          categoryId?: string
          createdBy?: string
          familyId?: string
          createdAt?: string
          updatedAt?: string
        }
      }
    }
  }
}
