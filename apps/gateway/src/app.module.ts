import path from 'path';

import { LoggerMiddleware, ValidationPipe } from '@douglasneuroinformatics/nestjs/core';
import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
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
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.getOrThrow<string>('NODE_ENV');
        return {
          autoLoadEntities: true,
          database: env === 'test' ? ':memory:' : path.resolve(import.meta.dir, '..', 'data', 'db.sqlite'),
          synchronize: true,
          type: 'sqlite'
        };
      }
    })
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
