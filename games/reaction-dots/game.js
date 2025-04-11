/**
 * Reaction Dots - A minimal reflex-based game
 * Test your reaction time by clicking illuminated dots before they disappear
 */

// ==========================================
// Game constants
// ==========================================
const CONFIG = {
    // Game settings
    GRID_SIZE: 5, // 5x5 grid
    DOT_COUNT: 25, // 5x5 grid = 25 dots
    INITIAL_LIVES: 3,
    STORAGE_KEY: 'reactionDotsHighScore',

    // Timing and difficulty
    ILLUMINATION: {
        MIN_TIME: 350, // ms (minimum time a dot stays illuminated)
        MAX_TIME: 1000, // ms (maximum time a dot stays illuminated)
        TIME_DECREASE: 50, // ms per level (how much illumination time decreases)
    },

    DIFFICULTY: {
        INCREASE_INTERVAL: 3, // score points before increasing difficulty
        MAX_ACTIVE_DOTS: 3, // Maximum number of simultaneously active dots
        SPAWN_RATE_MIN: 500, // Minimum time between new dots (ms)
        SPAWN_RATE_MAX: 1200, // Maximum time between new dots (ms)
    },

    // Visual settings
    VISUAL: {
        DOT_SIZE: 40, // px (defined in CSS)
        DOT_GAP: 20, // px (defined in CSS)
        TRANSITION_SPEED: 0.3, // seconds
    },

    // Game states
    GAME_STATE: {
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameover',
        ERROR: 'error'
    }
};

// ==========================================
// Game state
// ==========================================
const gameState = {
    // Core game state
    state: CONFIG.GAME_STATE.PLAYING,
    score: 0,
    lives: CONFIG.INITIAL_LIVES,
    highScore: 0,
    isPlaying: false,
    isPaused: false,

    // Game-specific state
    activeDots: [],
    illuminationTime: CONFIG.ILLUMINATION.MAX_TIME,
    timers: []
};

// ==========================================
// DOM elements
// ==========================================
let dotsGrid, scoreDisplay, livesContainer;
let helpButton, helpPanel, closeHelp;
let pauseOverlay, gameOverOverlay, finalScoreDisplay, highScoreDisplay, restartButton;
let errorOverlay;

// ==========================================
// Initialization
// ==========================================
function initGame() {
    try {
        // Get DOM elements
        dotsGrid = document.getElementById('dots-grid');
        scoreDisplay = document.getElementById('score');
        livesContainer = document.getElementById('lives-container');

        helpButton = document.getElementById('help-button');
        helpPanel = document.getElementById('help-panel');
        closeHelp = document.getElementById('close-help');

        pauseOverlay = document.getElementById('pause-overlay');
        gameOverOverlay = document.getElementById('game-over');
        finalScoreDisplay = document.getElementById('final-score');
        highScoreDisplay = document.getElementById('high-score');
        restartButton = document.getElementById('restart-button');

        errorOverlay = document.getElementById('error-overlay');

        // Load high score from localStorage
        gameState.highScore = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;

        // Create dots grid
        createDotsGrid();

        // Create lives indicators
        createLivesIndicators();

        // Add event listeners
        addEventListeners();

        // Start the game
        startGame();

    } catch (error) {
        handleError('Game initialization error:', error);
    }
}

// ==========================================
// Setup functions
// ==========================================
function createDotsGrid() {
    dotsGrid.innerHTML = '';
    for (let i = 0; i < CONFIG.DOT_COUNT; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.dataset.index = i;
        dot.addEventListener('click', handleDotClick);
        dotsGrid.appendChild(dot);
    }
}

function createLivesIndicators() {
    livesContainer.innerHTML = '';
    for (let i = 0; i < CONFIG.INITIAL_LIVES; i++) {
        const life = document.createElement('div');
        life.className = 'life';
        livesContainer.appendChild(life);
    }
}

function addEventListeners() {
    // Help button toggle
    helpButton.addEventListener('click', toggleHelpPanel);
    closeHelp.addEventListener('click', toggleHelpPanel);

    // Restart button
    restartButton.addEventListener('click', startGame);

    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);

    // Error handling
    window.addEventListener('error', (event) => {
        handleError('Global error:', event.error);
    });
}

