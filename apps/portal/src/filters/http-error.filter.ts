/** @format */

// #region Imports NPM
import { ExceptionFilter, Catch, HttpException, HttpStatus, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Response, Request } from 'express';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { AppGraphQLExecutionContext } from '../interceptors/logging.interceptor';
// #endregion

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  constructor(private readonly logService: LogService) {}

  catch(exception: Error | HttpException, host: ExecutionContext): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
      if (typeof message === 'object') {
        message = (message as any).error;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      ({ message } = exception);
    }

    if (response.status && request.method && request.url) {
      // #region HTTP query
      const errorResponse = {
        code: status,
        timestamp: new Date().toLocaleString('ru'),
        path: request.url,
        method: request.method,
        message,
      };

      if (status === 403) {
        response.status(302);
        response.redirect('/auth/login');
        return;
      }
      if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logService.error(`${request.method} ${request.url}`, exception.stack, 'ExceptionFilter');
      } else {
        this.logService.error(`${request.method} ${request.url}`, JSON.stringify(errorResponse), 'ExceptionFilter');
      }

      response.status(status);
      response.render('/_error');
      // #endregion
    } else {
      // #region GraphQL query
      const context: AppGraphQLExecutionContext = GqlExecutionContext.create(host);
      const info = context.getInfo();

      this.logService.error(`${info.parentType.name} "${info.fieldName}": ${message}`, undefined, 'ExceptionFilter');
      // #endregion
    }
  }
}
