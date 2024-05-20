const sqlite3 = require('sqlite3').verbose();

// Crear o abrir la base de datos
const db = new sqlite3.Database('formulario.db');

// Crear tabla de usuarios si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT NOT NULL UNIQUE,
    contraseña TEXT NOT NULL,
    rol TEXT NOT NULL
  )`);

  // Insertar usuarios administradores
  db.run(`INSERT INTO usuarios (usuario, contraseña, rol) VALUES ('admin', 'Contraseña2023', 'administrador')`);

  // Insertar usuarios con rol usuario
  const roles = ['RRHH', 'Cajas', 'Compras', 'Supervisores', 'Gerencia', 'Marketing', 'Obras Sociales'];
  roles.forEach((rol) => {
    const usuario = rol.toLowerCase();
    const contraseña = usuario + '123';
    db.run(`INSERT INTO usuarios (usuario, contraseña, rol) VALUES (?, ?, ?)`, [usuario, contraseña, 'usuario']);
  });

  console.log('Tabla de usuarios creada y usuarios insertados con éxito.');
});

// Cerrar la conexión a la base de datos cuando hayamos terminado
db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Base de datos creada exitosamente.');
});
