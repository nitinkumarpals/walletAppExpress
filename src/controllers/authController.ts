import { Request, Response } from 'express';
import { prisma } from '../prisma/prismaClient';
import { signUpSchema } from '../schemas/signUpSchema';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { signInSchema } from '../schemas/signUpSchema';
import { Profile } from 'passport-google-oauth20';

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const body = req.body;
    const parsedBody = signUpSchema.safeParse(body);
    if (!parsedBody.success) {
      res.status(400).json({
        success: false,
        message:
          'Validation error: ' +
          parsedBody.error.errors.map((err) => `${err.path[0]} ${err.message}`)
      });
      return;
    }
    const { email, name, password } = parsedBody.data;
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ name }, { email }]
      },
      select: {
        id: true,
        name: true,
        email: true,
        googleId: true,
        password: true
      }
    });
    if (existingUser) {
      if (existingUser.name === name) {
        res.status(400).json({
          success: false,
          message: 'Username already exist'
        });
      } else if (existingUser.email === email) {
        if (existingUser.googleId && !existingUser.password) {
          const user = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              password: hashedPassword
            }
          });
          res.status(200).json({
            success: true,
            message: 'User Updated Successfully',
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            googleId: user.googleId
          });
          return;
        }
        res.status(400).json({
          success: false,
          message: 'User emil already exist'
        });
      }
      return;
    }
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, authType: 'CREDENTIALS' }
    });
    if (!user) {
      res.status(500).json({
        success: false,
        message: 'Error in creating user'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'user created successfully'
    });
  } catch (error: Error | any) {
    res.status(500).json({
      success: false,
      message: 'some internal error occurred',
      error: error as Error
    });
  }
};
export const login = async (
  email: string,
  password: string,
  done: (err: Error | null, user: User | false, info?: any) => void
) => {
  try {
    const parsedData = signInSchema.safeParse({ email, password });
    if (!parsedData.success) {
      const errors =
        'Validation error ' +
        parsedData.error.errors.map((err) => `${err.path} ${err.message}`);
      return done(null, false, { message: `${errors}` });
    }
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        authType: true,
        googleId: true
      }
    });
    if (!user) {
      return done(null, false, { message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return done(null, false, { message: 'Invalid credentials' });
    }
    return done(null, user);
  } catch (error: Error | any) {
    return done(error, false);
  }
};

export const loginWithGoogle = async (
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: (
    err: Error | null,
    user: User | false,
    info?: { message: string } | undefined
  ) => void
) => {
  try {
    const email = profile.emails?.find((emailObj) => emailObj.verified)?.value;
    if (!email) done(null, false, { message: 'No verified email found.' });
    const existingUser = await prisma.user.findUnique({ where: { email } });
    let user;
    if (
      !existingUser ||
      !existingUser.googleId ||
      existingUser.authType !== 'GOOGLE'
    ) {
      user = await prisma.user.upsert({
        where: {
          email: email as string
        },
        update: {
          authType: 'GOOGLE',
          googleId: profile.id
        },
        create: {
          email: email as string,
          name: profile.displayName,
          authType: 'GOOGLE',
          googleId: profile.id
        }
      });
    } else user = existingUser;
    return done(null, user);
  } catch (error: Error | any) {
    return done(error, false);
  }
};
