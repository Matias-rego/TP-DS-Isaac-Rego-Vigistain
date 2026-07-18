/*
  Warnings:

  - You are about to drop the column `equipmentName` on the `equipment` table. All the data in the column will be lost.
  - You are about to alter the column `tipo_equipment` on the `equipment` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `VarChar(191)`.
  - You are about to drop the column `failureReported` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `technicianDiagnosis` on the `order` table. All the data in the column will be lost.
  - Added the required column `brand` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `Equipment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Equipment_equipmentName_key` ON `equipment`;

-- AlterTable
ALTER TABLE `equipment` DROP COLUMN `equipmentName`,
    ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    ADD COLUMN `model` VARCHAR(191) NOT NULL,
    MODIFY `tipo_equipment` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `failureReported`,
    DROP COLUMN `technicianDiagnosis`,
    ADD COLUMN `equipmentPhotoUrl` VARCHAR(191) NULL,
    ADD COLUMN `observations` VARCHAR(191) NULL;
