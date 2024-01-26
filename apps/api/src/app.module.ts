import { CryptoModule, LoggingModule } from '@douglasneuroinformatics/nestjs/modules';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AssignmentsModule } from './assignments/assignments.module';
import { AuthModule } from './auth/auth.module';
import { AuthenticationGuard } from './auth/guards/authentication.guard';
import { AuthorizationGuard } from './auth/guards/authorization.guard';
import { ConfigurationModule } from './configuration/configuration.module';
import { ConfigurationService } from './configuration/configuration.service';
import { GatewayModule } from './gateway/gateway.module';
import { GroupsModule } from './groups/groups.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { PrismaModule } from './prisma/prisma.module';
import { SetupModule } from './setup/setup.module';
import { SubjectsModule } from './subjects/subjects.module';
import { SummaryModule } from './summary/summary.module';
import { UsersModule } from './users/users.module';
import { VisitsModule } from './visits/visits.module';

@Module({
  imports: [
    AuthModule,
    ConfigurationModule.forRoot({
      conditionalModules: [
        {
          condition: 'GATEWAY_ENABLED',
          modules: [AssignmentsModule, GatewayModule]
        }
      ]
    }),
    CryptoModule.registerAsync({
      inject: [ConfigurationService],
      isGlobal: true,
      useFactory: (configurationService: ConfigurationService) => ({
        secretKey: configurationService.get('SECRET_KEY')
      })
    }),
    GroupsModule,
    InstrumentsModule,
    PrismaModule.forRoot(),
    SubjectsModule,
    LoggingModule.forRoot(),
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
    UsersModule,
    SetupModule,
    SummaryModule,
    VisitsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard
    }
  ]
})
export class AppModule {}
