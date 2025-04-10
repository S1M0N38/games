/**
 * Reaction Dots - A simple reaction game
 * Test your reflexes by clicking dots when they change color
 * Minimal black and white aesthetic
 */

// Game configuration
const config = {
    dotCount: 25,           // Increased from 12 to 25 dots
    initialLives: 3,        // Starting number of lives
    baseInterval: 1800,     // Slightly reduced base time between dot activations (ms)
    minInterval: 700,       // Slightly reduced minimum time between dot activations (ms)
    activeTime: 950,        // Slightly reduced time a dot stays active (ms)
    minActiveTime: 550,     // Slightly reduced minimum time a dot stays active (ms)
    difficultyStep: 4,      // Reduced difficulty step to account for more dots
    wrongPenalty: 400       // Slightly reduced time penalty for wrong clicks (ms)
};

// Game state
let state = {
    score: 0,
    lives: config.initialLives,
    gameActive: false,
    dotsActive: false,
    lastDotIndex: -1,
    difficultyLevel: 0,
    timeoutId: null
};

// DOM Elements
let gameArea, scoreDisplay, livesDisplay, gameOverScreen, finalScoreDisplay, startMenu;
let dots = [];

// Initialize the game
function initGame() {
    // Get DOM elements
    gameArea = document.getElementById('gameArea');
    scoreDisplay = document.getElementById('score');
    livesDisplay = document.getElementById('livesDisplay');
    gameOverScreen = document.getElementById('gameOver');
    finalScoreDisplay = document.getElementById('finalScore');
    startMenu = document.getElementById('startMenu');

    // Set up event listeners
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', restartGame);

    // Add keyboard controls (space to restart)
    document.addEventListener('keydown', function (event) {
        if (event.code === 'Space') {
            if (!state.gameActive) {
                if (gameOverScreen.classList.contains('hidden')) {
                    startGame();
                } else {
                    restartGame();
                }
            }
        }
    });

    // Create dots
    createDots();

    // Initialize lives display
    updateLivesDisplay();
}

// Create the dots in the game area
function createDots() {
    gameArea.innerHTML = '';
    dots = [];

    for (let i = 0; i < config.dotCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.dataset.index = i;

        // Add click event listener
        dot.addEventListener('click', function () {
            handleDotClick(i);
        });

        gameArea.appendChild(dot);
        dots.push(dot);
    }
}

// Update the lives display
function updateLivesDisplay() {
    livesDisplay.innerHTML = '';

    for (let i = 0; i < config.initialLives; i++) {
        const lifeElement = document.createElement('div');
        lifeElement.className = i < state.lives ? 'life' : 'life lost';
        livesDisplay.appendChild(lifeElement);
    }
}

// Start the game
function startGame() {
    // Reset game state
    state.score = 0;
    state.lives = config.initialLives;
    state.gameActive = true;
    state.dotsActive = false;
    state.lastDotIndex = -1;
    state.difficultyLevel = 0;

    // Update display
    scoreDisplay.textContent = state.score;
    updateLivesDisplay();

    // Hide the start menu
    startMenu.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    // Start game loop
    startGameLoop();
}

// Handle dot click events
function handleDotClick(index) {
    if (!state.gameActive) return;

    const dot = dots[index];

    if (dot.classList.contains('target')) {
        // Correct click!
        state.score++;
        scoreDisplay.textContent = state.score;

        // Update difficulty based on score
        state.difficultyLevel = Math.floor(state.score / config.difficultyStep);

        // Visual feedback
        dot.classList.remove('target');
        dot.classList.add('correct');
        setTimeout(() => {
            dot.classList.remove('correct');
        }, 300);

        // Clear the current active dot timeout
        if (state.timeoutId) {
            clearTimeout(state.timeoutId);
        }

        // Continue game loop immediately
        state.dotsActive = false;
        startGameLoop();
    } else {
        // Wrong click!
        state.lives--;
        updateLivesDisplay();

        // Visual feedback
        dot.classList.add('wrong');
        setTimeout(() => {
            dot.classList.remove('wrong');
        }, 300);

        // Apply time penalty
        setTimeout(() => {
            // Check if game is over
            if (state.lives <= 0) {
                endGame();
            }
        }, config.wrongPenalty);
    }
}

// Start the game loop
function startGameLoop() {
    if (!state.gameActive || state.dotsActive) return;

    // Calculate intervals based on difficulty
    const intervalReduction = Math.min(config.baseInterval - config.minInterval,
        state.difficultyLevel * 100);
    const currentInterval = config.baseInterval - intervalReduction;

    const activeReduction = Math.min(config.activeTime - config.minActiveTime,
        state.difficultyLevel * 30);
    const currentActiveTime = config.activeTime - activeReduction;

    // Set a timeout to activate a random dot
    setTimeout(() => {
        activateRandomDot(currentActiveTime);
    }, currentInterval);
}

// Activate a random dot
function activateRandomDot(activeTime) {
    if (!state.gameActive) return;

    state.dotsActive = true;

    // Select a random dot (different from the last one)
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * config.dotCount);
    } while (randomIndex === state.lastDotIndex && config.dotCount > 1);

    state.lastDotIndex = randomIndex;

    // Activate the dot
    const dot = dots[randomIndex];
    dot.classList.add('target');

    // Set a timeout to deactivate the dot
    state.timeoutId = setTimeout(() => {
        // If dot is still active, player missed it
        if (dot.classList.contains('target')) {
            dot.classList.remove('target');
            state.lives--;
            updateLivesDisplay();

            // Check if game is over
            if (state.lives <= 0) {
                endGame();
                return;
            }
        }

        // Continue the game loop
        state.dotsActive = false;
        startGameLoop();
    }, activeTime);
}

// End the game
function endGame() {
    state.gameActive = false;
    finalScoreDisplay.textContent = state.score;
    gameOverScreen.classList.remove('hidden');

    // Clear any active timeouts
    if (state.timeoutId) {
        clearTimeout(state.timeoutId);
    }
}

// Restart the game
function restartGame() {
    startGame();
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initGame);
