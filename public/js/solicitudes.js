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
            // Aquí puedes mostrar un mensaje de error al usuario si lo deseas
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

            const solicitudCard = `
                <div class="col-md-4">
                    <div class="card mb-4 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${solicitud.nombre_solicitud}</h5>
                            <p class="card-text">${solicitud.descripcion_solicitud}</p>
                            <p class="card-text">Periodo: ${solicitud.periodo_tiempo}</p>
                            <p class="card-text">Mail asociado: ${solicitud.mail_asociado}</p>
                            <p class="card-text">Persona encargada: ${solicitud.persona_encargada}</p>
                            <p class="card-text">Fecha: ${solicitud.fecha}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="btn-group">
                                    <button type="button" class="btn btn-sm btn-outline-secondary toggle-btn" data-id="${solicitud.id}">
                                        ${estadoTexto}
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline-secondary editar-btn" data-id="${solicitud.id}" data-toggle="modal" data-target="#editarModal">
                                        Editar
                                    </button>
                                </div>
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
                    // Actualizar las solicitudes después de cambiar el estado
                    cargarTodasLasSolicitudes();
                } catch (error) {
                    console.error('Error:', error);
                    // Aquí puedes mostrar un mensaje de error al usuario si lo deseas
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
            // Actualizar las solicitudes después de editar
            cargarTodasLasSolicitudes();
        } catch (error) {
            console.error('Error:', error);
            // Aquí puedes mostrar un mensaje de error al usuario si lo deseas
            alert('Error al editar la solicitud. Por favor, inténtalo de nuevo más tarde.');
        }
    };

    // Cargar todas las solicitudes al cargar la página
    cargarTodasLasSolicitudes();
});
