// Favorites functionality using localStorage
class FavoritesManager {
    constructor() {
        this.favorites = this.loadFavorites();
        this.init();
    }

    init() {
        this.createFavoritesButton();
        this.createFavoritesModal();
        this.addFavoriteButtons();
    }

    loadFavorites() {
        const stored = localStorage.getItem('yatraSathiFavorites');
        return stored ? JSON.parse(stored) : [];
    }

    saveFavorites() {
        localStorage.setItem('yatraSathiFavorites', JSON.stringify(this.favorites));
    }

    addToFavorites(destination) {
        const exists = this.favorites.find(fav => fav.name === destination.name);
        if (!exists) {
            this.favorites.push({
                id: Date.now(),
                name: destination.name,
                image: destination.image,
                price: destination.price,
                rating: destination.rating,
                addedAt: new Date().toISOString()
            });
            this.saveFavorites();
            this.showNotification(`${destination.name} added to favorites!`);
            this.updateFavoriteButtons();
        }
    }

    removeFromFavorites(destinationName) {
        this.favorites = this.favorites.filter(fav => fav.name !== destinationName);
        this.saveFavorites();
        this.showNotification(`${destinationName} removed from favorites!`);
        this.updateFavoriteButtons();
        this.renderFavorites();
    }

    isFavorite(destinationName) {
        return this.favorites.some(fav => fav.name === destinationName);
    }

    createFavoritesButton() {
        const header = document.querySelector('.header_nav');
        const favBtn = document.createElement('li');
        favBtn.innerHTML = `
            <a href="#" id="favoritesBtn">
                <i class="fa-solid fa-heart"></i> 
                Favorites 
                <span class="favorites-count">${this.favorites.length}</span>
            </a>
        `;
        header.appendChild(favBtn);

        document.getElementById('favoritesBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showFavoritesModal();
        });
    }

    createFavoritesModal() {
        const modal = document.createElement('div');
        modal.id = 'favoritesModal';
        modal.className = 'favorites-modal';
        modal.innerHTML = `
            <div class="favorites-modal-content">
                <div class="favorites-header">
                    <h2><i class="fa-solid fa-heart"></i> My Favorites</h2>
                    <button class="close-favorites" id="closeFavorites">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="favorites-list" id="favoritesList">
                    <!-- Favorites will be rendered here -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('closeFavorites').addEventListener('click', () => {
            this.hideFavoritesModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideFavoritesModal();
        });
    }

    showFavoritesModal() {
        this.renderFavorites();
        document.getElementById('favoritesModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideFavoritesModal() {
        document.getElementById('favoritesModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    renderFavorites() {
        const favoritesList = document.getElementById('favoritesList');
        
        if (this.favorites.length === 0) {
            favoritesList.innerHTML = `
                <div class="no-favorites">
                    <i class="fa-solid fa-heart-crack"></i>
                    <h3>No favorites yet</h3>
                    <p>Start exploring and add destinations to your favorites!</p>
                </div>
            `;
            return;
        }

        favoritesList.innerHTML = this.favorites.map(fav => `
            <div class="favorite-item">
                <div class="favorite-image">
                    <img src="${fav.image}" alt="${fav.name}">
                </div>
                <div class="favorite-content">
                    <h3>${fav.name}</h3>
                    <div class="favorite-details">
                        <span class="favorite-price">${fav.price}</span>
                        <span class="favorite-rating">${fav.rating} <i class="fa-solid fa-star"></i></span>
                    </div>
                    <small>Added: ${new Date(fav.addedAt).toLocaleDateString()}</small>
                </div>
                <button class="remove-favorite" onclick="favoritesManager.removeFromFavorites('${fav.name}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    addFavoriteButtons() {
        // Add to existing destination cards
        setTimeout(() => {
            const destinationCards = document.querySelectorAll('.swiper-slide_container');
            destinationCards.forEach(card => {
                // Skip if button already exists
                if (card.querySelector('.favorite-btn')) return;
                
                const title = card.querySelector('.swiper-slide_content-title')?.textContent;
                const price = card.querySelector('.swiper-slide_content-price')?.textContent;
                const rating = card.querySelector('.swiper-slide_content-rating')?.textContent;
                const image = card.querySelector('img')?.src;

                if (title) {
                    const favBtn = document.createElement('button');
                    favBtn.className = `favorite-btn ${this.isFavorite(title) ? 'favorited' : ''}`;
                    favBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
                    favBtn.style.zIndex = '100';
                    favBtn.style.pointerEvents = 'auto';
                    
                    favBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        
                        if (this.isFavorite(title)) {
                            this.removeFromFavorites(title);
                        } else {
                            this.addToFavorites({ name: title, image, price, rating });
                        }
                    });
                    
                    card.style.position = 'relative';
                    card.appendChild(favBtn);
                }
            });
        }, 1500);
    }

    updateFavoriteButtons() {
        const favBtns = document.querySelectorAll('.favorite-btn');
        favBtns.forEach(btn => {
            const card = btn.closest('.swiper-slide_container');
            const title = card?.querySelector('.swiper-slide_content-title')?.textContent;
            if (title) {
                btn.className = `favorite-btn ${this.isFavorite(title) ? 'favorited' : ''}`;
            }
        });

        // Update counter
        const counter = document.querySelector('.favorites-count');
        if (counter) counter.textContent = this.favorites.length;
    }

    showNotification(message) {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.favorite-notification');
        existingNotifications.forEach(notif => notif.remove());
        
        const notification = document.createElement('div');
        notification.className = 'favorite-notification';
        notification.innerHTML = `
            <i class="fa-solid fa-heart" style="color: #FFD700; font-size: 1.3rem;"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        // Force reflow and show notification
        notification.offsetHeight;
        setTimeout(() => {
            notification.classList.add('show');
        }, 50);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 400);
        }, 3500);
    }
}

// Initialize favorites manager
let favoritesManager;
document.addEventListener('DOMContentLoaded', () => {
    favoritesManager = new FavoritesManager();
    window.favoritesManager = favoritesManager;
    
    // Re-add buttons when swiper is initialized
    setTimeout(() => {
        favoritesManager.addFavoriteButtons();
    }, 2000);
});