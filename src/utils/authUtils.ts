import bcrypt from 'bcryptjs';
import { prisma } from '../prisma/prismaClient';
import { User } from '@prisma/client';
import { signInSchema } from '../schemas/signUpSchema';
export const verifyCallback = async (
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
      select: { id: true, email: true, password: true, name: true }
    });
    if (!user) {
      return done(null, false, { message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Invalid credentials' });
    }
    return done(null, user);
  } catch (error: Error | any) {
    return done(error, false);
  }
};

export const verifyCallbackGoogle = async (
  err: Error | null,
  user: User | false,
  info?: { message: string } | undefined
) => {};
