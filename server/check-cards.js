const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cards = await prisma.card.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      questionType: true,
      questionMediaUrl: true,
      answerType: true,
      answerMediaUrl: true,
      createdAt: true,
    },
  });

  console.log('Recent cards:');
  cards.forEach(card => {
    console.log('\n---');
    console.log(`Card ID: ${card.id}`);
    console.log(`Question Type: ${card.questionType}`);
    console.log(`Question Media URL: ${card.questionMediaUrl || 'none'}`);
    console.log(`Answer Type: ${card.answerType}`);
    console.log(`Answer Media URL: ${card.answerMediaUrl || 'none'}`);
    console.log(`Created: ${card.createdAt}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
