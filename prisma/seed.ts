/**
 * Seed script — populates the posts table so the React Query pagination/infinite
 * demos have data. Run: `npx prisma db seed` (configured in prisma7.config.ts).
 */

import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.post.deleteMany(); // reset for a clean seed

  const posts = Array.from({ length: 25 }, (_, i) => ({
    title: `Seed post ${i + 1}`,
    body: `Body text for post number ${i + 1}.`,
    userId: (i % 3) + 1,
  }));

  await prisma.post.createMany({ data: posts });
  console.log(`Seeded ${posts.length} posts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
