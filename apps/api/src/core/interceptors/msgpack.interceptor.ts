import { Injectable } from '@nestjs/common';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { Packr } from 'msgpackr';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class MsgpackInterceptor implements NestInterceptor {
  private packr = new Packr({
    useRecords: true
  });

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<FastifyReply>();

    return next.handle().pipe(
      map((data) => {
        response.header('Content-Type', 'application/x-msgpack');
        return this.packr.pack(data);
      })
    );
  }
}
