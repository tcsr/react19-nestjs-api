/**
 * GRAPHQL (code-first) — object + input types
 * -------------------------------------------
 * Code-first: define types as TS classes with @ObjectType/@Field decorators; Nest
 * generates the GraphQL schema (SDL) from them. Contrast with schema-first (write
 * SDL, generate types). GraphQL lets the client request exactly the fields it needs
 * from a single endpoint.
 */

import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';

@ObjectType()
export class PostModel {
  @Field(() => Int)
  id!: number;

  @Field()
  title!: string;

  @Field()
  body!: string;

  @Field(() => Int)
  userId!: number;
}

@InputType()
export class CreatePostInput {
  @Field()
  title!: string;

  @Field()
  body!: string;

  @Field(() => Int)
  userId!: number;
}
