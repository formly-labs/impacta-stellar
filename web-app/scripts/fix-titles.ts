/**
 * One-time script to clean up old form titles.
 * Run with:  npx tsx scripts/fix-titles.ts
 *
 * It removes the "Encuesta: " prefix from titles that still have it,
 * leaving just the descriptive part (e.g. "Experiencia de producto").
 */

import { prisma } from '../lib/db';

async function main() {
  const forms = await prisma.form.findMany({
    where: { title: { startsWith: 'Encuesta: ' } },
    select: { id: true, title: true },
  });

  console.log(`Found ${forms.length} forms to update.\n`);

  for (const form of forms) {
    const newTitle = form.title.replace(/^Encuesta:\s*/, '');
    await prisma.form.update({
      where: { id: form.id },
      data: { title: newTitle },
    });
    console.log(`  ✓ "${form.title}" → "${newTitle}"`);
  }

  console.log('\nDone!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
