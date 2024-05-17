document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('miFormulario');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const data = {};

        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        try {
            const response = await fetch('/enviar-formulario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Error al enviar el formulario');
            }

            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'La solicitud se ha enviado correctamente.'
            }).then(() => {
                // Limpiar el formulario después de enviarlo
                form.reset();
            });
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al enviar la solicitud.'
            });
        }
    });
});
