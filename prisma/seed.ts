import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const categories = [
  { name: 'Pantry', description: 'Dry goods and staples' },
  { name: 'Refrigerator', description: 'Cold storage items' },
  { name: 'Freezer', description: 'Frozen foods' },
  { name: 'Spices', description: 'Herbs and seasonings' },
  { name: 'Beverages', description: 'Drinks and liquids' }
]

const items = [
  {
    name: 'Rice',
    description: 'Long grain white rice',
    quantity: 5,
    threshold: 2,
    notes: 'Store in airtight container',
    categoryName: 'Pantry'
  },
  {
    name: 'Milk',
    description: 'Whole milk',
    quantity: 2,
    threshold: 1,
    notes: 'Check expiration date',
    categoryName: 'Refrigerator'
  },
  {
    name: 'Chicken Breast',
    description: 'Boneless skinless chicken breast',
    quantity: 3,
    threshold: 2,
    notes: 'Freeze if not using within 2 days',
    categoryName: 'Freezer'
  }
]

async function main() {
  console.log('🌱 Starting database seed...')

  try {
    // Create default family first (without admin initially)
    console.log('👨‍👩‍👧‍👦 Creating default family...')
    const family = await prisma.family.create({
      data: {
        name: 'Default Family',
        settings: {
          defaultThreshold: 1,
          notifications: true,
          theme: 'light'
        }
      }
    })
    console.log('✅ Family created:', family.name)

    // Create default admin user if it doesn't exist
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('👤 Creating default admin user...')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      adminUser = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@pantree.com',
          password: hashedPassword,
          role: 'ADMIN',
          familyId: family.id // Assign user to family
        }
      })
      console.log('✅ Admin user created:', adminUser.username)
    } else {
      // Update existing admin user to belong to family
      if (!adminUser.familyId) {
        console.log('🔗 Assigning existing admin to family...')
        await prisma.user.update({
          where: { id: adminUser.id },
          data: { familyId: family.id }
        })
      }
    }

    // Update family with correct admin ID
    if (family.adminId !== adminUser.id) {
      console.log('🔗 Updating family admin...')
      await prisma.family.update({
        where: { id: family.id },
        data: { adminId: adminUser.id }
      })
    }

    // Create categories for the family
    console.log('📦 Creating categories...')
    for (const category of categories) {
      await prisma.category.upsert({
        where: {
          name_familyId: {
            name: category.name,
            familyId: family.id
          }
        },
        update: {},
        create: {
          name: category.name,
          description: category.description,
          familyId: family.id
        }
      })
    }
    console.log('✅ Categories created')

    // Create items for the family
    console.log('📦 Creating sample items...')
    for (const item of items) {
      const category = await prisma.category.findFirst({
        where: {
          name: item.categoryName,
          familyId: family.id
        }
      })

      if (category) {
        await prisma.item.upsert({
          where: {
            id: `seed-${item.name.toLowerCase().replace(/\s+/g, '-')}`
          },
          update: {},
          create: {
            id: `seed-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            threshold: item.threshold,
            notes: item.notes,
            categoryId: category.id,
            createdBy: adminUser.id,
            familyId: family.id
          }
        })
      }
    }
    console.log('✅ Sample items created')

    console.log('🎉 Database seeding completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Admin: ${adminUser.username}`)
    console.log(`   - Family: ${family.name}`)
    console.log(`   - Categories: ${categories.length}`)
    console.log(`   - Items: ${items.length}`)

  } catch (error) {
    console.error('❌ Error during seeding:', error)
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
