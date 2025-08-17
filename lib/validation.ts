import { z } from 'zod'

// Common validation schemas
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(255, 'Email is too long')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')

export const itemNameSchema = z
  .string()
  .min(1, 'Item name is required')
  .max(100, 'Item name is too long')
  .regex(/^[a-zA-Z0-9\s\-_.,()]+$/, 'Item name contains invalid characters')

export const categoryNameSchema = z
  .string()
  .min(1, 'Category name is required')
  .max(50, 'Category name is too long')
  .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Category name contains invalid characters')

export const quantitySchema = z
  .number()
  .int('Quantity must be a whole number')
  .min(0, 'Quantity cannot be negative')
  .max(999999, 'Quantity is too large')

export const thresholdSchema = z
  .number()
  .int('Threshold must be a whole number')
  .min(1, 'Threshold must be at least 1')
  .max(999999, 'Threshold is too large')

// Sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// Validation helper
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Unknown validation error' }
  }
}

// Rate limiting validation
export function validateRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
  // This is a basic implementation - in production, use Redis or similar
  return true // Placeholder - implement with your rate limiting solution
}

// CSRF protection
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function validateCSRFToken(token: string, expectedToken: string): boolean {
  return token === expectedToken && token.length === 32
}
