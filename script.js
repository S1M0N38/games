// Vibe Games - Main JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Game collection data
    const games = [
        {
            id: 'particle-pursuit',
            title: 'Particle Pursuit',
            description: 'Absorb smaller particles to grow while avoiding larger ones in this minimalist mouse-controlled endless game.',
            path: 'games/particle-pursuit/index.html',
            inputType: 'mouse',
            fallbackImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><rect width="300" height="160" fill="%23111111"/><circle cx="150" cy="80" r="18" fill="%23FFFFFF"/><circle cx="100" cy="50" r="10" fill="%23999999"/><circle cx="200" cy="60" r="8" fill="%23AAAAAA"/><circle cx="180" cy="120" r="14" fill="%23777777"/><circle cx="90" cy="110" r="6" fill="%23BBBBBB"/><circle cx="230" cy="90" r="22" fill="%23666666"/><circle cx="70" cy="75" r="12" fill="%23888888"/></svg>'
        },
        {
            id: 'void-serpent',
            title: 'Void Serpent',
            description: 'Navigate a serpent through the void to consume light fragments without colliding with boundaries or yourself.',
            path: 'games/void-serpent/index.html',
            inputType: 'keyboard',
            fallbackImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><rect width="300" height="160" fill="%23111111"/><path d="M140,80 L155,80 L170,80 L185,80 L200,80 L200,95 L185,95 L170,95 L155,95 L140,95 L125,95 L110,95 L110,80 L125,80 L140,80" fill="%23FFFFFF"/><rect x="170" y="50" width="15" height="15" fill="%23FFFFFF" opacity="0.8"/><rect x="200" y="120" width="15" height="15" fill="%23FFFFFF" opacity="0.8"/><circle cx="230" cy="70" r="10" fill="%23FFFFFF" opacity="0.8"/></svg>'
        },
        {
            id: 'space-dodger',
            title: 'Space Dodger',
            description: 'Pilot a spaceship through an asteroid field, dodge obstacles and collect power-ups.',
            path: 'games/space-dodger/index.html',
            inputType: 'keyboard',
            fallbackImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><rect width="300" height="160" fill="%23111111"/><g transform="translate(150, 100)"><polygon points="0,-25 -15,10 0,5 15,10" fill="%23FFFFFF"/></g><!-- Square --><rect x="50" y="40" width="25" height="25" fill="%23FFFFFF" opacity="0.8"/><!-- Pentagon --><polygon points="248,65 236,82 213,82 205,65 220,49" fill="%23FFFFFF" opacity="0.7"/><!-- Hexagon --><polygon points="80,130 95,130 103,145 95,160 80,160 72,145" fill="%23FFFFFF" opacity="0.75"/><!-- Octagon --><polygon points="230,120 242,125 247,137 242,149 230,154 218,149 213,137 218,125" fill="%23FFFFFF" opacity="0.65"/><!-- Circle --><circle cx="50" cy="90" r="15" fill="%23FFFFFF" opacity="0.7"/></svg>'
        },
        {
            id: 'reaction-dots',
            title: 'Reaction Dots',
            description: 'Test your reflexes by clicking on dots when they change color. Quick reactions lead to higher scores!',
            path: 'games/reaction-dots/index.html',
            inputType: 'mouse',
            fallbackImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><rect width="300" height="160" fill="%23111111"/><circle cx="90" cy="50" r="12" fill="%23666666"/><circle cx="140" cy="50" r="12" fill="%23666666"/><circle cx="190" cy="50" r="12" fill="%23666666"/><circle cx="240" cy="50" r="12" fill="%23666666"/><circle cx="90" cy="90" r="12" fill="%23666666"/><circle cx="140" cy="90" r="12" fill="%23FFFFFF"/><circle cx="190" cy="90" r="12" fill="%23666666"/><circle cx="240" cy="90" r="12" fill="%23666666"/><circle cx="90" cy="130" r="12" fill="%23666666"/><circle cx="140" cy="130" r="12" fill="%23666666"/><circle cx="190" cy="130" r="12" fill="%23666666"/><circle cx="240" cy="130" r="12" fill="%23666666"/><circle cx="140" cy="90" r="20" fill="none" stroke="%23FFFFFF" stroke-width="2" opacity="0.3"/></svg>'
        },
        {
            id: 'balance-beam',
            title: 'Balance Beam',
            description: 'Test your precision by keeping a ball balanced on a tilting beam for as long as possible.',
            path: 'games/balance-beam/index.html',
            inputType: 'keyboard',
            fallbackImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><rect width="300" height="160" fill="%23111111"/><rect x="50" y="100" width="200" height="4" fill="%23FFFFFF" transform="rotate(-8, 150, 100)"/><circle cx="125" cy="90" r="12" fill="%23FFFFFF"/></svg>'
        },
        {
            id: 'gravity-field',
            title: 'Gravity Field',
            description: 'Manipulate gravity to capture celestial objects while avoiding hazards. A physics-based challenge.',
            path: 'games/gravity-field/index.html',
            inputType: 'mouse',
            fallbackImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><rect width="300" height="160" fill="%23111111"/><!-- Collection zone in center --><circle cx="150" cy="80" r="20" fill="none" stroke="%23FFFFFF" stroke-width="2" stroke-dasharray="5,3" opacity="0.7"/><!-- Gravity field rings --><circle cx="110" cy="100" r="40" fill="none" stroke="%23FFFFFF" stroke-width="1" opacity="0.2"/><circle cx="110" cy="100" r="30" fill="none" stroke="%23FFFFFF" stroke-width="1" opacity="0.3"/><circle cx="110" cy="100" r="20" fill="none" stroke="%23FFFFFF" stroke-width="1" opacity="0.4"/><circle cx="110" cy="100" r="10" fill="none" stroke="%23FFFFFF" stroke-width="1" opacity="0.5"/><!-- Target celestial objects --><circle cx="180" cy="60" r="10" fill="%23FFFFFF" opacity="0.9"/><circle cx="200" cy="120" r="7" fill="%23FFFFFF" opacity="0.9"/><circle cx="70" cy="50" r="12" fill="%23FFFFFF" opacity="0.9"/><!-- Hazard objects --><polygon points="220,45 235,70 205,70" fill="%23999999" opacity="0.7"/><rect x="80" y="120" width="20" height="20" fill="%23999999" opacity="0.7"/></svg>'
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

    // Get high score if it exists - check all possible key formats
    let highScore = null;
    // Convert ID formats (e.g., "void-serpent" to "voidSerpent" for camelCase keys)
    const camelCaseId = game.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

    // Check all common localStorage key patterns
    const storedScore = localStorage.getItem(`highscore_${game.id}`) ||
        localStorage.getItem(`${game.id}-high-score`) ||
        localStorage.getItem(`${game.id}HighScore`) ||
        localStorage.getItem(`${camelCaseId}HighScore`) ||
        localStorage.getItem(`${game.id.replace(/-/g, "_")}_high_score`);

    if (storedScore && !isNaN(parseInt(storedScore))) {
        highScore = parseInt(storedScore);
    }

    // Create image element
    const img = document.createElement('img');
    img.alt = `${game.title} preview`;
    img.src = game.fallbackImage;

    // Build card structure - remove the reset button
    card.innerHTML = `
        <div class="game-image"></div>
        <div class="game-info">
            <h2>${game.title}</h2>
            <p>${game.description}</p>
            <div class="button-container">
                <a href="${game.path}" class="play-button" title="Play ${game.title}">▶</a>
            </div>
        </div>
    `;

    // Insert image
    card.querySelector('.game-image').appendChild(img);

    // Add high score indicator if applicable
    if (hasPlayed && highScore !== null) {
        const indicator = document.createElement('div');
        indicator.className = 'high-score-indicator';
        indicator.textContent = highScore;
        indicator.title = `Click to reset ${game.title} data`;

        // Make the high score indicator clickable to reset game data
        indicator.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            resetGameData(game.id);
            indicator.remove();
        });

        card.querySelector('.game-image').appendChild(indicator);
    } else if (hasPlayed) {
        // Fallback to simple indicator if played but no high score
        const indicator = document.createElement('div');
        indicator.className = 'game-played-indicator';
        card.querySelector('.game-image').appendChild(indicator);
    }

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

    // Clear high scores in all possible formats
    const camelCaseId = gameId.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

    // Clear all possible high score formats
    localStorage.removeItem(`highscore_${gameId}`);
    localStorage.removeItem(`${gameId}-high-score`);
    localStorage.removeItem(`${gameId}HighScore`);
    localStorage.removeItem(`${camelCaseId}HighScore`);
    localStorage.removeItem(`${gameId.replace(/-/g, "_")}_high_score`);

    // Clear any other game-specific data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes(gameId) || key.includes(camelCaseId)) {
            keysToRemove.push(key);
        }
    }

    // Remove the collected keys
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Show feedback
    console.log(`Reset data for ${gameId}`);
}


