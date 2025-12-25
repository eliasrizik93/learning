const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fixing media URLs in database...\n');
  
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
    const updates = {};
    
    if (card.questionMediaUrl && card.questionMediaUrl.includes('http://localhost:3000')) {
      updates.questionMediaUrl = card.questionMediaUrl.replace('http://localhost:3000', '');
      console.log(`Card ${card.id}: ${card.questionMediaUrl} -> ${updates.questionMediaUrl}`);
    }
    
    if (card.answerMediaUrl && card.answerMediaUrl.includes('http://localhost:3000')) {
      updates.answerMediaUrl = card.answerMediaUrl.replace('http://localhost:3000', '');
      console.log(`Card ${card.id}: ${card.answerMediaUrl} -> ${updates.answerMediaUrl}`);
    }

    if (Object.keys(updates).length > 0) {
      await prisma.card.update({
        where: { id: card.id },
        data: updates,
      });
      fixed++;
    }
  }

  console.log(`\n✅ Fixed ${fixed} cards!`);
  console.log('Media URLs are now relative (e.g., /uploads/file.ext)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
