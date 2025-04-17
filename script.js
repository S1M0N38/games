// Vibe Games - Main JavaScript
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch the game manifest object
        const manifestResponse = await fetch('games/manifest.json');
        if (!manifestResponse.ok) {
            throw new Error(`HTTP error! status: ${manifestResponse.status}`);
        }
        const gameManifest = await manifestResponse.json();
        // Extract game IDs (keys) from the manifest object
        const gameIds = Object.keys(gameManifest);

        // Fetch game data dynamically based on the IDs
        const games = await loadGameData(gameIds);

        // Render all games to the DOM
        renderGames(games);

        // Add subtle entrance animations
        animateGameCards();
    } catch (error) {
        console.error("Failed to load game list or game data:", error);
        // Optionally display an error message to the user in the UI
        const gamesListElement = document.getElementById('gamesList');
        gamesListElement.innerHTML = '<p class="error-message">Could not load games. Please try again later.</p>';
    }
});

/**
 * Fetches game metadata from game.json files in specified directories.
 * @param {string[]} gameIds - An array of game IDs (directory names).
 * @returns {Promise<Array>} - A promise that resolves to an array of game data objects.
 */
async function loadGameData(gameIds) {
    const gameDataPromises = gameIds.map(async (id) => {
        try {
            const response = await fetch(`games/${id}/game.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // Ensure the path is correctly set relative to the root index.html
            data.path = `games/${id}/index.html`;
            return data;
        } catch (error) {
            console.error(`Failed to load game data for ${id}:`, error);
            return null; // Return null for games that failed to load
        }
    });

    const results = await Promise.all(gameDataPromises);
    return results.filter(data => data !== null); // Filter out any null results
}

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
 * Creates a game card element which is a clickable link
 * @param {Object} game - Game data object
 * @returns {HTMLElement} - Game card anchor DOM element
 */
function createGameCard(game) {
    // Create an anchor element that wraps the entire card
    const cardLink = document.createElement('a');
    cardLink.href = game.path;
    cardLink.className = 'game-card'; // Apply card styling to the anchor
    cardLink.setAttribute('data-game-id', game.id);
    cardLink.setAttribute('data-input-type', game.inputType);
    cardLink.title = `Play ${game.title}`; // Add title for accessibility

    // Check if game has been played before
    const hasPlayed = localStorage.getItem(`game_played_${game.id}`) === 'true';

    // Get high score if it exists - use the storageKey from game.json if available
    let highScore = null;
    let storedScore = null;
    const storageKey = game.storageKey || `${game.id}HighScore`; // Use specific key or default

    storedScore = localStorage.getItem(storageKey);

    // Fallback checks for older keys if specific key not found or missing in json
    if (!storedScore) {
        const camelCaseId = game.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        storedScore = localStorage.getItem(`highscore_${game.id}`) ||
            localStorage.getItem(`${game.id}-high-score`) ||
            localStorage.getItem(`${camelCaseId}HighScore`) ||
            localStorage.getItem(`${game.id.replace(/-/g, "_")}_high_score`);
    }


    if (storedScore && !isNaN(parseInt(storedScore))) {
        highScore = parseInt(storedScore);
    }

    // Create image element
    const img = document.createElement('img');
    img.alt = `${game.title} preview`;
    img.src = game.fallbackImage;

    // Build card structure within the anchor tag
    cardLink.innerHTML = `
        <div class="game-image">
            <!-- Image will be inserted here -->
        </div>
        <div class="game-info">
            <h2>${game.title}</h2>
        </div>
        <div class="game-card-overlay"></div>
        <div class="game-card-play-graphic"></div> <!-- Changed class, removed text content -->
    `;

    // Insert image into its container
    cardLink.querySelector('.game-image').appendChild(img);

    // Remove hover effects for the old play button
    // const playButton = card.querySelector('.play-button'); // Button removed
    // playButton.addEventListener('mouseenter', () => card.classList.add('highlight-card')); // Logic removed
    // playButton.addEventListener('mouseleave', () => card.classList.remove('highlight-card')); // Logic removed

    // Add high score indicator if applicable
    if (hasPlayed && highScore !== null) {
        const indicator = document.createElement('div');
        indicator.className = 'high-score-indicator';
        indicator.textContent = highScore;
        indicator.title = `Click to reset ${game.title} data`;

        // Make the high score indicator clickable to reset game data
        indicator.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent navigation when clicking reset
            e.stopPropagation(); // Prevent card click event
            resetGameData(game.id, game.storageKey); // Pass storageKey
            indicator.remove();
            // Optionally remove the 'played' status visually if needed,
            // though resetGameData handles the localStorage part.
        });

        // Append indicator to the image container, which is inside the link
        cardLink.querySelector('.game-image').appendChild(indicator);
    }
    // Removed the 'game-played-indicator' as the high score or lack thereof implies played status

    // Add event listener to the card link itself to mark game as played
    // This ensures it's marked even if the user opens in a new tab
    cardLink.addEventListener('click', () => {
        localStorage.setItem(`game_played_${game.id}`, 'true');
    });
    // Also handle context menu (right-click -> open in new tab)
    cardLink.addEventListener('contextmenu', () => {
        localStorage.setItem(`game_played_${game.id}`, 'true');
    });


    return cardLink; // Return the anchor element
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
        card.style.animationDelay = `${index * 0.05}s`; // Reduced delay multiplier from 0.1s
        observer.observe(card);
    });
}

/**
 * Resets all localStorage data for a specific game
 * @param {string} gameId - ID of the game to reset
 * @param {string} [storageKey] - Optional specific storage key from game.json
 */
function resetGameData(gameId, storageKey) {
    // Clear game played status
    localStorage.removeItem(`game_played_${gameId}`);

    // Clear the specific high score key if provided
    if (storageKey) {
        localStorage.removeItem(storageKey);
    }

    // Clear high scores in all possible fallback formats
    const camelCaseId = gameId.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    localStorage.removeItem(`highscore_${gameId}`);
    localStorage.removeItem(`${gameId}-high-score`);
    localStorage.removeItem(`${gameId}HighScore`);
    localStorage.removeItem(`${camelCaseId}HighScore`);
    localStorage.removeItem(`${gameId.replace(/-/g, "_")}_high_score`);


    // Clear any other game-specific data (optional, if games store more)
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // More robust check if other keys might exist for the game
        if (key && (key.startsWith(gameId) || key.includes(gameId))) {
            // Avoid removing keys already handled
            if (key !== `game_played_${gameId}` && key !== storageKey) {
                keysToRemove.push(key);
            }
        }
    }

    // Remove the collected keys
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Show feedback
    console.log(`Reset data for ${gameId}`);

    // Optionally, refresh the card display or the page
    // For simplicity, just log for now. A full refresh might be needed
    // location.reload(); // Uncomment to force page reload after reset
}


