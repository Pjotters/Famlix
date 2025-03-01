// Controleer leeftijd bij laden van de pagina
if (!checkAge(window.location.href)) {
    throw new Error("Age verification required");
}

// API configuratie
const API_CONFIG = {
    BASE_URL: 'https://pornhub-api.p.rapidapi.com/categories_list/en',
    HEADERS: {
        'x-rapidapi-key': 'fc4fe3d236md46e7bd8027eb8f8g120bb9unf93951d84210',
        'x-rapidapi-host': 'pornhub-api.p.rapidapi.com'
    }
};

async function fetchCategories() {
    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error('API request failed'));
                }
            }
        };

        xhr.open('GET', API_CONFIG.BASE_URL);
        xhr.setRequestHeader('x-rapidapi-key', API_CONFIG.HEADERS['x-rapidapi-key']);
        xhr.setRequestHeader('x-rapidapi-host', API_CONFIG.HEADERS['x-rapidapi-host']);
        xhr.send();
    });
}

// Video cards renderen
async function renderVideoCards() {
    const grid = document.querySelector('.video-grid');
    
    try {
        const data = await fetchCategories();
        const categories = data.categories || [];

        grid.innerHTML = categories.map(category => `
            <div class="video-card">
                <div class="card-inner">
                    <div class="card-front">
                        <img src="${category.thumbnail}" alt="${category.category}" class="thumbnail">
                        <div class="card-content">
                            <h3 class="card-title">${category.category}</h3>
                            <p class="card-description">${category.description || 'Geen beschrijving beschikbaar'}</p>
                            <div class="card-stats">
                                <span><i class="fas fa-video"></i> ${category.videos_count || '0'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-back">
                        <h3 class="card-title">${category.category}</h3>
                        <p class="card-description">${category.description || 'Geen beschrijving beschikbaar'}</p>
                        <a href="#watch/${category.id}" class="watch-button" onclick="return checkAge('videos.html#watch/${category.id}')">
                            <i class="fas fa-play"></i> Bekijken
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        grid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Er is een fout opgetreden bij het laden van de categorieën</p>
            </div>`;
        console.error('Error:', error);
    }
}

// Start rendering wanneer de pagina laadt
document.addEventListener('DOMContentLoaded', () => {
    if (checkAge(window.location.href)) {
        renderVideoCards();
    }
}); 