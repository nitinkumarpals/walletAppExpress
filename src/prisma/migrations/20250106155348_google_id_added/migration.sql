/*
  Warnings:

  - Added the required column `authType` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('Google', 'Credentials');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authType" "AuthType" NOT NULL,
ADD COLUMN     "googleId" TEXT,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;
