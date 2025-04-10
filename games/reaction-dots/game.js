/**
 * Reaction Dots - A simple reaction game
 * Test your reflexes by clicking dots when they change color
 */

// Game configuration
const config = {
    dotCount: 12,           // Number of dots in the grid
    initialLives: 3,        // Starting number of lives
    baseInterval: 2000,     // Base time between dot activations (ms)
    minInterval: 800,       // Minimum time between dot activations at max difficulty (ms)
    activeTime: 1000,       // Time a dot stays active (ms)
    minActiveTime: 600,     // Minimum time a dot stays active at max difficulty (ms)
    difficultyStep: 5,      // Score increment that increases difficulty
    wrongPenalty: 500       // Time penalty for wrong clicks (ms)
};

// Game state
let state = {
    score: 0,
    lives: config.initialLives,
    gameActive: true,
    dotsActive: false,
    lastDotIndex: -1,
    difficultyLevel: 0,
    timeoutId: null
};

// DOM Elements
let gameArea, scoreDisplay, livesDisplay, gameOverScreen, finalScoreDisplay;
let dots = [];

// Initialize the game
function initGame() {
    // Get DOM elements
    gameArea = document.getElementById('gameArea');
    scoreDisplay = document.getElementById('score');
    livesDisplay = document.getElementById('lives');
    gameOverScreen = document.getElementById('gameOver');
    finalScoreDisplay = document.getElementById('finalScore');

    // Create dots
    createDots();

    // Set up event listeners
    document.getElementById('restartButton').addEventListener('click', restartGame);

    // Add keyboard controls (space to restart)
    document.addEventListener('keydown', function (event) {
        if (event.code === 'Space' && !state.gameActive) {
            restartGame();
        }
    });

    // Start the game loop
    startGameLoop();
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
        livesDisplay.textContent = state.lives;

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
            livesDisplay.textContent = state.lives;

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
    gameOverScreen.style.display = 'block';

    // Clear any active timeouts
    if (state.timeoutId) {
        clearTimeout(state.timeoutId);
    }
}

// Restart the game
function restartGame() {
    // Reset game state
    state = {
        score: 0,
        lives: config.initialLives,
        gameActive: true,
        dotsActive: false,
        lastDotIndex: -1,
        difficultyLevel: 0,
        timeoutId: null
    };

    // Update display
    scoreDisplay.textContent = state.score;
    livesDisplay.textContent = state.lives;
    gameOverScreen.style.display = 'none';

    // Remove any active classes from dots
    dots.forEach(dot => {
        dot.classList.remove('target', 'correct', 'wrong');
    });

    // Start the game loop
    startGameLoop();
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initGame);
