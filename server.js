const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const cookieParser = require('cookie-parser'); // Agregar cookie-parser
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000; // Usar el puerto de la variable de entorno o 3000 por defecto

// Crear o abrir la base de datos
const dbPath = path.resolve(__dirname, 'formulario.db');
const db = new sqlite3.Database(dbPath);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(cookieParser()); // Usar cookie-parser


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

// Endpoint para cambiar la persona encargada de una solicitud
// Ruta para cambiar la persona encargada de una solicitud
app.put('/cambiar-persona-encargada/:id', (req, res) => {
  const idSolicitud = req.params.id;
  const nuevaPersonaEncargada = req.body.nuevaPersonaEncargada;

  // Abrir la base de datos
  const db = new sqlite3.Database('formulario.db');

  // Actualizar la persona encargada de la solicitud en la base de datos
  db.run('UPDATE solicitudes SET persona_encargada = ? WHERE id = ?', [nuevaPersonaEncargada, idSolicitud], (err) => {
      // Cerrar la conexión a la base de datos
      db.close();

      if (err) {
          console.error('Error al cambiar la persona encargada:', err);
          res.status(500).send('Error al cambiar la persona encargada de la solicitud');
      } else {
          res.status(200).send('Persona encargada cambiada exitosamente');
      }
  });
});


app.get('/attentions', (req, res) => {
  const sql = 'SELECT persona_encargada, COUNT(*) as atenciones FROM solicitudes GROUP BY persona_encargada';
  db.all(sql, [], (err, rows) => {
      if (err) {
          console.error('Error al obtener los datos de atenciones:', err.message);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }
      console.log('Datos de atenciones obtenidos:', rows);
      res.json(rows);
  });
});

app.get('/requests', (req, res) => {
  const sql = 'SELECT finalizado, COUNT(*) as solicitudes FROM solicitudes GROUP BY finalizado';
  db.all(sql, [], (err, rows) => {
      if (err) {
          console.error('Error al obtener los datos de solicitudes:', err.message);
          return res.status(500).json({ error: 'Error interno del servidor' });
      }
      console.log('Datos de solicitudes obtenidos:', rows);
      res.json(rows);
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


// Endpoint para obtener el nombre de usuario
// Función para generar un ID de sesión único
function generateSessionId() {
  // Generar un ID de sesión aleatorio utilizando una combinación de caracteres alfanuméricos aleatorios
  const sessionIdLength = 20; // Longitud del ID de sesión
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; // Caracteres permitidos
  let sessionId = ''; // ID de sesión generado
  
  for (let i = 0; i < sessionIdLength; i++) {
    sessionId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return sessionId;
}

// Función para guardar el ID de sesión en la base de datos
function saveSessionInDatabase(sessionId, userId) {
  // Insertar el ID de sesión y el ID del usuario en la tabla de sesiones
  const sql = `INSERT INTO sesiones (id_sesion, id_usuario) VALUES (?, ?)`;
  db.run(sql, [sessionId, userId], function(err) {
    if (err) {
      console.error('Error al guardar la sesión en la base de datos:', err);
    } else {
      console.log('Sesión guardada en la base de datos correctamente.');
    }
  });
}

// Endpoint para obtener el nombre de usuario asociado a la sesión actual
app.get('/username', (req, res) => {
  const sessionId = req.cookies.sessionId;

  // Consultar la base de datos para obtener el nombre de usuario asociado al ID de sesión
  db.get("SELECT usuario FROM usuarios WHERE id = (SELECT id_usuario FROM sesiones WHERE id_sesion = ?)", [sessionId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!row) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Si se encuentra el nombre de usuario, devolverlo en la respuesta
    res.json({ username: row.usuario });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Verificar si el usuario existe en la base de datos
  const sql = 'SELECT * FROM usuarios WHERE usuario = ?';
  db.get(sql, [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Comparar la contraseña proporcionada con la contraseña almacenada en la base de datos
    if (password === user.contraseña) {
      // Generar un ID de sesión único
      const sessionId = generateSessionId();
      // Guardar el ID de sesión en la base de datos
      saveSessionInDatabase(sessionId, user.id);
      // Establecer una cookie con el ID de sesión
      res.cookie('sessionId', sessionId, { httpOnly: true });

      // Redirigir según el rol del usuario
      if (user.usuario === 'admin') {
        res.json({ redirect: 'solicitudes.html' });
      } else {
        res.json({ redirect: 'formulario.html' }); // Cambiar a la página que corresponda para otros usuarios
      }
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  });
});


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
