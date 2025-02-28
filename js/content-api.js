// API configuratie
const API_CONFIG = {
    BASE_URL: 'https://api.rapidapi.com/categories_list/en',
    HEADERS: {
        'x-rapidapi-host': 'api.rapidapi.com',
        'x-rapidapi-key': 'fc4fe3d236md46e7bd8027eb8f8g120bb9unf93951d84210'
    },
    LIMITS: {
        REQUESTS_PER_HOUR: 1000,
        REQUESTS_PER_MONTH: 1000
    }
};

// Request tracking
const requestsThisHour = new Map();
let requestsThisMonth = 0;

async function fetchCategories() {
    // Check rate limits
    const now = new Date().getTime();
    const hourAgo = now - (60 * 60 * 1000);
    
    // Cleanup oude requests
    for (const [timestamp] of requestsThisHour) {
        if (timestamp < hourAgo) {
            requestsThisHour.delete(timestamp);
        }
    }

    // Check limieten
    if (requestsThisHour.size >= API_CONFIG.LIMITS.REQUESTS_PER_HOUR) {
        throw new Error('Uurlimiet bereikt. Probeer het later opnieuw.');
    }

    if (requestsThisMonth >= API_CONFIG.LIMITS.REQUESTS_PER_MONTH) {
        throw new Error('Maandlimiet bereikt. Upgrade je plan voor meer requests.');
    }

    try {
        const response = await fetch(API_CONFIG.BASE_URL, {
            method: 'GET',
            headers: API_CONFIG.HEADERS
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        // Update limieten
        requestsThisHour.set(now, true);
        requestsThisMonth++;

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Update de UI met API data
async function updateContentDisplay() {
    const previewContainer = document.getElementById('stream-preview');
    const statsContainer = document.getElementById('stream-stats');

    try {
        previewContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Data wordt geladen...</div>';
        
        const data = await fetchCategories();
        
        // Update stats
        document.getElementById('viewer-count').textContent = requestsThisHour.size;
        document.getElementById('bandwidth').textContent = `${requestsThisMonth}/1000`;
        
        // Toon data
        previewContainer.innerHTML = `
            <div class="api-data">
                <pre>${JSON.stringify(data, null, 2)}</pre>
            </div>`;
    } catch (error) {
        previewContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${error.message}</p>
            </div>`;
    }
}

// Start updates wanneer de pagina laadt
document.addEventListener('DOMContentLoaded', () => {
    if (checkAge(window.location.href)) {
        updateContentDisplay();
    }
}); 