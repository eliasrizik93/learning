import { User } from '@prisma/client';

export type SafeUserWithName = Omit<User, 'password'>;
export type SafeUser = {
  id: number;
  email: string;
  name: string;
  profile: string | null;
  birthday: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
