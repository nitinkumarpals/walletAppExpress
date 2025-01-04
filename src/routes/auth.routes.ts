import { Router } from 'express';
import { registerUser } from '../controllers/authController';
import { Request, Response } from 'express';
import passport from 'passport';
import Jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

export const authRouter = Router();
authRouter.post('/signup', registerUser);

authRouter.post(
  '/login',
  passport.authenticate('local'),
  (req: Request, res: Response) => {
    // If authentication is successful, this function will be called.
    const user = req.user as User; // req.user is populated by Passport
    const token = Jwt.sign(
      { email: user.email, id: user.id },
      process.env.JWT_SECRET || ''
    );

    res.status(200).json({
      message: 'Login successful',
      user,
      token
    });
  }
);
