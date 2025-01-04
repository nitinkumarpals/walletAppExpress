import bcrypt from "bcryptjs";
import { prisma } from "../prisma/prismaClient";
export const verifyCallback = async (
  email: string,
  password: string,
  done: (err: any, user: any, info?: any) => void
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true }
    });
    if (!user) {
      return done(null, false, { message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password,user.password );
    if(!isMatch){
      return done(null, null, { message: "Invalid credentials" });
    }
    return done(null,user)
  } catch (error) {
    return done(error, false);
  }
};
