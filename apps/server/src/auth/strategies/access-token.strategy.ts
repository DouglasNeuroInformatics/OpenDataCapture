import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { JwtPayload } from 'common';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { StrategyName } from '../enum/strategy-name.enum';

import { User } from '@/users/schemas/user.schema';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, StrategyName.AccessToken) {
  private readonly logger = new Logger(AccessTokenStrategy.name);

  constructor(config: ConfigService, private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('SECRET_KEY')
    });
  }

  /** This method is called after the token is validated by passport  */
  validate(payload: JwtPayload): Promise<User> {
    this.logger.verbose(`Payload: ${JSON.stringify(payload)}`);
    return this.getUser(payload.username);
  }

  /** It is possible for a token to be valid for a user that does not exist if they are deleted */
  private async getUser(username: string): Promise<User> {
    let user: User;
    try {
      user = await this.usersService.findByUsername(username);
      this.logger.debug(user);
    } catch (error) {
      this.logger.debug(error);
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException(`User does not exist: ${username}`);
      }
      throw new InternalServerErrorException('Internal Server Error', {
        cause: error instanceof Error ? error : undefined
      });
    }
    return user;
  }
}
