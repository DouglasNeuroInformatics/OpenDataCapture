import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

import { AbilityModule } from '@/ability/ability.module.js';
import { CryptoModule } from '@/crypto/crypto.module.js';
import { UsersModule } from '@/users/users.module.js';

@Module({
  imports: [
    CryptoModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('SECRET_KEY')
      })
    }),
    AbilityModule,
    UsersModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
