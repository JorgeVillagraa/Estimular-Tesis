-- moreSampleData.sql
-- Populates the database with a high density of appointments for 2025-09-16.

USE estimular;

START TRANSACTION;

-- Turnos para el Consultorio 1
SET @consultorio_id = 1;
SET @profesional_id = 1;
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (1, 1, '2025-09-16 09:00:00', '2025-09-16 09:45:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (2, 1, '2025-09-16 09:45:00', '2025-09-16 10:30:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (3, 1, '2025-09-16 10:30:00', '2025-09-16 11:15:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (4, 1, '2025-09-16 11:15:00', '2025-09-16 12:00:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (5, 1, '2025-09-16 12:00:00', '2025-09-16 12:45:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
SET @profesional_id = 5;
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (6, 1, '2025-09-16 14:00:00', '2025-09-16 14:45:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (7, 1, '2025-09-16 14:45:00', '2025-09-16 15:30:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (8, 1, '2025-09-16 15:30:00', '2025-09-16 16:15:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (9, 1, '2025-09-16 16:15:00', '2025-09-16 17:00:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (10, 1, '2025-09-16 17:00:00', '2025-09-16 17:45:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);

-- Turnos para el Consultorio 2
SET @consultorio_id = 2;
SET @profesional_id = 2;
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (11, 2, '2025-09-16 09:00:00', '2025-09-16 09:45:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (12, 2, '2025-09-16 09:45:00', '2025-09-16 10:30:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (13, 2, '2025-09-16 10:30:00', '2025-09-16 11:15:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (14, 2, '2025-09-16 11:15:00', '2025-09-16 12:00:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (15, 2, '2025-09-16 12:00:00', '2025-09-16 12:45:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
SET @profesional_id = 6;
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (16, 2, '2025-09-16 14:00:00', '2025-09-16 14:45:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (17, 2, '2025-09-16 14:45:00', '2025-09-16 15:30:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (18, 2, '2025-09-16 15:30:00', '2025-09-16 16:15:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (19, 2, '2025-09-16 16:15:00', '2025-09-16 17:00:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (20, 2, '2025-09-16 17:00:00', '2025-09-16 17:45:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);

-- Turnos para el Consultorio 3
SET @consultorio_id = 3;
SET @profesional_id = 3;
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (21, 4, '2025-09-16 09:00:00', '2025-09-16 09:45:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (22, 4, '2025-09-16 09:45:00', '2025-09-16 10:30:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (23, 4, '2025-09-16 10:30:00', '2025-09-16 11:15:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (24, 4, '2025-09-16 11:15:00', '2025-09-16 12:00:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (25, 4, '2025-09-16 12:00:00', '2025-09-16 12:45:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
SET @profesional_id = 7;
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (26, 4, '2025-09-16 14:00:00', '2025-09-16 14:45:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (27, 4, '2025-09-16 14:45:00', '2025-09-16 15:30:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (28, 4, '2025-09-16 15:30:00', '2025-09-16 16:15:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (29, 4, '2025-09-16 16:15:00', '2025-09-16 17:00:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (30, 4, '2025-09-16 17:00:00', '2025-09-16 17:45:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);

-- Turnos para el Consultorio 4
SET @consultorio_id = 4;
SET @profesional_id = 4;
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (1, 3, '2025-09-16 09:00:00', '2025-09-16 09:45:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (2, 3, '2025-09-16 09:45:00', '2025-09-16 10:30:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (3, 3, '2025-09-16 10:30:00', '2025-09-16 11:15:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (4, 3, '2025-09-16 11:15:00', '2025-09-16 12:00:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (5, 3, '2025-09-16 12:00:00', '2025-09-16 12:45:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
SET @profesional_id = 8;
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (6, 3, '2025-09-16 14:00:00', '2025-09-16 14:45:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (7, 3, '2025-09-16 14:45:00', '2025-09-16 15:30:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (8, 3, '2025-09-16 15:30:00', '2025-09-16 16:15:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (9, 3, '2025-09-16 16:15:00', '2025-09-16 17:00:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (10, 3, '2025-09-16 17:00:00', '2025-09-16 17:45:00', 45, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);

-- Turnos para el Consultorio 5
SET @consultorio_id = 5;
SET @profesional_id = 9;
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (11, 5, '2025-09-16 09:00:00', '2025-09-16 10:00:00', 60, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (12, 5, '2025-09-16 10:00:00', '2025-09-16 11:00:00', 60, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (13, 5, '2025-09-16 11:00:00', '2025-09-16 12:00:00', 60, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (14, 5, '2025-09-16 12:00:00', '2025-09-16 13:00:00', 60, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
SET @profesional_id = 13;
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (15, 5, '2025-09-16 14:00:00', '2025-09-16 15:00:00', 60, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (16, 5, '2025-09-16 15:00:00', '2025-09-16 16:00:00', 60, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (17, 5, '2025-09-16 16:00:00', '2025-09-16 17:00:00', 60, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (18, 5, '2025-09-16 17:00:00', '2025-09-16 18:00:00', 60, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (19, 5, '2025-09-16 18:00:00', '2025-09-16 19:00:00', 60, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);
INSERT INTO turnos (paciente_id, servicio_id, inicio, fin, duracion_min, consultorio_id, estado) VALUES (20, 5, '2025-09-16 19:00:00', '2025-09-16 20:00:00', 60, @consultorio_id, 'confirmado');
INSERT INTO turno_profesionales (turno_id, profesional_id) VALUES (LAST_INSERT_ID(), @profesional_id);

-- Add more for other consultorios...

COMMIT;
