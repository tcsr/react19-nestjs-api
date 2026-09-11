/**
 * GRAPHQL (code-first) — object + input types
 * -------------------------------------------
 * Code-first: define types as TS classes with @ObjectType/@Field decorators; Nest
 * generates the GraphQL schema (SDL) from them. Contrast with schema-first (write
 * SDL, generate types). GraphQL lets the client request exactly the fields it needs
 * from a single endpoint.
 */

import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { IsInt, IsString, Min, MinLength } from 'class-validator';

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
  // class-validator decorators so the global ValidationPipe (whitelist) accepts
  // these fields for the GraphQL mutation, not just @Field for the schema.
  @Field()
  @IsString()
  @MinLength(1)
  title!: string;

  @Field()
  @IsString()
  @MinLength(1)
  body!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  userId!: number;
}
