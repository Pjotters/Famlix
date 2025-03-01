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

    const loadingSpinner = '<i class="fas fa-spinner fa-spin"></i> Video wordt voorbereid...';
    resultDiv.innerHTML = loadingSpinner;

    try {
        // Aangepaste endpoint URL
        const response = await fetch('https://youtube-media-downloader.p.rapidapi.com/v2/video/info', {
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

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data); // Debug logging
        
        if (!data || !data.formats) {
            throw new Error('Geen download formaten beschikbaar');
        }

        resultDiv.innerHTML = `
            <div class="download-options">
                <h3>Download opties:</h3>
                <div class="format-list">
                    ${data.formats.map(format => `
                        <a href="${format.url}" class="download-btn" download target="_blank">
                            <i class="fas fa-download"></i> 
                            ${format.quality || 'Standaard'} 
                            (${format.extension || 'mp4'})
                        </a>
                    `).join('')}
                </div>
                <p class="downloads-remaining">Nog ${YT_REQUESTS_PER_MONTH - ytRequestsThisMonth} downloads over deze maand</p>
            </div>`;
    } catch (error) {
        console.error('Download error:', error);
        resultDiv.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Er is een fout opgetreden: ${error.message}</p>
                <small>Controleer of de YouTube URL correct is</small>
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