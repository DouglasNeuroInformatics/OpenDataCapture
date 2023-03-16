import { Dto } from '@/core/decorators/dto.decorator';

interface JwtPayload {
  username: string;
}

@Dto<JwtPayload>({
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 1
    }
  },
  additionalProperties: true,
  required: ['username']
})
export class JwtPayloadDto {
  username: string;
}
