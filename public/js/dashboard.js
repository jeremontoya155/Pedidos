document.addEventListener('DOMContentLoaded', function() {
    // Obtener el nombre de usuario
    fetch('/username')
        .then(response => response.json())
        .then(data => {
            const usernameElement = document.getElementById('username');
            if (usernameElement) {
                usernameElement.textContent = data.username;
            }
        })
        .catch(error => console.error('Error obteniendo el nombre de usuario:', error));

    // Obtener datos de atenciones por persona encargada
    fetch('/attentions')
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error('Formato de datos incorrecto para atenciones');
            }
            const ctx = document.getElementById('attentionsChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(item => item.persona_encargada),
                    datasets: [{
                        label: 'Atenciones',
                        data: data.map(item => item.atenciones),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    maintainAspectRatio: false, // Desactiva el mantenimiento del aspecto original
                    responsive: true, // Permite que el gráfico sea responsivo
                   
                    layout: {
                        padding: {
                            top: 20 // Ajusta el espaciado superior del gráfico
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Error obteniendo los datos de atenciones:', error));

    // Obtener datos de solicitudes por estado
    fetch('/requests')
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error('Formato de datos incorrecto para solicitudes');
            }
            const ctx = document.getElementById('requestsChart').getContext('2d');
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: data.map(item => item.finalizado === 0 ? 'Pendiente' : 'Finalizado'),
                    datasets: [{
                        label: 'Solicitudes',
                        data: data.map(item => item.solicitudes),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)'
                        ],
                        borderWidth: 1
                    }]
                }
            });
        })
        .catch(error => console.error('Error obteniendo los datos de solicitudes:', error));
});
