import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { PassportStrategy } from '@nestjs/passport';
import type { JwtPayload } from '@open-data-capture/types';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AbilityFactory } from '@/ability/ability.factory';
import { UserEntity } from '@/users/entities/user.entity';
import { UsersService } from '@/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    configService: ConfigService,
    private readonly moduleRef: ModuleRef
  ) {
    super({
      ignoreExpiration: configService.getOrThrow('NODE_ENV') === 'development',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
      secretOrKey: configService.getOrThrow<string>('SECRET_KEY')
    });
  }

  /** This method is called after the token is validated by passport  */
  async validate(request: Request, { username }: JwtPayload): Promise<Request['user']> {
    // First, we need to resolve the module for this request scope
    // For more info, see: https://docs.nestjs.com/recipes/passport#request-scoped-strategies
    const contextId = ContextIdFactory.getByRequest(request);
    const abilityFactory = await this.moduleRef.resolve(AbilityFactory, contextId, { strict: false });
    const usersService = await this.moduleRef.resolve(UsersService, contextId, { strict: false });

    // Get the user associated with the JWT if they exist, otherwise throws UnauthorizedException
    let user: UserEntity;
    try {
      user = await usersService.findByUsername(username);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException(`Token is valid, but user does not exist: ${username}`);
      }
      throw error;
    }

    const ability = abilityFactory.createForUser(user);
    this.logger.verbose(`Validated Token for User: ${username}`);
    return { ...user, ability };
  }
}
