import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { appConfig } from '../config';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = this.resolveStatus(exception);
    const message = this.resolveMessage(exception);

    if (!appConfig.isProduction) {
      this.logger.error(
        `[Exception] ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      code: status,
      success: false,
      message,
      data: null,
    });
  }

  private resolveStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        return payload;
      }

      if (payload && typeof payload === 'object') {
        const data = payload as Record<string, unknown>;
        if (typeof data.message === 'string') {
          return data.message;
        }
        if (Array.isArray(data.message) && data.message.length > 0) {
          return String(data.message[0]);
        }
      }

      return exception.message;
    }

    if (exception instanceof Error) {
      return exception.message || 'INTERNAL_SERVER_ERROR';
    }

    return 'INTERNAL_SERVER_ERROR';
  }
}
