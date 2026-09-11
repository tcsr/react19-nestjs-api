/**
 * Seed script — populates users, profiles, posts, comments, categories so the
 * relation queries and the React Query pagination/infinite demos have data.
 * Run: `npx prisma db seed` (configured in prisma7.config.ts).
 */

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

// Prisma 7 driver adapter (see src/prisma/prisma.service.ts).
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  // Clean in FK-safe order (children first).
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Categories (for many-many).
  const [tech, life] = await Promise.all([
    prisma.category.create({ data: { name: 'tech' } }),
    prisma.category.create({ data: { name: 'life' } }),
  ]);

  // Users with 1-1 profile and 1-many posts (nested writes in one call).
  for (let u = 1; u <= 3; u++) {
    await prisma.user.create({
      data: {
        email: `user${u}@example.com`,
        name: `User ${u}`,
        profile: { create: { bio: `Bio of user ${u}` } }, // 1-1
        posts: {
          create: Array.from({ length: 8 }, (_, i) => ({
            title: `Post ${u}-${i + 1}`,
            body: `Body for post ${i + 1} by user ${u}.`,
            categories: { connect: [{ id: i % 2 === 0 ? tech.id : life.id }] }, // m-n
            comments: {
              create: [{ text: 'First!' }, { text: 'Nice post' }], // 1-many
            },
          })),
        },
      },
    });
  }

  const counts = {
    users: await prisma.user.count(),
    posts: await prisma.post.count(),
    comments: await prisma.comment.count(),
    categories: await prisma.category.count(),
  };
  console.log('Seeded:', counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
