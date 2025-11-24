import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a temporary user for development
  const user = await prisma.user.upsert({
    where: { id: 'temp-user-id' },
    update: {},
    create: {
      id: 'temp-user-id',
      email: 'temp@example.com',
      name: 'Temporary User',
    },
  })

  console.log('Created/updated temp user:', user)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
