const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 3000;

// Crear o abrir la base de datos
const dbPath = path.resolve(__dirname, 'formulario.db');
const db = new sqlite3.Database(dbPath);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Endpoint para manejar la solicitud de envío del formulario
app.post('/enviar-formulario', (req, res) => {
  const { nombre_persona, nombre_solicitud, descripcion_solicitud, periodo_tiempo, mail_asociado, persona_encargada } = req.body;

  // Verificar si todos los campos están presentes
  if (!nombre_persona || !nombre_solicitud || !descripcion_solicitud || !periodo_tiempo || !mail_asociado || !persona_encargada) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  // Insertar los datos en la base de datos
  const sql = `INSERT INTO solicitudes (nombre_persona, nombre_solicitud, descripcion_solicitud, periodo_tiempo, mail_asociado, persona_encargada) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [nombre_persona, nombre_solicitud, descripcion_solicitud, periodo_tiempo, mail_asociado, persona_encargada], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al insertar los datos en la base de datos.' });
    }
    console.log(`Nueva solicitud insertada con ID: ${this.lastID}`);
    res.status(200).json({ message: 'Solicitud enviada correctamente.' });
  });
});

// Endpoint para obtener todas las solicitudes con filtros aplicados
app.get('/solicitudes', (req, res) => {
  let sql = `SELECT * FROM solicitudes`;
  const params = [];

  const { estado, responsable, fechaInicio, fechaFin } = req.query;
  const filters = [];

  if (estado === 'pendiente') {
    filters.push(`finalizado = 0`);
  } else if (estado === 'curso') {
    filters.push(`finalizado = 1`);
  } else if (estado === 'finalizado') {
    filters.push(`finalizado = 2`);
  }
  
  if (responsable && responsable !== 'todos') {
    filters.push(`persona_encargada = ?`);
    params.push(responsable);
  }

  if (fechaInicio) {
    filters.push(`fecha >= ?`);
    params.push(fechaInicio);
  }

  if (fechaFin) {
    filters.push(`fecha <= ?`);
    params.push(fechaFin);
  }

  if (filters.length > 0) {
    sql += ` WHERE ` + filters.join(' AND ');
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener las solicitudes.' });
    }
    res.json(rows);
  });
});

// Endpoint para editar una solicitud existente
app.put('/editar-solicitud/:id', (req, res) => {
  const { id } = req.params;
  const { nuevaDescripcion } = req.body;

  // Verificar si la nueva descripción está presente
  if (!nuevaDescripcion) {
    return res.status(400).json({ error: 'La nueva descripción es requerida.' });
  }

  // Actualizar la descripción de la solicitud en la base de datos
  const sql = `UPDATE solicitudes SET descripcion_solicitud = ? WHERE id = ?`;
  db.run(sql, [nuevaDescripcion, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al actualizar la solicitud en la base de datos.' });
    }
    res.status(200).json({ message: 'Solicitud actualizada correctamente.' });
  });
});

// Endpoint para cambiar el estado de una solicitud
app.put('/toggle-finalizado/:id', (req, res) => {
  const { id } = req.params;

  // Verificar si el ID de la solicitud es válido
  if (!id) {
    return res.status(400).json({ error: 'ID de solicitud inválido.' });
  }

  // Verificar si la solicitud existe en la base de datos
  const sqlCheck = `SELECT * FROM solicitudes WHERE id = ?`;
  db.get(sqlCheck, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error al buscar la solicitud en la base de datos.' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Solicitud no encontrada.' });
    }

    // Cambiar el estado de la solicitud
    const nuevoEstado = (row.finalizado + 1) % 3; // Alternar entre 0, 1 y 2
    const sqlUpdate = `UPDATE solicitudes SET finalizado = ? WHERE id = ?`;
    db.run(sqlUpdate, [nuevoEstado, id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al cambiar el estado de la solicitud en la base de datos.' });
      }
      res.sendStatus(200); // Envía una respuesta exitosa
    });
  });
});

// Endpoint para obtener solicitudes completadas
app.get('/solicitudes-completadas', (req, res) => {
  const sql = `SELECT * FROM solicitudes WHERE finalizado = 2`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener las solicitudes completadas.' });
    }
    res.status(200).json(rows);
  });
});


// Endpoint para manejar el inicio de sesión
app.post('/login', (req, res) => {
  let redirectPage;
  const { username, password } = req.body;
  
  db.get("SELECT * FROM usuarios WHERE usuario = ? AND contraseña = ?", [username, password], (err, row) => {
      if (err) {
          res.status(500).json({ success: false, message: "Internal server error" });
      } else if (row) {
          redirectPage = 'formulario.html'; // Por defecto redirige a formulario.html
          if (row.rol === 'administrador') { // Aquí se cambia de 'usaurio' a 'rol'
               redirectPage = 'solicitudes.html'; // Si es administrador, redirige a solicitud.html
          }
          res.json({ success: true, message: "Login successful", redirect: redirectPage });
      } else {
          res.json({ success: false, message: "Invalid username or password" });
      }
  });
});


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
