import { Request, Response } from "express";
import { prisma } from "../prisma/prismaClient";
import { signUpSchema } from "../schemas/signUpSchema";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (
  req: Request,
  res: Response
) => {
  try {
    const body = req.body;
    const parsedBody = signUpSchema.safeParse(body);
    if (!parsedBody.success) {
      res.status(400).json({
        success: false,
        message:
          "Validation error: " +
          parsedBody.error.errors
            .map((err) => `${err.path[0]} ${err.message}`)
            .join(", ")
      });
      return;
    }

    const { email, name, password } = parsedBody.data;
    const secureToken = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { name }] }
    });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User already exists"
      });
      return;
    }

    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword }
    });

    const token = jwt.sign(
      { email: user.email, id: user.id },
      process.env.JWT_SECRET || ""
    );

    if (!user) {
      throw new Error("Error in creating user");
    }

    res.status(200).json({
      success: true,
      message: "User created successfully",
      id: user.id.toString(),
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};
