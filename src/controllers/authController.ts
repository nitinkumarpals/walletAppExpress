import { Request, Response } from 'express';
import { prisma } from '../prisma/prismaClient';
import { signUpSchema } from '../schemas/signUpSchema';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


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
      select: { name: true, email: true }
    });
    if (existingUser) {
      if (existingUser.name === name) {
        res.status(400).json({
          success: false,
          message: 'Username already exist'
        });
      } else if (existingUser.email === email) {
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
    const token = jwt.sign(
      {
        email: user.email,
        id: user.id
      },
      process.env.JWT_SECRET || ''
    );
    res.status(200).json({
      success: true,
      message: 'user created successfully',
      token
    });
  } catch (error: Error | any) {
    res.status(500).json({
      success: false,
      message: 'some internal error occurred',
      error: error as Error
    });
  }
};

export const loginUser = async (
  req: Request,
  res: Response
): Promise<void> => {};
