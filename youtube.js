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
        // Nieuwe API endpoint met searchParams
        const videoId = extractVideoId(url);
        if (!videoId) {
            throw new Error('Ongeldige YouTube URL');
        }

        const apiUrl = new URL('https://youtube-video-download-info.p.rapidapi.com/dl');
        apiUrl.searchParams.append('id', videoId);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'fe4fe3d236msh46e7bd6b07ee898p1205b9jsnf93951d84210',
                'X-RapidAPI-Host': 'youtube-video-download-info.p.rapidapi.com'
            }
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
                            (${format.ext || 'mp4'})
                        </a>
                    `).join('')}
                </div>
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

// Helper functie om video ID uit URL te halen
function extractVideoId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
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

// Voeg event listener toe voor enter toets
document.getElementById('youtube-url')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        downloadVideo();
    }
}); 