import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { verifyCallback } from '../utils/authUtils';
import { User } from '@prisma/client';
import { prisma } from '../prisma/prismaClient';
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    verifyCallback
  )
);
passport.serializeUser((user: any, done) => {
  if (user) {
    return done(null, user.id);
  }
  return done(null, false);
});
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) }
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});
