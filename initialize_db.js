const sqlite3 = require('sqlite3').verbose();

// Crear o abrir la base de datos
const db = new sqlite3.Database('formulario.db');

// Crear tabla si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS solicitudes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_persona TEXT,
    nombre_solicitud TEXT,
    descripcion_solicitud TEXT,
    periodo_tiempo TEXT,
    mail_asociado TEXT,
    persona_encargada TEXT,
    finalizado INTEGER DEFAULT 0, -- Agregar el campo 'finalizado' con valor por defecto 0 (false)
    fecha DATE DEFAULT (DATE('now')) -- Agregar el campo 'fecha' con valor por defecto la fecha actual
  )`);

  // Insertar algunos datos de ejemplo
  const stmt = db.prepare(`INSERT INTO solicitudes (nombre_persona, nombre_solicitud, descripcion_solicitud, periodo_tiempo, mail_asociado, persona_encargada) VALUES (?, ?, ?, ?, ?, ?)`);
  
  stmt.run('Juan', 'Solicitud de presupuesto', 'Descripción de la solicitud 1', '2 semanas', 'juan@example.com', 'Jeremias');
  stmt.run('María', 'Solicitud de información', 'Descripción de la solicitud 2', '1 mes', 'maria@example.com', 'Jordi');
  stmt.run('Pedro', 'Solicitud de servicio', 'Descripción de la solicitud 3', '3 semanas', 'pedro@example.com', 'Nahuel R');
  stmt.run('Pedro', 'Solicitud de servicio', 'Descripción de la solicitud 4', '3 semanas', 'pedro@example.com', 'Nahuel M');

  stmt.finalize();
});

// Cerrar la conexión a la base de datos cuando hayamos terminado
db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Base de datos creada exitosamente.');
});
