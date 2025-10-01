// API Keys
const unsplashApiKey = 'H09g4V7WFvWSqojfB0W5xm4rATIrIdYX906wfzsC8Is';
const openWeatherApiKey = 'f281dd8da4a0ffaebfaed991c2d65066';
const geminiApiKey = 'AIzaSyCqFQ2KFjTlmLAw8FXLwrmN9G1DC6-84zc';

// Search functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    const resultsContainer = document.getElementById('searchResultsContainer');
    const viewMoreBtn = document.querySelector('.destinations_content-btn');
    const closeSearchBtn = document.getElementById('closeSearch');
    
    // Close search functionality
    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', () => {
            searchResults.style.display = 'none';
            searchInput.value = '';
        });
    }
    
    // Popular tourist destinations
    const popularDestinations = [
        'Paris, France', 'Tokyo, Japan', 'London, UK', 'New York, USA',
        'Rome, Italy', 'Bali, Indonesia', 'Dubai, UAE', 'Thailand',
        'Barcelona, Spain', 'Sydney, Australia', 'Santorini, Greece', 'Iceland'
    ];
    
    // View More button functionality
    viewMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showPopularDestinations();
    });
    
    function showPopularDestinations() {
        searchResults.style.display = 'block';
        searchResults.scrollIntoView({ behavior: 'smooth' });
        
        resultsContainer.innerHTML = `
            <div style="grid-column: 1 / -1;">
                <h2 style="text-align: center; margin-bottom: 2rem; color: var(--color-dark);">Popular Tourist Destinations</h2>
                <div class="destination_cards">
                    ${popularDestinations.map((destination, index) => `
                        <div class="destination_card reveal-scale" onclick="searchDestination('${destination.split(',')[0]}')" style="cursor: pointer; position: relative; z-index: 1;">
                            <button class="favorite-btn" onclick="togglePopularFavorite('${destination.replace(/'/g, '\\\'')}', this)" style="z-index: 100; pointer-events: auto;">
                                <i class="fa-solid fa-heart"></i>
                            </button>
                            <div style="height: 200px; background: linear-gradient(135deg, var(--color-primary), #ff8a80); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: bold;">
                                <i class="fa-solid fa-location-dot" style="margin-right: 0.5rem;"></i>
                                ${destination.split(',')[0]}
                            </div>
                            <div class="destination_card_content">
                                <h3 class="destination_card_title">${destination}</h3>
                                <p class="destination_card_desc">Click to explore this amazing destination and get personalized recommendations!</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Animate cards
        setTimeout(() => {
            const cards = document.querySelectorAll('.destination_card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('active');
                }, index * 100);
            });
        }, 100);
    }
    
    // Function to search from popular destinations
    window.searchDestination = function(destination) {
        searchInput.value = destination;
        handleSearch();
    };
    
    // Function to toggle favorites for popular destinations
    window.togglePopularFavorite = function(destination, button) {
        event.preventDefault();
        event.stopPropagation();
        
        if (!window.favoritesManager) return;
        
        const destinationData = {
            name: destination,
            image: 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(destination),
            price: 'From ₹15,000',
            rating: '4.8'
        };
        
        if (window.favoritesManager.isFavorite(destination)) {
            window.favoritesManager.removeFromFavorites(destination);
            button.classList.remove('favorited');
        } else {
            window.favoritesManager.addToFavorites(destinationData);
            button.classList.add('favorited');
        }
    };

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    async function handleSearch() {
        const query = searchInput.value.trim();
        if (!query) return;

        showLoading();
        searchResults.style.display = 'block';
        searchResults.scrollIntoView({ behavior: 'smooth' });

        try {
            const [images, weather, recommendations] = await Promise.all([
                fetchUnsplashImages(query),
                fetchWeatherData(query),
                fetchGeminiRecommendations(query)
            ]);

            console.log('Search results:', { images: images?.length, weather: !!weather, recommendations });
            displayResults(images, weather, recommendations, query);
        } catch (error) {
            console.error('Search error:', error);
            showError();
        }
    }

    function showLoading() {
        resultsContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p style="margin-top: 1rem; color: #666;">Searching destinations...</p>
            </div>
        `;
    }

    function showError() {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <i class="fa-solid fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: var(--color-primary);"></i>
                <h3>Oops! Something went wrong</h3>
                <p>Please try searching for another destination.</p>
            </div>
        `;
    }

    async function fetchUnsplashImages(query) {
        try {
            const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)} travel destination&per_page=6&client_id=${unsplashApiKey}`);
            if (!response.ok) throw new Error('Images fetch failed');
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Unsplash API error:', error);
            return [];
        }
    }

    async function fetchWeatherData(query) {
        try {
            const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${openWeatherApiKey}`);
            if (!geoResponse.ok) throw new Error('Geo API failed');
            const geoData = await geoResponse.json();
            
            if (!geoData || geoData.length === 0) {
                console.log('Location not found for:', query);
                return null;
            }
            
            const { lat, lon } = geoData[0];
            const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`);
            if (!weatherResponse.ok) throw new Error('Weather API failed');
            const weatherData = await weatherResponse.json();
            
            return weatherData;
        } catch (error) {
            console.error('Weather fetch error:', error);
            return null;
        }
    }

    async function fetchGeminiRecommendations(query) {
        // Fallback recommendations for popular destinations
        const recommendations = {
            'paris': 'Visit the Eiffel Tower at sunset, explore the Louvre Museum, and stroll along the Seine River. Best time: April-June and September-October. Try croissants, escargot, and macarons. Use the metro for easy transportation.',
            'tokyo': 'Experience Shibuya Crossing, visit Senso-ji Temple, and enjoy cherry blossoms in spring. Best time: March-May and September-November. Must-try: sushi, ramen, and tempura. Get a JR Pass for convenient travel.',
            'london': 'See Big Ben, visit the British Museum, and take a ride on the London Eye. Best time: May-September. Try fish and chips, afternoon tea, and bangers and mash. Use the Tube for getting around.',
            'new york': 'Visit Times Square, Central Park, and the Statue of Liberty. Best time: April-June and September-November. Try pizza, bagels, and cheesecake. Walk or use the subway to explore.',
            'rome': 'Explore the Colosseum, Vatican City, and Trevi Fountain. Best time: April-June and September-October. Enjoy pasta, gelato, and pizza al taglio. Book skip-the-line tickets for major attractions.',
            'bali': 'Relax on beautiful beaches, visit ancient temples, and enjoy rice terraces. Best time: April-October. Try nasi goreng, satay, and fresh tropical fruits. Rent a scooter for easy island exploration.',
            'dubai': 'Visit Burj Khalifa, explore Dubai Mall, and enjoy desert safaris. Best time: November-March. Try shawarma, hummus, and dates. Use the metro and taxis for transportation.',
            'thailand': 'Explore Bangkok temples, relax on Phuket beaches, and visit floating markets. Best time: November-April. Must-try: pad thai, tom yum, and mango sticky rice. Use tuk-tuks and boats for local transport.'
        };
        
        const queryLower = query.toLowerCase();
        for (const [destination, recommendation] of Object.entries(recommendations)) {
            if (queryLower.includes(destination)) {
                return recommendation;
            }
        }
        
        return `${query} offers incredible experiences for travelers! Best visited during moderate weather seasons. Explore local attractions, try authentic cuisine, and immerse yourself in the culture. Book accommodations in advance and respect local customs for the best experience.`;
    }

    function displayResults(images, weather, recommendations, query) {
        let destinationCards = '';
        
        if (images && images.length > 0) {
            destinationCards = images.map((image, index) => {
                const destinationName = `Destination ${index + 1}`;
                const description = image.description || image.alt_description || `Experience the stunning beauty and unique attractions of ${query}. Perfect for travelers seeking adventure and memorable experiences.`;
                const isFav = window.favoritesManager ? window.favoritesManager.isFavorite(destinationName) : false;
                
                return `
                <div class="destination_card reveal-scale" style="position: relative; z-index: 1;">
                    <button class="favorite-btn ${isFav ? 'favorited' : ''}" onclick="toggleSearchFavorite('${destinationName.replace(/'/g, '\\\'')}', '${image.urls.regular}', this)" style="z-index: 100; pointer-events: auto;">
                        <i class="fa-solid fa-heart"></i>
                    </button>
                    <img src="${image.urls.regular}" alt="${destinationName}" onerror="this.src='https://via.placeholder.com/300x200?text=${encodeURIComponent(query)}'">
                    <div class="destination_card_content">
                        <h3 class="destination_card_title responsive-title">${destinationName}</h3>
                        <p class="destination_card_desc">${description}</p>
                    </div>
                </div>
                `;
            }).join('');
        } else {
            destinationCards = `
                <div class="destination_card reveal-scale" style="position: relative; z-index: 1;">
                    <div style="height: 200px; background: linear-gradient(135deg, #FF6B35, #F7931E); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: bold;">
                        <i class="fa-solid fa-location-dot" style="margin-right: 0.5rem;"></i>
                        ${query}
                    </div>
                    <div class="destination_card_content">
                        <h3 class="destination_card_title">${query}</h3>
                        <p class="destination_card_desc">Explore this amazing destination and discover its hidden gems!</p>
                    </div>
                </div>
            `;
        }
        
        // Add toggle function to global scope
        window.toggleSearchFavorite = function(name, image, button) {
            event.preventDefault();
            event.stopPropagation();
            
            if (!window.favoritesManager) return;
            
            const destination = {
                name: name,
                image: image,
                price: 'Contact for pricing',
                rating: '4.5'
            };
            
            if (window.favoritesManager.isFavorite(name)) {
                window.favoritesManager.removeFromFavorites(name);
                button.classList.remove('favorited');
            } else {
                window.favoritesManager.addToFavorites(destination);
                button.classList.add('favorited');
            }
        };

        const weatherWidget = weather ? `
            <div class="weather_widget">
                <h3 class="weather_title">
                    <i class="fa-solid fa-cloud-sun"></i> Weather Forecast
                </h3>
                <div class="weather_current">
                    <div class="weather_location">${weather.city?.name || query}</div>
                    <div class="weather_temp">${Math.round(weather.list[0].main.temp)}°C</div>
                    <div class="weather_desc">${weather.list[0].weather[0].description}</div>
                    <div class="weather_details">
                        <div class="weather_detail">
                            <i class="fa-solid fa-droplet"></i>
                            <span>Humidity</span>
                            <span>${weather.list[0].main.humidity}%</span>
                        </div>
                        <div class="weather_detail">
                            <i class="fa-solid fa-wind"></i>
                            <span>Wind Speed</span>
                            <span>${weather.list[0].wind.speed} m/s</span>
                        </div>
                        <div class="weather_detail">
                            <i class="fa-solid fa-thermometer-half"></i>
                            <span>Feels Like</span>
                            <span>${Math.round(weather.list[0].main.feels_like)}°C</span>
                        </div>
                        <div class="weather_detail">
                            <i class="fa-solid fa-gauge"></i>
                            <span>Pressure</span>
                            <span>${weather.list[0].main.pressure} hPa</span>
                        </div>
                    </div>
                </div>
                <div class="weather_forecast">
                    ${weather.list.slice(0, 7).map((day, index) => `
                        <div class="weather_day">
                            <span>${new Date(day.dt * 1000).toLocaleDateString('en', { weekday: 'short' })}</span>
                            <span>${Math.round(day.main.temp)}°C</span>
                            <span>${day.weather[0].main}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : `
            <div class="weather_widget">
                <h3 class="weather_title">
                    <i class="fa-solid fa-cloud-sun"></i> Weather Information
                </h3>
                <div class="ai_content" style="text-align: center; padding: 2rem;">
                    <p>Weather data not available for this location. Please try searching for a major city nearby.</p>
                </div>
            </div>
        `;

        resultsContainer.innerHTML = `
            <div>
                <div class="destination_cards">
                    ${destinationCards}
                </div>
            </div>
            <div>
                ${weatherWidget}
                <div class="ai_recommendations">
                    <h3 class="ai_title">
                        <i class="fa-solid fa-robot"></i> AI Recommendations
                    </h3>
                    <div class="ai_content">${recommendations}</div>
                </div>
            </div>
        `;

        // Trigger scroll reveal animations
        setTimeout(() => {
            const cards = document.querySelectorAll('.destination_card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('active');
                }, index * 200);
            });
        }, 100);
    }
});