// Functie voor het afspelen van audio
function playAudio() {
    var audio = new Audio('css/Audio/ZipZop/ZipZop.mp3');
    audio.play().catch(function(error) {
        console.log("Audio playback failed");
    });
}

// YouTube download functionaliteit
async function downloadVideo() {
    const url = document.getElementById('youtube-url').value;
    const resultDiv = document.getElementById('download-result');
    
    if (!url) {
        resultDiv.innerHTML = 'Voer een geldige YouTube URL in';
        return;
    }

    try {
        const response = await fetch('https://youtube-media-downloader.p.rapidapi.com/v2/video/details', {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'X-RapidAPI-Key': 'fe4fe3d236msh46e7bd6b07ee898p1205b9jsnf93951d84210',
                'X-RapidAPI-Host': 'youtube-media-downloader.p.rapidapi.com'
            },
            body: new URLSearchParams({
                'url': url
            })
        });
        
        const data = await response.json();
        resultDiv.innerHTML = `
            <div class="download-options">
                <h3>Download opties:</h3>
                <a href="${data.downloadUrl}" class="download-btn" download>
                    <i class="fas fa-download"></i> Download Video
                </a>
            </div>`;
    } catch (error) {
        resultDiv.innerHTML = 'Er is een fout opgetreden bij het downloaden.';
    }
}

// IP wijzigings functionaliteit
async function changeIP() {
    const ipDiv = document.getElementById('current-ip');
    const loadingSpinner = '<i class="fas fa-spinner fa-spin"></i> IP wordt gewijzigd...';
    
    ipDiv.innerHTML = loadingSpinner;
    
    try {
        const response = await fetch('https://free-vpn.p.rapidapi.com/get_vpn_data', {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'fe4fe3d236msh46e7bd6b07ee898p1205b9jsnf93951d84210',
                'X-RapidAPI-Host': 'free-vpn.p.rapidapi.com'
            }
        });
        
        const data = await response.json();
        
        // Controleer of we VPN data hebben ontvangen
        if (data && data.vpn_servers && data.vpn_servers.length > 0) {
            const server = data.vpn_servers[0]; // Gebruik de eerste beschikbare server
            
            ipDiv.innerHTML = `
                <div class="ip-status success">
                    <i class="fas fa-check-circle"></i>
                    <p>VPN Server gevonden:</p>
                    <ul>
                        <li>IP: ${server.ip}</li>
                        <li>Land: ${server.country}</li>
                        <li>Snelheid: ${server.speed} Mbps</li>
                    </ul>
                </div>`;
        } else {
            throw new Error('Geen VPN servers beschikbaar');
        }
    } catch (error) {
        ipDiv.innerHTML = `
            <div class="ip-status error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Er is een fout opgetreden bij het ophalen van VPN servers: ${error.message}</p>
            </div>`;
    }
}

// Toon het huidige IP bij het laden van de pagina
window.onload = async function() {
    const ipDiv = document.getElementById('current-ip');
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ipDiv.innerHTML = `
            <div class="ip-status">
                <i class="fas fa-info-circle"></i>
                <p>Huidig IP: ${data.ip}</p>
            </div>`;
    } catch (error) {
        ipDiv.innerHTML = `
            <div class="ip-status error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Kan huidig IP-adres niet ophalen</p>
            </div>`;
    }
}

// Event listeners voor smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
}); 