-- addInitialPayments.sql
-- Agrega un pago pendiente para los turnos originales de 2025-09-11 y 2025-09-12.

USE estimular;

START TRANSACTION;

-- Pagos para turnos del 11/09/2025 (IDs 1-12)
INSERT INTO pagos (turno_id, paciente_id, monto, estado) VALUES
(1, 1, 2500.00, 'pendiente'),
(2, 2, 2200.00, 'pendiente'),
(3, 3, 3500.00, 'pendiente'),
(4, 4, 3000.00, 'pendiente'),
(5, 5, 2800.00, 'pendiente'),
(6, 6, 2200.00, 'pendiente'),
(7, 7, 2500.00, 'pendiente'),
(8, 8, 3000.00, 'pendiente'),
(9, 9, 4000.00, 'pendiente'), -- Taller Grupal
(10, 10, 2800.00, 'pendiente'),
(11, 11, 2500.00, 'pendiente'),
(12, 12, 2200.00, 'pendiente');

-- Pagos para turnos del 12/09/2025 (IDs 13-15)
INSERT INTO pagos (turno_id, paciente_id, monto, estado) VALUES
(13, 13, 3000.00, 'pendiente'),
(14, 14, 2800.00, 'pendiente'),
(15, 15, 2500.00, 'pendiente');

COMMIT;
