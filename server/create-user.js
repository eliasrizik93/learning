const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createUser() {
  const email = 'test@test.com';
  const password = 'test1234';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Test User',
        profile: '',
        birthday: new Date('1990-01-01'),
      },
    });

    console.log('✅ User created successfully!');
    console.log('');
    console.log('📧 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   User ID: ${user.id}`);
  } catch (error) {
    console.error('Error creating user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
