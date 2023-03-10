import { Group } from '@/groups/entities/group.entity';

export interface UserInterface {
  username: string;
  password: string;
  isAdmin?: boolean;
  groups?: Group[];
  refreshToken?: string;
}
