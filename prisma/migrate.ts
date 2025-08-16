import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting database migration...')

  try {
    // Create default family for existing data
    console.log('👨‍👩‍👧‍👦 Creating default family...')
    
    // Find the first admin user (or create one if none exists)
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('⚠️ No admin user found, creating default admin...')
      adminUser = await prisma.user.create({
        data: {
          username: 'default_admin',
          email: 'admin@default.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.i8mK', // 'password123'
          role: 'ADMIN'
        }
      })
    }

    // Create default family
    const defaultFamily = await prisma.family.create({
      data: {
        name: `${adminUser.username}'s Family`,
        adminId: adminUser.id,
        settings: {
          defaultThreshold: 1,
          notifications: true,
          theme: 'light'
        }
      }
    })

    console.log('✅ Default family created:', defaultFamily.name)

    // Update existing users to belong to default family
    console.log('👥 Updating existing users...')
    await prisma.user.updateMany({
      where: { familyId: null },
      data: { familyId: defaultFamily.id }
    })

    // Create default categories for the family
    console.log('📂 Creating default categories...')
    const defaultCategories = [
      { name: 'Pantry', description: 'Dry goods and staples' },
      { name: 'Refrigerator', description: 'Cold storage items' },
      { name: 'Freezer', description: 'Frozen foods' },
      { name: 'Spices', description: 'Herbs and seasonings' },
      { name: 'Beverages', description: 'Drinks and liquids' }
    ]

    for (const category of defaultCategories) {
      await prisma.category.create({
        data: {
          ...category,
          familyId: defaultFamily.id
        }
      })
    }

    // Update existing categories to belong to default family
    console.log('🔄 Updating existing categories...')
    await prisma.category.updateMany({
      where: { familyId: null },
      data: { familyId: defaultFamily.id }
    })

    // Update existing items to belong to default family
    console.log('📦 Updating existing items...')
    await prisma.item.updateMany({
      where: { familyId: null },
      data: { familyId: defaultFamily.id }
    })

    console.log('✅ Migration completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Default family: ${defaultFamily.name}`)
    console.log(`   - Admin: ${adminUser.username}`)
    console.log(`   - Categories: ${defaultCategories.length} created`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
