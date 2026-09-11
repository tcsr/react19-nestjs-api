/**
 * POST CONTRACT (Zod) — single source of truth for the Post API shape.
 * -------------------------------------------------------------------
 * One schema drives runtime validation AND the TypeScript types (z.infer), so the
 * request shape, the validation rules, and the types can't drift apart. In a
 * MONOREPO this file would live in a shared package imported by both the API and
 * the React app; with separate repos, the frontend mirrors this schema in
 * react19-topics/src/lib/contracts.ts (keep them in sync).
 */

import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1, 'title is required'),
  body: z.string().min(1, 'body is required'),
  userId: z.number().int().positive(),
});
export type CreatePost = z.infer<typeof createPostSchema>;

// PATCH: all fields optional.
export const updatePostSchema = createPostSchema.partial();
export type UpdatePost = z.infer<typeof updatePostSchema>;

// Response shape (what the API returns).
export const postSchema = z.object({
  id: z.number(),
  title: z.string(),
  body: z.string(),
  userId: z.number(),
});
export type Post = z.infer<typeof postSchema>;
