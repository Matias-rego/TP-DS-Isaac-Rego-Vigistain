/*
  Warnings:

  - You are about to drop the column `status` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `newStatus` on the `status_history` table. All the data in the column will be lost.
  - You are about to drop the column `previousStatus` on the `status_history` table. All the data in the column will be lost.
  - Made the column `id_user` on table `order` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_id_user_fkey`;

-- DropIndex
DROP INDEX `Order_id_user_fkey` ON `order`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `status`,
    MODIFY `id_user` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `status_history` DROP COLUMN `newStatus`,
    DROP COLUMN `previousStatus`,
    ADD COLUMN `status` ENUM('recibido', 'diagnostico', 'presupuestado', 'aprobado', 'reparacion', 'listo', 'entregado', 'cancelado') NOT NULL DEFAULT 'recibido';

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;
