export const userRoleOptions = ['admin', 'user'] as const;
export type UserRole = (typeof userRoleOptions)[number];
