/**
 * CreatePostDto — request body validation contract.
 * class-validator decorators enforce shape/rules at runtime; the global
 * ValidationPipe rejects invalid payloads with 400 before the handler runs.
 * DTOs keep the API contract explicit and decoupled from the DB entity.
 */

import { IsInt, IsString, MinLength, Min } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  body!: string;

  @IsInt()
  @Min(1)
  userId!: number;
}
