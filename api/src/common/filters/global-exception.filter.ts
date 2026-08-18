import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let errorName: string | undefined = undefined;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as any;
        message = Array.isArray(r.message)
          ? r.message.join(', ')
          : r.message || (typeof r.error === 'string' ? r.error : JSON.stringify(r));
        errorName = typeof r.error === 'string' ? r.error : undefined;
      }
    } else if (exception instanceof Error) {
      message = exception.message || 'Internal server error';
    }

    if (status >= 500) {
      this.logger.error(
        `HTTP Status: ${status} Error Message: ${message}`,
        exception instanceof Error ? exception.stack : '',
      );
    }

    response.status(status).send({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error: errorName,
    });
  }
}
