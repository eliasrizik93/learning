import { User } from '@prisma/client';

export type SafeUserWithName = Omit<User, 'password'>;
export type SafeUser = Omit<User, 'password' | 'name'>;
