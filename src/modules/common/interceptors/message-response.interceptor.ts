import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  [key: string]: unknown;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    const httpResponse = context
      .switchToHttp()
      .getResponse<{ statusCode: number }>();
    const statusCode =
      typeof httpResponse?.statusCode === 'number'
        ? httpResponse.statusCode
        : 200;

    const responseMessage =
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ??
      'Success';

    return next.handle().pipe(
      map((data): Response<T> => {
        if (
          typeof data === 'object' &&
          data !== null &&
          !Array.isArray(data) &&
          Object.prototype.hasOwnProperty.call(data, 'data')
        ) {
          const { data: innerData, ...extraFields } = data as {
            data: T;
          } & Record<string, unknown>;

          return {
            statusCode,
            message: responseMessage,
            data: innerData,
            ...extraFields,
          };
        }

        return {
          statusCode,
          message: responseMessage,
          data,
        };
      }),
    );
  }
}