// ==========================================
// UI functions
// ==========================================
function toggleHelpPanel() {
    helpPanel.classList.toggle('hidden');
}

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

function navigateToLanding() {
    window.location.href = '../../index.html';
}

function togglePause() {
    if (!gameState.isPlaying) return;

    gameState.isPaused = !gameState.isPaused;
    gameState.state = gameState.isPaused ? CONFIG.GAME_STATE.PAUSED : CONFIG.GAME_STATE.PLAYING;
    pauseOverlay.classList.toggle('hidden', !gameState.isPaused);

    if (gameState.isPaused) {
        // Clear all timers
        gameState.timers.forEach(timer => clearTimeout(timer));
        gameState.timers = [];
    } else if (gameState.isPlaying) {
        // Resume game
        illuminateRandomDot();
    }
}

function updateLivesDisplay() {
    const lifeElements = document.querySelectorAll('.life');
    lifeElements.forEach((life, index) => {
        life.classList.toggle('lost', index >= gameState.lives);
    });
}

// ==========================================
// Game state functions
// ==========================================
function startGame() {
    // Reset game state
    gameState.state = CONFIG.GAME_STATE.PLAYING;
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.lives = CONFIG.INITIAL_LIVES;
    gameState.activeDots = [];
    gameState.illuminationTime = CONFIG.ILLUMINATION.MAX_TIME;
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

function resetDots() {
    document.querySelectorAll('.dot').forEach(dot => {
        dot.classList.remove('active', 'success', 'failure');
    });
}

function gameOver() {
    gameState.state = CONFIG.GAME_STATE.GAME_OVER;
    gameState.isPlaying = false;

    // Clear all timers
    gameState.timers.forEach(timer => clearTimeout(timer));
    gameState.timers = [];

    // Check for high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem(CONFIG.STORAGE_KEY, gameState.highScore);
    }

    // Update game over screen
    finalScoreDisplay.textContent = gameState.score;
    highScoreDisplay.textContent = gameState.highScore;

    // Show game over overlay
    gameOverOverlay.classList.remove('hidden');
}

// ==========================================
// Game mechanics
// ==========================================
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
        if (inactiveDots.length === 0 || gameState.activeDots.length >= CONFIG.DIFFICULTY.MAX_ACTIVE_DOTS) {
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

        // Calculate illumination time based on difficulty
        const currentIlluminationTime = Math.max(
            CONFIG.ILLUMINATION.MIN_TIME,
            gameState.illuminationTime - (Math.floor(gameState.score / 8) * 30)
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
        }, currentIlluminationTime);

        gameState.timers.push(deactivationTimer);

        // Schedule next dot illumination with dynamic timing based on score
        const spawnDelay = Math.max(
            CONFIG.DIFFICULTY.SPAWN_RATE_MIN,
            CONFIG.DIFFICULTY.SPAWN_RATE_MAX - (gameState.score * 10)
        );
        const nextDotTimer = setTimeout(illuminateRandomDot, spawnDelay);
        gameState.timers.push(nextDotTimer);

    } catch (error) {
        handleError('Error illuminating dots:', error);
    }
}

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

        // Increase difficulty every few points
        if (gameState.score % CONFIG.DIFFICULTY.INCREASE_INTERVAL === 0) {
            // Adjust illumination time
            gameState.illuminationTime = Math.max(
                CONFIG.ILLUMINATION.MIN_TIME,
                gameState.illuminationTime - CONFIG.ILLUMINATION.TIME_DECREASE - Math.floor(gameState.score / 10) * 8
            );

            // Maybe spawn a new dot immediately
            if (gameState.activeDots.length < CONFIG.DIFFICULTY.MAX_ACTIVE_DOTS && Math.random() > 0.6) {
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

function reduceLife() {
    gameState.lives--;
    updateLivesDisplay();

    if (gameState.lives <= 0) {
        gameOver();
    }
}

// ==========================================
// Error handling
// ==========================================
function handleError(message, error) {
    console.error(message, error);
    gameState.state = CONFIG.GAME_STATE.ERROR;
    showErrorOverlay();
}

function showErrorOverlay() {
    errorOverlay.classList.remove('hidden');
}

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', initGame);
