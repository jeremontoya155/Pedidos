
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path'); // También necesitas importar 'path' si estás utilizando el método 'path.join()' más adelante


const app = express();
const PORT = 3000;

// Crear o abrir la base de datos
const dbPath = path.resolve(__dirname, 'formulario.db');
const db = new sqlite3.Database(dbPath);

app.use(express.static(path.join(__dirname, 'public')));
// Middleware para analizar solicitudes JSON
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

// Endpoint para obtener todas las solicitudes
// Endpoint para obtener todas las solicitudes con filtros aplicados
app.get('/solicitudes', (req, res) => {
  let sql = `SELECT * FROM solicitudes`;

  // Obtener parámetros de consulta para filtros
  const { estado, responsable } = req.query;

  // Construir la cláusula WHERE según los filtros seleccionados
  let whereClause = '';
  if (estado && estado !== 'todos') {
      whereClause += `finalizado = ${estado === 'finalizado' ? 1 : 0}`;
  }
  if (responsable && responsable !== 'todos') {
      if (whereClause) whereClause += ' AND ';
      whereClause += `persona_encargada = '${responsable}'`;
  }
  if (whereClause) {
      sql += ` WHERE ${whereClause}`;
  }

  db.all(sql, [], (err, rows) => {
      if (err) {
          return res.status(500).json({ error: 'Error al obtener las solicitudes.' });
      }
      res.status(200).json(rows);
  });
});


// Endpoint para editar una solicitud existente


// Endpoint para obtener solicitudes completadas
app.get('/solicitudes-completadas', (req, res) => {
    const sql = `SELECT * FROM solicitudes WHERE finalizado=1 `;
  
    db.all(sql, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener las solicitudes completadas.' });
      }
      res.status(200).json(rows);
    });
  });

  // Endpoint para obtener todas las solicitudes
app.get('/solicitudes', (req, res) => {
    const sql = `SELECT * FROM solicitudes`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener las solicitudes.' });
        }
        res.status(200).json(rows);
    });
});

  
// Endpoint para cambiar el estado de una solicitud
// Endpoint para cambiar el estado de una solicitud
// Endpoint para cambiar el estado de una solicitud
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
      const nuevoEstado = !row.finalizado; // Cambiar el estado actual
      const sqlUpdate = `UPDATE solicitudes SET finalizado = ? WHERE id = ?`;
      db.run(sqlUpdate, [nuevoEstado, id], (err) => {
          if (err) {
              return res.status(500).json({ error: 'Error al cambiar el estado de la solicitud en la base de datos.' });
          }
          res.sendStatus(200); // Envía una respuesta exitosa
      });
  });
});


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
