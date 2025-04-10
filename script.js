// Browser Games - Main JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Game collection data
    const games = [
        {
            id: 'snake',
            title: 'Snake',
            description: 'Navigate a snake to collect food without hitting walls or yourself.',
            path: 'games/snake/index.html',
            image: 'games/snake/preview.png',
            fallbackImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><rect width="300" height="160" fill="%23343a40"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23f8f9fa">Snake</text></svg>'
        },
        {
            id: 'space-dodger',
            title: 'Space Dodger',
            description: 'Pilot a spaceship through an asteroid field, dodge obstacles and collect power-ups.',
            path: 'games/space-dodger/index.html',
            image: 'games/space-dodger/preview.png',
            fallbackImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><rect width="300" height="160" fill="%23343a40"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23f8f9fa">Space Dodger</text></svg>'
        },
        {
            id: 'reaction-dots',
            title: 'Reaction Dots',
            description: 'Test your reflexes by clicking on dots when they change color. Quick reactions lead to higher scores!',
            path: 'games/reaction-dots/index.html',
            image: 'games/reaction-dots/preview.png',
            fallbackImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><rect width="300" height="160" fill="%233498db"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23ffffff">Reaction Dots</text></svg>'
        }
        // More games will be added here as developed
    ];

    // Render all games to the DOM
    renderGames(games);

    // Add subtle entrance animations
    animateGameCards();
});

/**
 * Renders game cards into the games list container
 * @param {Array} games - Collection of game objects
 */
function renderGames(games) {
    const gamesListElement = document.getElementById('gamesList');

    // Clear previous content
    gamesListElement.innerHTML = '';

    // Show message if no games available
    if (games.length === 0) {
        const message = document.createElement('p');
        message.className = 'no-games';
        message.textContent = 'No games available yet. Check back soon!';
        gamesListElement.appendChild(message);
        return;
    }

    // Create game cards
    games.forEach(game => {
        const card = createGameCard(game);
        gamesListElement.appendChild(card);
    });
}

/**
 * Creates a game card element
 * @param {Object} game - Game data object
 * @returns {HTMLElement} - Game card DOM element
 */
function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.setAttribute('data-game-id', game.id);

    // Create image element with fallback
    const img = document.createElement('img');
    img.alt = `${game.title} preview`;
    img.src = game.fallbackImage; // Start with fallback

    // Try to load the actual image
    const actualImg = new Image();
    actualImg.onload = () => img.src = game.image;
    actualImg.onerror = () => console.log(`Could not load image for ${game.title}`);
    actualImg.src = game.image;

    // Build card structure
    card.innerHTML = `
        <div class="game-image"></div>
        <div class="game-info">
            <h2>${game.title}</h2>
            <p>${game.description}</p>
            <a href="${game.path}" class="play-button">Play</a>
        </div>
    `;

    // Insert image
    card.querySelector('.game-image').appendChild(img);

    return card;
}

/**
 * Adds subtle entrance animations to game cards
 */
function animateGameCards() {
    const cards = document.querySelectorAll('.game-card');

    // Observer for scroll-based animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px'
    });

    // Observe all cards
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.animationDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
}
