declare global {
  namespace Express {
    interface Request {
      authUser?: {
        userId: number;
        email: string;
      };
    }
  }
}

export {};
