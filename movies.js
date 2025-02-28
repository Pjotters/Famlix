// Rate limiting variabelen
const REQUESTS_PER_HOUR = 1000;
const requestsThisHour = new Map();

async function searchMovies() {
    const searchInput = document.getElementById('movie-search').value;
    const moviesGrid = document.getElementById('movies-grid');

    if (!searchInput) {
        moviesGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-info-circle"></i>
                <p>Voer een zoekterm in</p>
            </div>`;
        return;
    }

    // Check rate limiting
    const now = new Date().getTime();
    const hourAgo = now - (60 * 60 * 1000);
    
    // Verwijder oude requests
    for (const [timestamp] of requestsThisHour) {
        if (timestamp < hourAgo) {
            requestsThisHour.delete(timestamp);
        }
    }
    
    // Check of we de limiet hebben bereikt
    if (requestsThisHour.size >= REQUESTS_PER_HOUR) {
        moviesGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Te veel zoekopdrachten in het afgelopen uur. Probeer het later opnieuw.</p>
            </div>`;
        return;
    }
    
    // Voeg huidige request toe
    requestsThisHour.set(now, true);

    // Toon loading state
    moviesGrid.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Films worden geladen...</p>
        </div>`;
    
    try {
        const response = await fetch(`https://moviedatabase.p.rapidapi.com/titles?query=${encodeURIComponent(searchInput)}`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'fe4fe3d236msh46e7bd6b07ee898p1205b9jsnf93951d84210',
                'X-RapidAPI-Host': 'moviedatabase.p.rapidapi.com'
            }
        });
        
        // Controleer de remaining requests header
        const remainingRequests = response.headers.get('X-RateLimit-Remaining');
        if (remainingRequests && parseInt(remainingRequests) < 100) {
            console.warn(`Nog maar ${remainingRequests} requests over deze maand`);
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            moviesGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-search"></i>
                    <p>Geen films gevonden voor "${searchInput}"</p>
                </div>`;
            return;
        }
        
        moviesGrid.innerHTML = data.results.map(movie => `
            <div class="movie-card">
                <img src="${movie.primaryImage?.url || 'images/no-poster.jpg'}" 
                     alt="${movie.titleText.text}" 
                     class="movie-poster">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.titleText.text}</h3>
                    <p class="movie-year">${movie.releaseYear?.year || 'Jaar onbekend'}</p>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        moviesGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Er is een fout opgetreden: ${error.message}</p>
            </div>`;
    }
}