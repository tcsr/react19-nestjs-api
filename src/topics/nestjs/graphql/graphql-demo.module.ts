/**
 * GraphqlDemoModule — configures Apollo (code-first) + registers the resolver.
 * autoSchemaFile makes Nest generate the SDL from the decorated classes.
 * Once running, open http://localhost:3000/graphql for the Apollo Sandbox.
 */

import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'node:path';
import { PostResolver } from './post.resolver.js';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/generated/schema.gql'),
      sortSchema: true,
      playground: false, // use the built-in Apollo Sandbox at /graphql
    }),
  ],
  providers: [PostResolver],
})
export class GraphqlDemoModule {}
