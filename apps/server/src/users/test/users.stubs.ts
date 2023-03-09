import { JwtService } from '@nestjs/jwt';
import { User } from '../schemas/user.schema';

export class UserStubs {
  private static readonly jwtService = new JwtService({
    secret: process.env['SECRET_KEY'],
    signOptions: { expiresIn: '15m' }
  });

  static readonly mockPlainTextPassword = 'Password123';
  static readonly mockHashedPassword = '$2b$10$hwA0g1yoj8u22Xn.gwoGQ.h9UlvIUtJPHuHzPDxuTRulIw5mlk1uu';

  static get mockUsers() {
    return [this.mockSystemAdmin, this.mockGroupManager, this.mockStandardUser] as const;
  }

  static get mockUsersWithoutTokens(): readonly User[] {
    return this.mockUsers.map(({ username, password }) => ({ username, password }));
  }

  static get mockSystemAdmin() {
    return this.createMockUser('mock-system-admin');
  }

  static get mockGroupManager() {
    return this.createMockUser('mock-group-manager');
  }

  static get mockStandardUser() {
    return this.createMockUser('mock-standard-user');
  }

  private static createMockUser<T extends string>(username: T) {
    return {
      username,
      password: this.mockHashedPassword,
      accessToken: this.jwtService.sign({ username })
    };
  }
}
