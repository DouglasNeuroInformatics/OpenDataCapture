import { ConfigService } from '@douglasneuroinformatics/libnest';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { TokenPayload } from '@opendatacapture/schemas/auth';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { AppAbility } from '@/auth/auth.types';

import { AbilityFactory } from '../ability.factory.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly abilityFactory: AbilityFactory
  ) {
    super({
      ignoreExpiration: configService.getOrThrow('NODE_ENV') === 'development',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow('SECRET_KEY')
    });
  }

  validate(payload: TokenPayload): TokenPayload & { ability: AppAbility } {
    const ability = this.abilityFactory.createForPermissions(payload.permissions);
    return { ability, ...payload };
  }
}
