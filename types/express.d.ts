import "express";

declare module "express" {
  export interface Request {
    // Add any custom properties you'd like to extend the Request object
    user?: {
      id: number;
      email: string;
      name: string;
      password: string;
    };
  }
}
