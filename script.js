// Vibe Games - Main JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Game collection data
    const games = [
        {
            id: 'void-serpent',
            title: 'Void Serpent',
            description: 'Navigate a serpent through the void to consume light fragments without colliding with boundaries or yourself.',
            path: 'games/void-serpent/index.html',
            inputType: 'keyboard',
            fallbackImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><rect width="300" height="160" fill="%23111111"/><circle cx="150" cy="80" r="30" fill="%23FFFFFF"/><rect x="190" y="70" width="20" height="20" fill="%23FFFFFF"/></svg>'
        },
        {
            id: 'space-dodger',
            title: 'Space Dodger',
            description: 'Pilot a spaceship through an asteroid field, dodge obstacles and collect power-ups.',
            path: 'games/space-dodger/index.html',
            inputType: 'keyboard',
            fallbackImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><rect width="300" height="160" fill="%23111111"/><polygon points="150,60 140,100 160,100" fill="%23FFFFFF"/><circle cx="120" cy="90" r="10" fill="%23FFFFFF"/><circle cx="180" cy="70" r="15" fill="%23FFFFFF"/></svg>'
        },
        {
            id: 'reaction-dots',
            title: 'Reaction Dots',
            description: 'Test your reflexes by clicking on dots when they change color. Quick reactions lead to higher scores!',
            path: 'games/reaction-dots/index.html',
            inputType: 'mouse',
            fallbackImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><rect width="300" height="160" fill="%23111111"/><circle cx="100" cy="80" r="20" fill="%23FFFFFF"/><circle cx="170" cy="60" r="15" fill="%23999999"/><circle cx="210" cy="100" r="25" fill="%23FFFFFF"/></svg>'
        },
        {
            id: 'breakout-blocks',
            title: 'Breakout Blocks',
            description: 'Control a paddle to bounce a ball and break bricks in this classic arcade game.',
            path: 'games/breakout-blocks/index.html',
            inputType: 'mouse',
            fallbackImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><rect width="300" height="160" fill="%23111111"/><rect x="40" y="40" width="40" height="15" fill="%23FFFFFF"/><rect x="85" y="40" width="40" height="15" fill="%23FFFFFF"/><rect x="130" y="40" width="40" height="15" fill="%23FFFFFF"/><rect x="175" y="40" width="40" height="15" fill="%23FFFFFF"/><rect x="220" y="40" width="40" height="15" fill="%23FFFFFF"/><circle cx="150" cy="80" r="8" fill="%23FFFFFF"/><rect x="125" y="130" width="50" height="10" fill="%23FFFFFF"/></svg>'
        },
        {
            id: 'balance-beam',
            title: 'Balance Beam',
            description: 'Test your precision by keeping a ball balanced on a tilting beam for as long as possible.',
            path: 'games/balance-beam/index.html',
            inputType: 'keyboard',
            fallbackImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><rect width="300" height="160" fill="%23111111"/><rect x="50" y="100" width="200" height="5" fill="%23FFFFFF" transform="rotate(-5, 150, 100)"/><circle cx="140" cy="92" r="10" fill="%23FFFFFF"/></svg>'
        },
        {
            id: 'pendulum-pulse',
            title: 'Pendulum Pulse',
            description: 'A minimalist timing game - click when the pendulum crosses the center line for perfect rhythm.',
            path: 'games/pendulum-pulse/index.html',
            inputType: 'mouse',
            fallbackImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><rect width="300" height="160" fill="%23111111"/><line x1="150" y1="30" x2="150" y2="160" stroke="%23666666" stroke-width="1"/><line x1="100" y1="30" x2="150" y2="80" stroke="%23FFFFFF" stroke-width="2"/><circle cx="100" cy="30" r="3" fill="%23FFFFFF"/><circle cx="150" cy="80" r="10" fill="%23FFFFFF"/></svg>'
        }
        // More games will be added here as developed
    ];    // Render all games to the DOM
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
    card.setAttribute('data-input-type', game.inputType);

    // Check if game has been played before
    const hasPlayed = localStorage.getItem(`game_played_${game.id}`) === 'true';

    // Create image element
    const img = document.createElement('img');
    img.alt = `${game.title} preview`;
    img.src = game.fallbackImage;

    // Build card structure
    card.innerHTML = `
        <div class="game-image"></div>
        <div class="game-info">
            <h2>${game.title}</h2>
            <p>${game.description}</p>
            <div class="button-container">
                <a href="${game.path}" class="play-button" title="Play ${game.title}">▶</a>
                <button class="reset-button" data-game-id="${game.id}" title="Reset ${game.title} data">↺</button>
            </div>
        </div>
    `;

    // Insert image
    card.querySelector('.game-image').appendChild(img);

    // Add played indicator if applicable
    if (hasPlayed) {
        const indicator = document.createElement('div');
        indicator.className = 'game-played-indicator';
        card.querySelector('.game-image').appendChild(indicator);
    }

    // Add event listener to reset button
    card.querySelector('.reset-button').addEventListener('click', (e) => {
        e.preventDefault();
        resetGameData(game.id);
        // Remove played indicator
        const indicator = card.querySelector('.game-played-indicator');
        if (indicator) indicator.remove();
    });

    // Add event listener to play button to mark game as played
    card.querySelector('.play-button').addEventListener('click', () => {
        localStorage.setItem(`game_played_${game.id}`, 'true');
    });

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

/**
 * Resets all localStorage data for a specific game
 * @param {string} gameId - ID of the game to reset
 */
function resetGameData(gameId) {
    // Clear game played status
    localStorage.removeItem(`game_played_${gameId}`);

    // Clear high scores if they exist
    localStorage.removeItem(`highscore_${gameId}`);

    // Clear any other game-specific data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes(gameId)) {
            keysToRemove.push(key);
        }
    }

    // Remove the collected keys
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Show feedback
    console.log(`Reset data for ${gameId}`);
}


