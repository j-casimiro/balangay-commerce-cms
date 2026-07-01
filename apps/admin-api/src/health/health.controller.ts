import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

/**
 * Lightweight liveness probe. Intentionally dependency-free so it stays green
 * (and cheap) even when downstream services are degraded; a DB-touching
 * readiness check can be added under `/health/ready` when needed.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Reports service status and process uptime.',
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}
