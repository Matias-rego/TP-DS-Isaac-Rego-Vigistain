/*
  Warnings:

  - You are about to drop the column `Cuit` on the `Client` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cuit]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cuit` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
ALTER TABLE `Client`
RENAME COLUMN `Cuit` TO `cuit`;
