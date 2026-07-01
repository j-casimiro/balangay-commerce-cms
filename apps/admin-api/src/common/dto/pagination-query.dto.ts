import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import type { PaginationQuery } from '@cms/types';

/**
 * Shared query parameters for every paginated list endpoint. New list slices
 * extend this DTO so pagination + sorting behave identically across the API.
 * `@Type(() => Number)` is required because query strings arrive as text and the
 * global `ValidationPipe` runs with `transform: true`.
 */
export class PaginationQueryDto implements PaginationQuery {
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
    description: '1-based page number.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 20,
    description: 'Items per page (1–100).',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;

  @ApiPropertyOptional({
    example: 'createdAt:desc',
    description:
      'Sort as `field:direction`. Direction is `asc` or `desc` (default `asc`). Allowed fields are per-resource.',
  })
  @IsOptional()
  @IsString()
  sort?: string;
}
