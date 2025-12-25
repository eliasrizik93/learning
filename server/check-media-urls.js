const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking media URLs in database...\n');
  
  const cards = await prisma.card.findMany({
    where: {
      OR: [
        { questionMediaUrl: { not: null } },
        { answerMediaUrl: { not: null } }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      questionType: true,
      questionMediaUrl: true,
      answerType: true,
      answerMediaUrl: true,
      createdAt: true,
    },
  });

  if (cards.length === 0) {
    console.log('No cards with media found.');
    return;
  }

  console.log(`Found ${cards.length} cards with media:\n`);
  
  cards.forEach((card, idx) => {
    console.log(`${idx + 1}. Card ID: ${card.id}`);
    if (card.questionMediaUrl) {
      console.log(`   Question (${card.questionType}): ${card.questionMediaUrl}`);
    }
    if (card.answerMediaUrl) {
      console.log(`   Answer (${card.answerType}): ${card.answerMediaUrl}`);
    }
    console.log(`   Created: ${card.createdAt.toISOString()}`);
    console.log('');
  });

  // Check for absolute vs relative URLs
  const absoluteUrls = cards.filter(c => 
    (c.questionMediaUrl && c.questionMediaUrl.startsWith('http')) ||
    (c.answerMediaUrl && c.answerMediaUrl.startsWith('http'))
  );
  
  const relativeUrls = cards.filter(c => 
    (c.questionMediaUrl && c.questionMediaUrl.startsWith('/')) ||
    (c.answerMediaUrl && c.answerMediaUrl.startsWith('/'))
  );

  console.log('\n=== Summary ===');
  console.log(`Cards with absolute URLs (http://...): ${absoluteUrls.length}`);
  console.log(`Cards with relative URLs (/uploads/...): ${relativeUrls.length}`);
  
  if (absoluteUrls.length > 0) {
    console.log('\n⚠️  WARNING: Found cards with absolute URLs.');
    console.log('These need to be updated to relative URLs for the frontend to work.');
    console.log('Card IDs with absolute URLs:', absoluteUrls.map(c => c.id).join(', '));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
