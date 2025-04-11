// Game constants
const GRID_SIZE = 5; // 5x5 grid
const DOT_COUNT = GRID_SIZE * GRID_SIZE;
const INITIAL_LIVES = 3;
const MIN_ILLUMINATION_TIME = 350; // ms (increased from 200ms for more balanced difficulty)
const MAX_ILLUMINATION_TIME = 1000; // ms (increased from 800ms)
const ILLUMINATION_TIME_DECREASE = 50; // ms per level (decreased from 100ms)
const DIFFICULTY_INCREASE_INTERVAL = 3; // score points (increased from 2)
const MAX_ACTIVE_DOTS = 3; // Maximum number of simultaneously active dots (reduced from 4)
const DOT_SPAWN_RATE_MIN = 500; // Minimum time between new dots (ms) (increased from 300)
const DOT_SPAWN_RATE_MAX = 1200; // Maximum time between new dots (ms) (increased from 800)

// Game state
const gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    lives: INITIAL_LIVES,
    activeDots: [],
    illuminationTime: MAX_ILLUMINATION_TIME,
    highScore: 0,
    timers: []
};

// DOM elements
const dotsGrid = document.getElementById('dots-grid');
const scoreDisplay = document.getElementById('score');
const livesContainer = document.getElementById('lives-container');
const helpButton = document.getElementById('help-button');
const helpPanel = document.getElementById('help-panel');
const closeHelp = document.getElementById('close-help');
const pauseOverlay = document.getElementById('pause-overlay');
const gameOverOverlay = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const highScoreDisplay = document.getElementById('high-score');
const restartButton = document.getElementById('restart-button');
const errorOverlay = document.getElementById('error-overlay');

// Initialize game
function initGame() {
    try {
        // Load high score from localStorage
        gameState.highScore = parseInt(localStorage.getItem('reactionDotsHighScore')) || 0;

        // Create dots grid
        createDotsGrid();

        // Create lives indicators
        createLivesIndicators();

        // Add event listeners
        addEventListeners();

        // Start the game
        startGame();

    } catch (error) {
        showErrorOverlay();
        console.error('Game initialization error:', error);
    }
}

// Create dots grid
function createDotsGrid() {
    dotsGrid.innerHTML = '';
    for (let i = 0; i < DOT_COUNT; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.dataset.index = i;
        dot.addEventListener('click', handleDotClick);
        dotsGrid.appendChild(dot);
    }
}

// Create lives indicators
function createLivesIndicators() {
    livesContainer.innerHTML = '';
    for (let i = 0; i < INITIAL_LIVES; i++) {
        const life = document.createElement('div');
        life.className = 'life';
        livesContainer.appendChild(life);
    }
}

// Add event listeners
function addEventListeners() {
    // Help button toggle
    helpButton.addEventListener('click', toggleHelpPanel);
    closeHelp.addEventListener('click', toggleHelpPanel);

    // Restart button
    restartButton.addEventListener('click', startGame);

    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
}

// Toggle help panel
function toggleHelpPanel() {
    helpPanel.classList.toggle('hidden');
}

// Handle key press
function handleKeyPress(event) {
    switch (event.key) {
        case 'Escape':
            togglePause();
            break;
        case 'q':
        case 'Q':
            navigateToLanding();
            break;
    }
}

// Navigate to landing page
function navigateToLanding() {
    window.location.href = '../../index.html';
}

// Toggle pause state
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    pauseOverlay.classList.toggle('hidden', !gameState.isPaused);

    if (gameState.isPaused) {
        gameState.timers.forEach(timer => clearTimeout(timer));
    } else if (gameState.isPlaying) {
        illuminateRandomDot();
    }
}

// Start game
function startGame() {
    // Reset game state
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.lives = INITIAL_LIVES;
    gameState.activeDots = [];
    gameState.illuminationTime = MAX_ILLUMINATION_TIME;
    gameState.timers = [];

    // Update UI
    scoreDisplay.textContent = gameState.score;
    updateLivesDisplay();

    // Hide overlays
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    // Reset dots
    resetDots();

    // Start illuminating dots
    illuminateRandomDot();
}

// Reset all dots to inactive state
function resetDots() {
    document.querySelectorAll('.dot').forEach(dot => {
        dot.classList.remove('active', 'success', 'failure');
    });
}

