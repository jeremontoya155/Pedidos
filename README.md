  <header>
    <h1>Gestor de Solicitudes</h1>
  </header>

  <section>
    <h2>Instalación</h2>
    <p>1. Clona o descarga este repositorio en tu máquina local.</p>
    <p>2. Asegúrate de tener Node.js y npm instalados en tu sistema.</p>
    <p>3. Abre una terminal en la carpeta del proyecto y ejecuta el siguiente comando para instalar las dependencias:</p>
    <pre><code>npm install</code></pre>
  </section>

  <section>
    <h2>Uso</h2>
    <p>1. Ejecuta la aplicación con el siguiente comando:</p>
    <pre><code>npm start</code></pre>
    <p>2. La aplicación estará disponible en <strong>http://localhost:3000</strong>.</p>
    <p>3. Navega a <strong>http://localhost:3000/formulario.html</strong> para acceder al formulario de envío de solicitudes.</p>
    <p>4. Navega a <strong>http://localhost:3000/solicitudes.html</strong> para ver todas las solicitudes y aplicar filtros.</p>
  </section>

  <section>
    <h2>Endpoints API</h2>

    <article>
      <h3><code>POST /enviar-formulario</code></h3>
      <p>Envía un formulario de solicitud.</p>
    </article>

    <article>
      <h3><code>GET /solicitudes</code></h3>
      <p>Obtiene todas las solicitudes.</p>
      <p>Parámetros de consulta:</p>
      <ul>
        <li><strong>estado</strong>: Filtra por estado de la solicitud ('pendiente' o 'finalizado').</li>
        <li><strong>responsable</strong>: Filtra por persona responsable de la solicitud.</li>
      </ul>
    </article>

    <article>
      <h3><code>GET /solicitudes-completadas</code></h3>
      <p>Obtiene todas las solicitudes finalizadas.</p>
    </article>

    <article>
      <h3><code>PUT /editar-solicitud/:id</code></h3>
      <p>Edita una solicitud existente.</p>
      <p>Parámetros:</p>
      <ul>
        <li><strong>id</strong>: ID de la solicitud.</li>
      </ul>
      <p>Cuerpo:</p>
      <ul>
        <li><strong>nuevaDescripcion</strong>: Nueva descripción de la solicitud.</li>
      </ul>
    </article>

    <article>
      <h3><code>PUT /toggle-finalizado/:id</code></h3>
      <p>Cambia el estado de una solicitud entre pendiente y finalizado.</p>
      <p>Parámetros:</p>
      <ul>
        <li><strong>id</strong>: ID de la solicitud.</li>
      </ul>
    </article>

  </section>

  <section>
    <h2>Estructura del Proyecto</h2>
    <ul>
      <li><strong>server.js</strong>: Archivo principal de la aplicación.</li>
      <li><strong>public</strong>: Carpeta que contiene archivos estáticos como HTML, CSS y JavaScript.</li>
      <li><strong>routes</strong>: Carpeta que contiene archivos de rutas para manejar las solicitudes HTTP.</li>
      <li><strong>db</strong>: Carpeta que contiene la base de datos SQLite3.</li>
      <li><strong>README.md</strong>: Documentación del proyecto.</li>
    </ul>
  </section>

  <section>
    <h2>Contribución</h2>
    <p>Si encuentras algún problema o tienes alguna sugerencia para mejorar el proyecto, ¡siéntete libre de abrir un issue o enviar un pull request!</p>
  </section>
