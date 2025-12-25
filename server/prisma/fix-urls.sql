-- Fix absolute URLs to relative URLs in Card table
UPDATE "Card"
SET "questionMediaUrl" = REPLACE("questionMediaUrl", 'http://localhost:3000', '')
WHERE "questionMediaUrl" LIKE 'http://localhost:3000%';

UPDATE "Card"
SET "answerMediaUrl" = REPLACE("answerMediaUrl", 'http://localhost:3000', '')
WHERE "answerMediaUrl" LIKE 'http://localhost:3000%';

-- Show the results
SELECT id, "questionMediaUrl", "answerMediaUrl" 
FROM "Card" 
WHERE "questionMediaUrl" IS NOT NULL OR "answerMediaUrl" IS NOT NULL
ORDER BY "createdAt" DESC
LIMIT 10;
