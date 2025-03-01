document.getElementById('download-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const url = document.getElementById('url').value;

    fetch('https://jouwserver.com/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url })
    })
    .then(response => response.json())
    .then(data => {
        const message = document.getElementById('message');
        if (data.downloadLink) {
            message.textContent = `Download link: ${data.downloadLink}`;
        } else {
            message.textContent = 'Er is een fout opgetreden bij het downloaden van de video.';
        }
    })
    .catch(error => {
        const message = document.getElementById('message');
        message.textContent = 'Er is een fout opgetreden: ' + error.message;
    });
});
