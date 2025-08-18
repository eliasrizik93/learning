// src/types/express.d.ts  // ADD
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        profile?: string;
        birthday?: Date;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user: Express.User;
  }
}

export {};
