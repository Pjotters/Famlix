async function searchMovies() {
    const searchInput = document.getElementById('movie-search').value;
    const moviesGrid = document.getElementById('movies-grid');
    
    try {
        const response = await fetch(`https://moviedatabase.p.rapidapi.com/titles?query=${encodeURIComponent(searchInput)}`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'fe4fe3d236msh46e7bd6b07ee898p1205b9jsnf93951d84210',
                'X-RapidAPI-Host': 'moviedatabase.p.rapidapi.com'
            }
        });
        
        const data = await response.json();
        
        moviesGrid.innerHTML = data.results.map(movie => `
            <div class="movie-card">
                <img src="${movie.posterUrl || 'images/no-poster.jpg'}" alt="${movie.title}" class="movie-poster">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-year">${movie.year || 'Onbekend jaar'}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        moviesGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Er is een fout opgetreden bij het zoeken naar films: ${error.message}</p>
            </div>`;
    }
} 