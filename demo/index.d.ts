import { Group, User } from '@ddcp/types';

export type DemoUser = Omit<User, 'groups'> & {
    groupNames: string[];
};

export declare const demoGroups: Group[];

export declare const demoUsers: DemoUser[];
