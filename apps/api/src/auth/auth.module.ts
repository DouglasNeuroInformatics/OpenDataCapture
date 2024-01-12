import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AbilityModule } from '@/ability/ability.module';
import { ConfigurationService } from '@/configuration/configuration.service';
import { UsersModule } from '@/users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  imports: [
    AbilityModule,
    JwtModule.registerAsync({
      inject: [ConfigurationService],
      useFactory: (configurationService: ConfigurationService) => ({
        secret: configurationService.get('SECRET_KEY')
      })
    }),
    UsersModule
  ],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
