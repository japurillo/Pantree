import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getToken } from 'next-auth/jwt'

const prisma = new PrismaClient()

// POST /api/items/[id]/consume - Consume item (reduce quantity)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request })
    
    if (!token?.id && !token?.sub) {
      console.log('Consume API - Unauthorized: No token or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (token.id || token.sub) as string
    console.log('Consume API - User ID:', userId)
    
    // Get user to find their family
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { family: true }
    })

    if (!user?.familyId || !user?.family) {
      console.log('Consume API - User not assigned to a family')
      return NextResponse.json({ 
        error: 'User not assigned to a family. Please contact your administrator.' 
      }, { status: 400 })
    }

    const { amount = 1 } = await request.json()

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    const item = await prisma.item.findUnique({
      where: { id: params.id }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check if item belongs to user's family
    if (item.familyId !== user.familyId) {
      console.log('Consume API - Item not in user family')
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    if (item.quantity < amount) {
      return NextResponse.json(
        { error: 'Not enough quantity available' },
        { status: 400 }
      )
    }

    const newQuantity = Math.max(0, item.quantity - amount)
    const isOutOfStock = newQuantity === 0

    console.log('Consume API - Consuming item:', params.id, 'Amount:', amount, 'New quantity:', newQuantity)

    const updatedItem = await prisma.item.update({
      where: { id: params.id },
      data: {
        quantity: newQuantity,
      },
      include: { category: true }
    })

    console.log('Consume API - Item consumed successfully')

    return NextResponse.json({
      ...updatedItem,
      isOutOfStock,
      consumedAmount: amount
    })
  } catch (error) {
    console.error('Error consuming item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
