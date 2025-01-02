import { Request, Response } from "express";
import { prisma } from "../prisma/prismaClient";
import { signUpSchema } from "../schemas/signUpSchema";
export const registerUser = async (req: Request, res: Response) => {
  const body = req.body;
  const parsedBody = signUpSchema.safeParse(body);
  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      message:
        "Validation error: " +
        parsedBody.error.errors.map((err) => `${err.path[0]} ${err.message}`),
    });
  }
};
