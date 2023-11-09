import path from 'path';

import { LoggerMiddleware } from '@douglasneuroinformatics/nestjs/core';
import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssignmentsModule } from './assignments/assignments.module';

@Module({
  imports: [
    AssignmentsModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ThrottlerModule.forRoot([
      {
        limit: 25,
        name: 'short',
        ttl: 1000
      },
      {
        limit: 100,
        name: 'medium',
        ttl: 10000
      },
      {
        limit: 250,
        name: 'long',
        ttl: 60000
      }
    ]),
    TypeOrmModule.forRoot({
      autoLoadEntities: true,
      database: path.resolve(import.meta.dir, '..', 'data', 'db.sqlite'),
      synchronize: true,
      type: 'sqlite'
    })
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
