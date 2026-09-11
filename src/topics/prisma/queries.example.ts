/**
 * PRISMA — client queries (reference; mirrors real usage in posts.service.ts)
 * -------------------------------------------------------------------------
 * Prisma Client is a type-safe query builder generated from schema.prisma.
 * Every model gets CRUD methods with fully-typed args and results.
 *
 * This file documents the common patterns. The wired versions run in
 * src/posts/posts.service.ts.
 */

/* --- CRUD ---
prisma.post.create({ data: { title, body, userId } });
prisma.post.findUnique({ where: { id } });
prisma.post.findMany();
prisma.post.update({ where: { id }, data: { title } });
prisma.post.delete({ where: { id } });
prisma.post.upsert({ where: { id }, create: {...}, update: {...} });
*/

/* --- filtering / operators ---
prisma.post.findMany({
  where: {
    userId: 1,
    title: { contains: 'seed', mode: 'insensitive' },
    OR: [{ userId: 1 }, { userId: 2 }],
    createdAt: { gte: new Date('2024-01-01') },
  },
});
*/

/* --- pagination ---
// offset pagination (used in posts.service.ts)
prisma.post.findMany({ skip: (page - 1) * take, take, orderBy: { id: 'asc' } });
// cursor pagination (stable for large/infinite lists)
prisma.post.findMany({ take, cursor: { id: lastId }, skip: 1, orderBy: { id: 'asc' } });
*/

/* --- selecting / relations ---
// with a relation defined (e.g. Post.author -> User):
prisma.post.findMany({
  select: { id: true, title: true, author: { select: { name: true } } }, // shape output
});
prisma.post.findMany({ include: { author: true } }); // include full relation
*/

/* --- transactions ---
// sequential array: all-or-nothing
await prisma.$transaction([
  prisma.post.create({ data: a }),
  prisma.post.update({ where: { id }, data: b }),
]);
// interactive: logic between queries, atomic
await prisma.$transaction(async (tx) => {
  const p = await tx.post.create({ data: a });
  await tx.auditLog.create({ data: { postId: p.id } });
});
*/

/* --- raw SQL (escape hatch; still parameterized against injection) ---
await prisma.$queryRaw`SELECT * FROM posts WHERE user_id = ${userId}`;
await prisma.$executeRaw`UPDATE posts SET title = ${t} WHERE id = ${id}`;
*/

/* --- aggregation / groupBy ---
prisma.post.aggregate({ _count: true, _max: { id: true } });
prisma.post.groupBy({ by: ['userId'], _count: { _all: true } });
*/

export {};
