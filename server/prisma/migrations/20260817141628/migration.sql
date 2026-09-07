-- AlterTable
ALTER TABLE `order` ADD COLUMN `currentStatus` ENUM('recibido', 'diagnostico', 'presupuestado', 'aprobado', 'reparacion', 'listo', 'entregado', 'cancelado') NOT NULL DEFAULT 'recibido';
