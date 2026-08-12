import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testUpdateId() {
  try {
    const user = await prisma.user.findFirst();
    if (user) {
      console.log('Original ID:', user.id);
      // We won't actually change it permanently, we'll wrap in transaction and rollback
      await prisma.$transaction(async (tx) => {
        const updated = await tx.user.update({
          where: { id: user.id },
          data: { id: 'new-id-test-123' }
        });
        console.log('Updated ID:', updated.id);
        throw new Error('Rollback');
      });
    }
  } catch (error: any) {
    if (error.message === 'Rollback') {
      console.log('Successfully updated ID and rolled back.');
    } else {
      console.error('Failed to update ID:', error);
    }
  }
}

testUpdateId().finally(() => prisma.$disconnect());
