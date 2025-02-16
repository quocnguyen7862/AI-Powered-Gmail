import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exct = exception.getResponse() as any;

    response.status(status).json({
      statusCode: status,
      message: (exct as any).message,
      timestamp: Date.now(),
      path: request.url,
      errors: exct?.errors,
    });
  }
}
