//Tabla sesion
const sqlite3 = require('sqlite3').verbose();

// Crear o abrir la base de datos
const db = new sqlite3.Database('formulario.db');

// Crear tabla si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS sesiones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_sesion TEXT NOT NULL,
    id_usuario INTEGER NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
  )`, (err) => {
    if (err) {
      console.error('Error al crear la tabla de sesiones:', err.message);
    } else {
      console.log('Tabla de sesiones creada exitosamente.');
    }
  });
});

// Cerrar la conexión a la base de datos cuando hayamos terminado
db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Conexión a la base de datos cerrada.');
});
