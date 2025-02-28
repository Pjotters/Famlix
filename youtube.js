// Rate limiting variabelen voor YouTube downloads
const YT_REQUESTS_PER_HOUR = 1000;
const YT_REQUESTS_PER_MONTH = 100;
const ytRequestsThisHour = new Map();
let ytRequestsThisMonth = 0;

async function downloadVideo() {
    const url = document.getElementById('youtube-url').value;
    const resultDiv = document.getElementById('download-result');
    
    if (!url) {
        resultDiv.innerHTML = 'Voer een geldige YouTube URL in';
        return;
    }

    // Check uurlimiet
    const now = new Date().getTime();
    const hourAgo = now - (60 * 60 * 1000);
    
    // Verwijder oude requests
    for (const [timestamp] of ytRequestsThisHour) {
        if (timestamp < hourAgo) {
            ytRequestsThisHour.delete(timestamp);
        }
    }
    
    // Check limieten
    if (ytRequestsThisHour.size >= YT_REQUESTS_PER_HOUR) {
        resultDiv.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Te veel download-verzoeken in het afgelopen uur. Probeer het later opnieuw.</p>
            </div>`;
        return;
    }

    if (ytRequestsThisMonth >= YT_REQUESTS_PER_MONTH) {
        resultDiv.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Maandelijkse download-limiet bereikt. Wacht tot volgende maand of upgrade je plan.</p>
            </div>`;
        return;
    }

    // Voeg huidige request toe aan tellers
    ytRequestsThisHour.set(now, true);
    ytRequestsThisMonth++;

    const loadingSpinner = '<i class="fas fa-spinner fa-spin"></i> Video wordt voorbereid...';
    resultDiv.innerHTML = loadingSpinner;

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
        
        if (!data.formats || data.formats.length === 0) {
            throw new Error('Geen download formaten beschikbaar');
        }

        resultDiv.innerHTML = `
            <div class="download-options">
                <h3>Download opties:</h3>
                ${data.formats.map(format => `
                    <a href="${format.url}" class="download-btn" download target="_blank">
                        <i class="fas fa-download"></i> Download ${format.qualityLabel || 'Video'}
                    </a>
                `).join('')}
                <p class="downloads-remaining">Nog ${YT_REQUESTS_PER_MONTH - ytRequestsThisMonth} downloads over deze maand</p>
            </div>`;
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Er is een fout opgetreden: ${error.message}</p>
            </div>`;
    }
}

// Reset maandelijkse teller op de eerste dag van elke maand
function resetMonthlyCounter() {
    const today = new Date();
    if (today.getDate() === 1) {
        ytRequestsThisMonth = 0;
    }
}

// Check dagelijks voor reset
setInterval(resetMonthlyCounter, 24 * 60 * 60 * 1000); 