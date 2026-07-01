import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ApiError } from '@cms/types';
import type { Request, Response } from 'express';

/**
 * Catches every unhandled exception and serializes it into the shared
 * `ApiError` envelope (blueprint house rule §api.ts). Validation errors raised
 * by the global `ValidationPipe` keep their `message: string[]` array, giving
 * clients one consistent, field-level error shape regardless of the source.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string }>();

    const { statusCode, message, error } = this.normalize(exception);

    const body: ApiError = {
      statusCode,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
      requestId: request.id,
    };

    // 5xx are unexpected — log with the stack so pino captures the request id.
    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(statusCode).json(body);
  }

  private normalize(exception: unknown): {
    statusCode: number;
    message: string | string[];
    error: string;
  } {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        return { statusCode, message: res, error: exception.name };
      }

      const obj = res as { message?: string | string[]; error?: string };
      return {
        statusCode,
        message: obj.message ?? exception.message,
        error: obj.error ?? exception.name,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'InternalServerError',
    };
  }
}
