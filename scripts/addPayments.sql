-- addPayments.sql
-- Agrega un pago pendiente para cada turno del día 2025-09-16.

USE estimular;

START TRANSACTION;

-- Asumiendo que los turnos creados en moreSampleData.sql tienen IDs del 16 en adelante.
-- Se insertarán pagos para 50 turnos (10 por cada uno de los 5 consultorios).

-- Pagos para turnos en Consultorio 1 (IDs 16-25)
INSERT INTO pagos (turno_id, paciente_id, monto, estado) VALUES
(16, 1, 2500.00, 'pendiente'),
(17, 2, 2500.00, 'pendiente'),
(18, 3, 2500.00, 'pendiente'),
(19, 4, 2500.00, 'pendiente'),
(20, 5, 2500.00, 'pendiente'),
(21, 6, 2500.00, 'pendiente'),
(22, 7, 2500.00, 'pendiente'),
(23, 8, 2500.00, 'pendiente'),
(24, 9, 2500.00, 'pendiente'),
(25, 10, 2500.00, 'pendiente');

-- Pagos para turnos en Consultorio 2 (IDs 26-35)
INSERT INTO pagos (turno_id, paciente_id, monto, estado) VALUES
(26, 11, 2200.00, 'pendiente'),
(27, 12, 2200.00, 'pendiente'),
(28, 13, 2200.00, 'pendiente'),
(29, 14, 2200.00, 'pendiente'),
(30, 15, 2200.00, 'pendiente'),
(31, 16, 2200.00, 'pendiente'),
(32, 17, 2200.00, 'pendiente'),
(33, 18, 2200.00, 'pendiente'),
(34, 19, 2200.00, 'pendiente'),
(35, 20, 2200.00, 'pendiente');

-- Pagos para turnos en Consultorio 3 (IDs 36-45)
INSERT INTO pagos (turno_id, paciente_id, monto, estado) VALUES
(36, 21, 2800.00, 'pendiente'),
(37, 22, 2800.00, 'pendiente'),
(38, 23, 2800.00, 'pendiente'),
(39, 24, 2800.00, 'pendiente'),
(40, 25, 2800.00, 'pendiente'),
(41, 26, 2800.00, 'pendiente'),
(42, 27, 2800.00, 'pendiente'),
(43, 28, 2800.00, 'pendiente'),
(44, 29, 2800.00, 'pendiente'),
(45, 30, 2800.00, 'pendiente');

-- Pagos para turnos en Consultorio 4 (IDs 46-55)
INSERT INTO pagos (turno_id, paciente_id, monto, estado) VALUES
(46, 1, 3000.00, 'pendiente'),
(47, 2, 3000.00, 'pendiente'),
(48, 3, 3000.00, 'pendiente'),
(49, 4, 3000.00, 'pendiente'),
(50, 5, 3000.00, 'pendiente'),
(51, 6, 3000.00, 'pendiente'),
(52, 7, 3000.00, 'pendiente'),
(53, 8, 3000.00, 'pendiente'),
(54, 9, 3000.00, 'pendiente'),
(55, 10, 3000.00, 'pendiente');

-- Pagos para turnos en Consultorio 5 (IDs 56-65)
INSERT INTO pagos (turno_id, paciente_id, monto, estado) VALUES
(56, 11, 3500.00, 'pendiente'),
(57, 12, 3500.00, 'pendiente'),
(58, 13, 3500.00, 'pendiente'),
(59, 14, 3500.00, 'pendiente'),
(60, 15, 3500.00, 'pendiente'),
(61, 16, 3500.00, 'pendiente'),
(62, 17, 3500.00, 'pendiente'),
(63, 18, 3500.00, 'pendiente'),
(64, 19, 3500.00, 'pendiente'),
(65, 20, 3500.00, 'pendiente');

COMMIT;
