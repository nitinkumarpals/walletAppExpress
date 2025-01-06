import { Router } from 'express';
import { registerUser } from '../controllers/authController';
import { Request, Response } from 'express';
import passport from 'passport';
import Jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

export const authRouter = Router();
authRouter.post('/signup', registerUser);
authRouter.get(
  '/authGoogle',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
authRouter.get(
  '/callback',
  passport.authenticate('google', { failureMessage: 'failed' }),
  (req, res) => {
    res.status(200).json({
      user: req.user
    });
  }
);
// authRouter.post(
//   '/login',
//   passport.authenticate('local'),
//   (req: Request, res: Response) => {
//     // If authentication is successful, this function will be called.
//     const { password, ...user } = req.user as User;
//     console.log(user);
//     const token = Jwt.sign(
//       { email: user.email, id: user.id },
//       process.env.JWT_SECRET || ''
//     );

//     res.status(200).json({
//       message: 'Login successful',
//       user,
//       token
//     });
//   }
// );

authRouter.post('/login', (req: Request, res: Response, next) => {
  passport.authenticate(
    'local',
    (
      err: Error | null,
      user: User | false,
      info?: { message: string } | undefined
    ) => {
      if (err) {
        return res
          .status(500)
          .json({ message: 'An error occurred', error: err.message });
      }
      if (!user) {
        return res
          .status(401)
          .json({ message: info?.message || 'Authentication failed' });
      }
      req.login(user, { session: false }, (loginErr) => {
        if (loginErr) {
          return res
            .status(500)
            .json({ message: 'Login failed', error: loginErr.message });
        }
      });
      const { password, ...userData } = req.user as User;
      const token = Jwt.sign(
        { email: userData.email, id: userData.id },
        process.env.JWT_SECRET || ''
      );

      res.status(200).json({
        message: 'Login successful',
        userData,
        token
      });
    }
  )(req, res, next);
});
authRouter.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'Logout failed', error: err.message });
    }
  });
  res.status(200).json({ message: 'Logout successful' });
});
