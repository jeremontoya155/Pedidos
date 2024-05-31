async function login(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            window.location.href = result.redirect;
        } else {
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = result.error || 'Error de inicio de sesión';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = 'Ocurrió un error durante el inicio de sesión.';
        errorMessage.style.display = 'block';
    }
}
