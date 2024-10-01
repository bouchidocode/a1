async function startRegistration() {
    const apiKey = document.getElementById('apiKey').value;
    if (!apiKey) {
        alert('Please enter an API key.');
        return;
    }

    const logElement = document.getElementById('log');
    logElement.innerHTML = '';  // Clear the log before starting

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ apiKey })
        });

        const result = await response.json();
        Object.entries(result).forEach(([slug, status]) => {
            const logItem = document.createElement('div');
            logItem.classList.add('log-item');
            logItem.classList.add(status === 'Success' ? 'success' : 'failed');
            logItem.textContent = `${slug}: ${status}`;
            logElement.appendChild(logItem);
        });
    } catch (error) {
        alert('An error occurred while fetching raffles.');
        console.error(error);
    }
}
