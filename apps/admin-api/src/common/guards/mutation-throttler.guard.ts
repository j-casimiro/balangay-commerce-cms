import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Rate-limits only mutating requests (POST/PATCH/PUT/DELETE). Safe, idempotent
 * reads (GET/HEAD/OPTIONS) are skipped, so browsing the catalog is never
 * throttled. Registered globally so every current and future write route is
 * protected without per-handler decorators.
 */
@Injectable()
export class MutationThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ method?: string }>();
    const method = request.method?.toUpperCase() ?? 'GET';
    return method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
  }
}
