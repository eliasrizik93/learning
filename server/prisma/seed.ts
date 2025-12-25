import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function fixMediaUrls() {
  console.log('🔧 Fixing media URLs in database...\n');
  
  // Find all cards with absolute URLs
  const cards = await prisma.card.findMany({
    where: {
      OR: [
        { questionMediaUrl: { contains: 'http://localhost:3000' } },
        { answerMediaUrl: { contains: 'http://localhost:3000' } }
      ]
    },
  });

  console.log(`Found ${cards.length} cards with absolute URLs to fix.\n`);

  let fixed = 0;
  for (const card of cards) {
    const updates: { questionMediaUrl?: string; answerMediaUrl?: string } = {};
    
    if (card.questionMediaUrl && card.questionMediaUrl.includes('http://localhost:3000')) {
      updates.questionMediaUrl = card.questionMediaUrl.replace('http://localhost:3000', '');
      console.log(`Card ${card.id}: Question URL fixed`);
    }
    
    if (card.answerMediaUrl && card.answerMediaUrl.includes('http://localhost:3000')) {
      updates.answerMediaUrl = card.answerMediaUrl.replace('http://localhost:3000', '');
      console.log(`Card ${card.id}: Answer URL fixed`);
    }

    if (Object.keys(updates).length > 0) {
      await prisma.card.update({
        where: { id: card.id },
        data: updates,
      });
      fixed++;
    }
  }

  if (fixed > 0) {
    console.log(`\n✅ Fixed ${fixed} cards! Media URLs are now relative.\n`);
  } else {
    console.log('✅ No cards needed fixing.\n');
  }
}

async function main() {
  // First, fix any broken media URLs
  await fixMediaUrls();

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
