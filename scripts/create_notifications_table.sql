-- create_notifications_table.sql (Corrected)

USE estimular;

CREATE TABLE IF NOT EXISTS notificaciones (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  profesional_id INT NOT NULL,
  mensaje VARCHAR(255) NOT NULL,
  turno_id BIGINT NULL, -- Opcional, para enlazar la notificación a un turno específico
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profesional_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE SET NULL
) ENGINE=InnoDB;