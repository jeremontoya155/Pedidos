document.addEventListener('DOMContentLoaded', () => {
    // Función para cargar todas las solicitudes desde el servidor con filtros aplicados
    const cargarTodasLasSolicitudes = async () => {
        // Obtiene los valores seleccionados de los controles de filtro
        const estado = document.getElementById('filtroEstado').value;
        const responsable = document.getElementById('filtroResponsable').value;
        const fechaInicio = document.getElementById('filtroFechaInicio').value;
        const fechaFin = document.getElementById('filtroFechaFin').value;

        // Construye la URL de la solicitud GET con los filtros aplicados
        let url = '/solicitudes';
        const params = new URLSearchParams();

        if (estado !== 'todos') {
            params.append('estado', estado);
        }
        if (responsable !== 'todos') {
            params.append('responsable', responsable);
        }
        if (fechaInicio) {
            params.append('fechaInicio', fechaInicio);
        }
        if (fechaFin) {
            params.append('fechaFin', fechaFin);
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Error al cargar las solicitudes');
            }
            const solicitudes = await response.json();
            mostrarSolicitudes(solicitudes);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Agregar event listeners para los controles de selección de filtro
    document.getElementById('filtroEstado').addEventListener('change', cargarTodasLasSolicitudes);
    document.getElementById('filtroResponsable').addEventListener('change', cargarTodasLasSolicitudes);
    document.getElementById('filtroFechaInicio').addEventListener('change', cargarTodasLasSolicitudes);
    document.getElementById('filtroFechaFin').addEventListener('change', cargarTodasLasSolicitudes);

    // Función para mostrar las solicitudes en la página
    const mostrarSolicitudes = (solicitudes) => {
        const listaSolicitudes = document.getElementById('solicitudes-lista');
        listaSolicitudes.innerHTML = ''; // Limpiar contenido anterior

        solicitudes.forEach((solicitud) => {
            const estadoTexto = solicitud.finalizado === 0 ? 'Pendiente' :
                                solicitud.finalizado === 1 ? 'En Curso' : 'Finalizado';

            // Determinar la clase de Bootstrap según el estado
            const estadoClase = estadoTexto === 'Pendiente' ? 'btn-warning' :
                                estadoTexto === 'En Curso' ? 'btn-primary' : 'btn-success';

            const solicitudCard = `
                <div class="col-md-4">
                    <div class="card mb-4 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${solicitud.nombre_solicitud}</h5>
                            <p class="card-text">${solicitud.descripcion_solicitud}</p>
                            <p class="card-text">Periodo: ${solicitud.periodo_tiempo}</p>
                            <p class="card-text">Mail asociado: ${solicitud.mail_asociado}</p>
                            <p class="card-text"><strong>Persona encargada: <span id="persona-encargada-${solicitud.id}">${solicitud.persona_encargada}</strong></span></p>
                            <p class="card-text">Fecha: ${solicitud.fecha}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="btn-group">
                                    <button type="button" class="btn btn-sm ${estadoClase} toggle-btn" data-id="${solicitud.id}">
                                        ${estadoTexto}
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline-secondary editar-btn" data-id="${solicitud.id}" data-toggle="modal" data-target="#editarModal">
                                        Editar
                                    </button>
                                </div>
                            </div>
                            <div class="mt-2">
                            <label for="responsable-${solicitud.id}">Cambiar responsable:</label>
                            <select id="responsable-${solicitud.id}" class="form-control">
                                <option value="" disabled selected>Seleccionar Responsable</option>
                                <option value="Jeremias">Jeremias</option>
                                <option value="Nahuel M">Nahuel M</option>
                                <option value="Nahuel R">Nahuel R</option>
                                <option value="Jordi">Jordi</option>
                            </select>
                                <button type="button" class="btn btn-sm btn-outline-secondary cambiar-responsable-btn mt-2" data-id="${solicitud.id}">
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            listaSolicitudes.innerHTML += solicitudCard;
        });

        // Agregar event listener para los botones de alternancia
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        toggleBtns.forEach((btn) => {
            btn.addEventListener('click', async () => {
                const solicitudId = btn.dataset.id;
                try {
                    const response = await fetch(`/toggle-finalizado/${solicitudId}`, {
                        method: 'PUT'
                    });
                    if (!response.ok) {
                        throw new Error('Error al cambiar el estado de la solicitud');
                    }
                    cargarTodasLasSolicitudes();
                } catch (error) {
                    console.error('Error:', error);
                }
            });
        });

        // Agregar event listener para los botones de editar
        const editarBtns = document.querySelectorAll('.editar-btn');
        editarBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const solicitudId = btn.dataset.id;
                const nuevaDescripcion = prompt("Introduce la nueva descripción:");
                if (nuevaDescripcion !== null && nuevaDescripcion !== "") {
                    editarSolicitud(solicitudId, nuevaDescripcion);
                }
            });
        });

        // Agregar event listener para los botones de cambiar responsable
        document.querySelectorAll('.cambiar-responsable-btn').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const solicitudId = btn.dataset.id;
                const select = document.getElementById(`responsable-${solicitudId}`);
                const nuevaPersonaEncargada = select.value;
                try {
                    const response = await fetch(`/cambiar-persona-encargada/${solicitudId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nuevaPersonaEncargada })
                    });
                    if (!response.ok) {
                        throw new Error('Error al cambiar la persona encargada de la solicitud');
                    }
                    document.getElementById(`persona-encargada-${solicitudId}`).innerText = nuevaPersonaEncargada;
                } catch (error) {
                    console.error('Error:', error);
                }
            });
        });
    };

    // Función para editar una solicitud existente
    const editarSolicitud = async (solicitudId, nuevaDescripcion) => {
        try {
            const response = await fetch(`/editar-solicitud/${solicitudId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nuevaDescripcion })
            });
            if (!response.ok) {
                throw new Error('Error al editar la solicitud');
            }
            cargarTodasLasSolicitudes();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al editar la solicitud. Por favor, inténtalo de nuevo más tarde.');
        }
    };

    // Cargar todas las solicitudes al cargar la página
    cargarTodasLasSolicitudes();
});
