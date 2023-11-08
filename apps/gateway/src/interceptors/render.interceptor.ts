import React from 'react';
import { renderToReadableStream } from 'react-dom/server';

import { arrayBuffer } from 'stream/consumers';

import { Injectable, StreamableFile } from '@nestjs/common';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs/operators';

import { COMPONENT_KEY } from '@/decorators/render.decorator';

export type RootComponentType = React.FC<{ children: React.ReactNode }>;

export type RenderInterceptorOptions<T extends RootComponentType> = {
  root: T;
};

@Injectable()
export class RenderInterceptor<T extends RootComponentType> implements NestInterceptor {
  private readonly reflector = new Reflector();

  constructor(private readonly options: RenderInterceptorOptions<T>) {}

  intercept<TProps extends object>(context: ExecutionContext, next: CallHandler<TProps>) {
    const component = this.reflector.get<React.FC<TProps> | undefined>(COMPONENT_KEY, context.getHandler());
    if (!component) {
      return next.handle();
    }
    return next.handle().pipe(
      map(async (props) => {
        const app = React.createElement(this.options.root, {
          children: React.createElement(component, props)
        });
        const stream = await renderToReadableStream(app, {
          bootstrapModules: ['/hydrate.js'],
          bootstrapScriptContent: 'const PATH_TO_PAGE = "/pages/index.js"'
        });
        const buffer = Buffer.from(await arrayBuffer(stream));
        return new StreamableFile(buffer);
      })
    );
  }
}
