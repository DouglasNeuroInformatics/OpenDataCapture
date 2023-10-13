import { renderToReadableStream } from 'react-dom/server';

import { arrayBuffer } from 'stream/consumers';

import { Injectable, StreamableFile } from '@nestjs/common';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type RootComponentType = React.FC<{ children: React.ReactNode }>;

export type RenderInterceptorOptions<T extends RootComponentType> = {
  root: T;
};

@Injectable()
export class RenderInterceptor<T extends RootComponentType> implements NestInterceptor {
  constructor(private readonly options: RenderInterceptorOptions<T>) {}

  intercept(context: ExecutionContext, next: CallHandler<JSX.Element>): Observable<Promise<StreamableFile>> {
    console.log(context);
    return next.handle().pipe(
      map(async (element) => {
        return await this.render(element);
      })
    );
  }

  private async render(element: JSX.Element): Promise<StreamableFile> {
    const stream = await renderToReadableStream(this.options.root({ children: element }), {
      bootstrapModules: ['/hydrate.js']
    });
    const buffer = Buffer.from(await arrayBuffer(stream));
    return new StreamableFile(buffer);
  }
}
