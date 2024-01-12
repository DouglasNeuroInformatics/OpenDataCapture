import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AbilityModule } from '@/ability/ability.module';
import { UsersModule } from '@/users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  imports: [
    AbilityModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('SECRET_KEY')
      })
    }),
    UsersModule
  ],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
