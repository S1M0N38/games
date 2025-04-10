// Browser Games Collection - Main JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Array of available games with their information
    // In a real-world scenario, this could be loaded from a JSON file or API
    const games = [
        {
            id: 'snake',
            title: 'Snake',
            description: 'The classic Snake game where you control a snake to eat food and grow without hitting walls or yourself.',
            path: 'games/snake/index.html',
            image: 'https://via.placeholder.com/300x180?text=Snake+Game' // Placeholder image
        }
        // More games would be added here as they are developed
    ];

    // Get the games container element
    const gamesListElement = document.getElementById('gamesList');

    // Render all available games
    renderGames(games, gamesListElement);

    // Add fade-in animation after a small delay to ensure DOM is ready
    setTimeout(() => {
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach((card, index) => {
            card.classList.add('fade-in');
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }, 100);
});

/**
 * Renders game cards into the specified container
 * @param {Array} games - Array of game objects with title, description, path, etc.
 * @param {Element} container - DOM element to render games into
 */
function renderGames(games, container) {
    // Clear the container first
    container.innerHTML = '';

    // If no games are available, show a message
    if (games.length === 0) {
        container.innerHTML = '<p class="no-games">No games available yet. Check back soon!</p>';
        return;
    }

    // Create and append a card for each game
    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';

        gameCard.innerHTML = `
      <div class="game-image">
        <img src="${game.image}" alt="${game.title}">
      </div>
      <div class="game-info">
        <h2>${game.title}</h2>
        <p>${game.description}</p>
        <a href="${game.path}" class="play-button">Play Now</a>
      </div>
    `;

        container.appendChild(gameCard);
    });
}

/**
 * Checks if an element is in the viewport
 * Used for scroll animations
 * @param {Element} element - DOM element to check
 * @returns {Boolean} - True if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Add scroll animation - elements fade in as they scroll into view
window.addEventListener('scroll', () => {
    const gameCards = document.querySelectorAll('.game-card:not(.visible)');
    gameCards.forEach(card => {
        if (isInViewport(card)) {
            card.classList.add('visible');
            card.style.opacity = 1;
            card.style.transform = 'translateY(0)';
        }
    });
}, { passive: true });
