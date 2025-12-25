import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Only run in development
  if (process.env.NODE_ENV === 'production') {
    console.log('Seed script should not run in production');
    return;
  }

  const email = 'admin@admin.com';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    // Update password in case it changed
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log('✅ Admin user password reset!');
    console.log('');
    console.log('📧 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    return;
  }

  // Create admin user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Admin User',
      profile: '',
      birthday: new Date('1990-01-01'),
    },
  });

  // Create a sample group with cards for testing
  const group = await prisma.group.create({
    data: {
      name: 'Sample Flashcards',
      userId: user.id,
      cards: {
        create: [
          {
            questionText: 'What is the capital of France?',
            answerText: 'Paris',
          },
          {
            questionText: 'What is 2 + 2?',
            answerText: '4',
          },
          {
            questionText: 'What programming language is this project built with?',
            answerText: 'TypeScript',
          },
        ],
      },
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('📧 Login credentials:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log('');
  console.log(`📁 Created group: "${group.name}" with 3 sample cards`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
