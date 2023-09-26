import type { LoginRequestDto } from '@/auth/dto/login-request.dto';

export const createLoginRequestStub = (): LoginRequestDto => ({
  username: 'admin',
  password: 'Password123'
});
