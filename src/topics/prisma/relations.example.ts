/**
 * PRISMA RELATIONS (reference) — matches the models in prisma/schema.prisma
 * ------------------------------------------------------------------------
 * Relationship types modeled:
 *   User 1—1 Profile        (Profile holds the unique FK)
 *   User 1—many Post        (Post holds userId FK; User.posts back-relation)
 *   Post 1—many Comment
 *   Post many—many Category (implicit join table Prisma manages)
 *
 * Patterns below show reading + writing across relations.
 */

/* --- nested read: include relations ---
prisma.user.findMany({
  include: {
    profile: true,                       // 1-1
    posts: { include: { comments: true, categories: true } }, // nested 1-many + m-n
  },
});
*/

/* --- select specific fields (shape output, avoid over-fetching) ---
prisma.post.findMany({
  select: {
    id: true, title: true,
    author: { select: { name: true } },  // pull one field from the relation
    _count: { select: { comments: true } }, // relation counts
  },
});
*/

/* --- filter BY relation ---
prisma.post.findMany({
  where: {
    author: { email: { endsWith: '@example.com' } }, // filter on related model
    categories: { some: { name: 'tech' } },            // m-n: has a 'tech' category
    comments: { some: {} },                            // has at least one comment
  },
});
*/

/* --- nested WRITE (create graph in one transaction-safe call) ---
prisma.user.create({
  data: {
    email: 'x@y.com', name: 'X',
    profile: { create: { bio: 'hi' } },                 // 1-1
    posts: {
      create: [{
        title: 't', body: 'b',
        categories: { connect: [{ id: 1 }] },           // link existing (m-n)
        comments: { create: [{ text: 'first' }] },      // 1-many
      }],
    },
  },
});
*/

/* --- connect / disconnect / set on many-many ---
prisma.post.update({
  where: { id: 1 },
  data: { categories: { connect: { id: 2 }, disconnect: { id: 1 } } },
});
*/

/* --- avoid N+1: one query with include, not a loop of queries ---
// BAD: posts.forEach(p => prisma.comment.findMany({ where: { postId: p.id } }))
// GOOD: prisma.post.findMany({ include: { comments: true } })
*/

export {};