// Illuminate random dot
function illuminateRandomDot() {
    if (!gameState.isPlaying || gameState.isPaused) return;

    try {
        // Clear any previous timers
        gameState.timers.forEach(timer => clearTimeout(timer));
        gameState.timers = [];

        // Get all inactive dots
        const inactiveDots = Array.from(document.querySelectorAll('.dot'))
            .filter(dot => !dot.classList.contains('active'));

        // If no inactive dots, wait and try again
        if (inactiveDots.length === 0 || gameState.activeDots.length >= MAX_ACTIVE_DOTS) {
            const timer = setTimeout(illuminateRandomDot, 500);
            gameState.timers.push(timer);
            return;
        }

        // Select a random inactive dot
        const randomIndex = Math.floor(Math.random() * inactiveDots.length);
        const selectedDot = inactiveDots[randomIndex];

        // Add to active dots
        gameState.activeDots.push(selectedDot.dataset.index);

        // Activate dot
        selectedDot.classList.add('active');

        // Calculate a more dynamic illumination time that gets shorter with higher scores
        // This makes the dots disappear faster as the game progresses
        const currentIlluminationTime = Math.max(
            MIN_ILLUMINATION_TIME,
            gameState.illuminationTime - (Math.floor(gameState.score / 8) * 30) // Changed from 5 to 8 and 50 to 30
        );

        // Set timeout to deactivate dot and reduce life if not clicked
        const deactivationTimer = setTimeout(() => {
            if (gameState.isPlaying && !gameState.isPaused) {
                // If dot is still active, mark as missed
                if (selectedDot.classList.contains('active')) {
                    selectedDot.classList.remove('active');
                    selectedDot.classList.add('failure');
                    reduceLife();

                    // Remove from active dots
                    const dotIndex = gameState.activeDots.indexOf(selectedDot.dataset.index);
                    if (dotIndex > -1) {
                        gameState.activeDots.splice(dotIndex, 1);
                    }

                    // Reset animation after it completes
                    setTimeout(() => {
                        selectedDot.classList.remove('failure');
                    }, 400);
                }
            }
        }, currentIlluminationTime); // Use the dynamically calculated time

        gameState.timers.push(deactivationTimer);

        // Schedule next dot illumination with dynamic timing based on score
        // As score increases, dots appear more frequently
        const spawnDelay = Math.max(
            DOT_SPAWN_RATE_MIN,
            DOT_SPAWN_RATE_MAX - (gameState.score * 10) // Decreased from 15 to 10
        );
        const nextDotTimer = setTimeout(illuminateRandomDot, spawnDelay);
        gameState.timers.push(nextDotTimer);

    } catch (error) {
        showErrorOverlay();
        console.error('Error illuminating dots:', error);
    }
}

// Handle dot click
function handleDotClick(event) {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const dot = event.target;

    // Check if dot is active (illuminated)
    if (dot.classList.contains('active')) {
        // Success - clicked an active dot
        dot.classList.remove('active');
        dot.classList.add('success');

        // Remove from active dots
        const dotIndex = gameState.activeDots.indexOf(dot.dataset.index);
        if (dotIndex > -1) {
            gameState.activeDots.splice(dotIndex, 1);
        }

        // Update score
        gameState.score++;
        scoreDisplay.textContent = gameState.score;

        // Increase difficulty every few points - more aggressive formula
        if (gameState.score % DIFFICULTY_INCREASE_INTERVAL === 0) {
            // More balanced difficulty increase
            gameState.illuminationTime = Math.max(
                MIN_ILLUMINATION_TIME,
                gameState.illuminationTime - ILLUMINATION_TIME_DECREASE - Math.floor(gameState.score / 10) * 8
            );

            // Reduced chance to spawn a new dot immediately
            if (gameState.activeDots.length < MAX_ACTIVE_DOTS && Math.random() > 0.6) { // Changed from 0.3 to 0.6
                illuminateRandomDot();
            }
        }

        // Reset animation after it completes
        setTimeout(() => {
            dot.classList.remove('success');
        }, 400);
    } else {
        // Failure - clicked an inactive dot
        dot.classList.add('failure');
        reduceLife();

        // Reset animation after it completes
        setTimeout(() => {
            dot.classList.remove('failure');
        }, 400);
    }
}

// Reduce life and check for game over
function reduceLife() {
    gameState.lives--;
    updateLivesDisplay();

    if (gameState.lives <= 0) {
        gameOver();
    }
}

// Update lives display
function updateLivesDisplay() {
    const lifeElements = document.querySelectorAll('.life');
    lifeElements.forEach((life, index) => {
        life.classList.toggle('lost', index >= gameState.lives);
    });
}

// Game over
function gameOver() {
    gameState.isPlaying = false;

    // Clear all timers
    gameState.timers.forEach(timer => clearTimeout(timer));
    gameState.timers = [];

    // Check for high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('reactionDotsHighScore', gameState.highScore);
    }

    // Update game over screen
    finalScoreDisplay.textContent = gameState.score;
    highScoreDisplay.textContent = gameState.highScore;

    // Show game over overlay
    gameOverOverlay.classList.remove('hidden');
}

// Show error overlay
function showErrorOverlay() {
    errorOverlay.classList.remove('hidden');
}

// Handle window errors
window.addEventListener('error', (event) => {
    showErrorOverlay();
    console.error('Global error:', event.error);
});

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);
