import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a temporary user for development/testing
  // In production, users are created via OAuth in the auth callback
  const user = await prisma.user.upsert({
    where: { id: 'temp-user-id' },
    update: {},
    create: {
      id: 'temp-user-id',
      email: 'dev@example.com',
      name: 'Development User',
    },
  });

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
