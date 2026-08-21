/*
  Warnings:

  - You are about to drop the column `categoryClientName` on the `Client_Type` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clientTypeName]` on the table `Client_Type` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientTypeName` to the `Client_Type` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Client_Type_categoryClientName_key` ON `Client_Type`;

-- AlterTable
ALTER TABLE `Client_Type` DROP COLUMN `categoryClientName`,
    ADD COLUMN `clientTypeName` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Client_Type_clientTypeName_key` ON `Client_Type`(`clientTypeName`);
