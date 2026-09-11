/**
 * UpdatePostDto — PartialType makes every CreatePostDto field optional while
 * keeping its validation rules. Used for PATCH (partial update).
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto.js';

export class UpdatePostDto extends PartialType(CreatePostDto) {}
