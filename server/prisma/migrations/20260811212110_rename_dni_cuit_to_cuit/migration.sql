/*
  Warnings:

  - You are about to drop the column `dniCuit` on the `Client` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Cuit]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Cuit` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
ALTER TABLE `Client`
RENAME COLUMN `dniCuit` TO `Cuit`;