import path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssignmentsModule } from './assignments/assignments.module';

@Module({
  imports: [
    AssignmentsModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      autoLoadEntities: true,
      database: path.resolve(import.meta.dir, '..', 'data', 'db.sqlite'),
      synchronize: true,
      type: 'sqlite'
    })
  ]
})
export class AppModule {}
