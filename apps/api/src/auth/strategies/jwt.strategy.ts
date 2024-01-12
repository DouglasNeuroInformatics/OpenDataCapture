import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { JwtPayload } from '@open-data-capture/common/auth';
import type { GroupModel, UserModel } from '@open-data-capture/database/core';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AbilityFactory } from '@/ability/ability.factory';
import { UsersService } from '@/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    config: ConfigService,
    private readonly abilityFactory: AbilityFactory,
    private readonly usersService: UsersService
  ) {
    super({
      ignoreExpiration: config.get('NODE_ENV') === 'development',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('SECRET_KEY')
    });
  }

  /** This method is called after the token is validated by passport  */
  async validate({ username }: JwtPayload): Promise<Request['user']> {
    const user = await this.getUser(username);
    const ability = this.abilityFactory.createForUser(user);
    this.logger.verbose(`Validated Token for User: ${username}`);
    return { ...user, ability };
  }

  /** Returns the user associated with the JWT if they exist, otherwise throws UnauthorizedException */
  private async getUser(username: string) {
    let user: UserModel & { groups: GroupModel[] };
    try {
      user = await this.usersService.findByUsername(username);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException(`Token is valid, but user does not exist: ${username}`);
      }
      throw error;
    }
    return user;
  }
}
