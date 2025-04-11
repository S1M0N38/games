/**
 * Game Template - Core Structure
 * Minimalist black and white game
 * 
 * Replace placeholder code with your specific game logic
 * while maintaining the overall structure and conventions.
 */

// ==========================================
// Game constants
// ==========================================
const CONFIG = {
    // Game settings
    INITIAL_LIVES: 3,
    STORAGE_KEY: 'gameNameHighScore', // Replace with actual game name

    // Visual settings (adjust as needed for your game)
    VISUAL: {
        MAIN_COLOR: '#FFFFFF',
        SECONDARY_COLOR: '#999999',
        TRANSITION_SPEED: 0.3, // seconds
    },

    // Physics/gameplay constants
    PHYSICS: {
        // Add game-specific physics constants here
    },

    // Various states the game can be in
    GAME_STATE: {
        INTRO: 'intro',
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
    state: CONFIG.GAME_STATE.INTRO,
    score: 0,
    lives: CONFIG.INITIAL_LIVES,
    highScore: 0,
    isPlaying: false,
    isPaused: false,

    // Animation and timing
    lastTime: 0,
    delta: 0,
    animationFrameId: null,
    timers: [],

    // Input state (modify based on your input method)
    keys: {
        left: false,
        right: false,
        up: false,
        down: false
    },
    mouse: {
        x: 0,
        y: 0
    },

    // Game-specific state variables
    // Add your custom state variables here
};

// ==========================================
// DOM elements
// ==========================================
let canvas, ctx;
let scoreDisplay, livesContainer;
let helpButton, helpPanel, closeHelp;
let pauseOverlay, gameOverOverlay, finalScoreDisplay, highScoreDisplay, restartButton;
let errorOverlay;

// ==========================================
// Initialization
// ==========================================
function initGame() {
    try {
        // Get DOM elements
        canvas = document.getElementById('game-canvas');
        ctx = canvas.getContext('2d');

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

        // Set canvas dimensions
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Load high score from localStorage
        gameState.highScore = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;

        // Create lives indicators
        createLivesIndicators();

        // Add event listeners
        addEventListeners();

        // Initialize game-specific elements
        initializeGameElements();

        // Start in intro state
        startIntro();

    } catch (error) {
        handleError('Game initialization error:', error);
    }
}

// ==========================================
// Setup functions
// ==========================================
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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
    // UI controls
    helpButton.addEventListener('click', toggleHelpPanel);
    closeHelp.addEventListener('click', toggleHelpPanel);
    restartButton.addEventListener('click', startGame);

    // Add either keyboard OR mouse controls (not both)
    // Uncomment the appropriate section:

    // OPTION 1: Keyboard controls
    /*
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    */

    // OPTION 2: Mouse controls
    /*
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleMouseClick);
    */

    // Universal keyboard controls
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'Escape':
                togglePause();
                break;
            case 'q':
            case 'Q':
                navigateToLanding();
                break;
        }
    });

    // Error handling
    window.addEventListener('error', (event) => {
        handleError('Global error:', event.error);
    });
}

function initializeGameElements() {
    // Initialize your game-specific elements here
    // This function should set up any game objects, arrays, etc.
}

// ==========================================
// UI functions
// ==========================================
function toggleHelpPanel() {
    helpPanel.classList.toggle('hidden');
}

function togglePause() {
    if (!gameState.isPlaying) return;

    gameState.isPaused = !gameState.isPaused;
    gameState.state = gameState.isPaused ? CONFIG.GAME_STATE.PAUSED : CONFIG.GAME_STATE.PLAYING;
    pauseOverlay.classList.toggle('hidden', !gameState.isPaused);

    if (gameState.isPaused) {
        // Clear any animation frame
        cancelAnimationFrame(gameState.animationFrameId);

        // Clear any active timers
        gameState.timers.forEach(timer => clearTimeout(timer));
        gameState.timers = [];
    } else {
        // Resume game loop
        gameState.lastTime = performance.now();
        gameLoop(gameState.lastTime);
    }
}

function updateLivesDisplay() {
    const lifeElements = document.querySelectorAll('.life');
    lifeElements.forEach((life, index) => {
        life.classList.toggle('lost', index >= gameState.lives);
    });
}

function navigateToLanding() {
    window.location.href = '../../index.html';
}

// ==========================================
// Game state functions
// ==========================================
function startIntro() {
    gameState.state = CONFIG.GAME_STATE.INTRO;
    gameState.isPlaying = false;
    gameState.isPaused = false;

    // Intro animation or setup here

    // Auto-transition to game or wait for input to start
    setTimeout(() => {
        startGame();
    }, 2000); // Adjust timing as needed
}

function startGame() {
    // Reset game state
    gameState.state = CONFIG.GAME_STATE.PLAYING;
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.lives = CONFIG.INITIAL_LIVES;

    // Reset game-specific state
    resetGameState();

    // Update UI
    scoreDisplay.textContent = gameState.score;
    updateLivesDisplay();

    // Hide overlays
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    // Start game loop
    gameState.lastTime = performance.now();
    gameLoop(gameState.lastTime);
}

function resetGameState() {
    // Reset your game-specific state here
    // This function should reset positions, velocities, etc.
}

function gameOver() {
    gameState.state = CONFIG.GAME_STATE.GAME_OVER;
    gameState.isPlaying = false;

    // Cancel animation frame and clear timers
    cancelAnimationFrame(gameState.animationFrameId);
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

    // Show game over overlay after a short delay
    setTimeout(() => {
        gameOverOverlay.classList.remove('hidden');
    }, 1000);
}

// ==========================================
// Input handlers
// ==========================================
function handleKeyDown(event) {
    // Handle keyboard input based on your game's needs
    // Example:
    switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            gameState.keys.left = true;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            gameState.keys.right = true;
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            gameState.keys.up = true;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            gameState.keys.down = true;
            break;
    }
}

function handleKeyUp(event) {
    // Handle keyboard input release
    // Example:
    switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            gameState.keys.left = false;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            gameState.keys.right = false;
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
            gameState.keys.up = false;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            gameState.keys.down = false;
            break;
    }
}

function handleMouseMove(event) {
    // Track mouse position for mouse-controlled games
    gameState.mouse.x = event.clientX;
    gameState.mouse.y = event.clientY;
}

function handleMouseClick(event) {
    // Handle mouse clicks for mouse-controlled games
    // Implementation depends on your specific game
}

// ==========================================
// Game loop
// ==========================================
function gameLoop(timestamp) {
    if (!gameState.isPlaying || gameState.isPaused) return;

    // Calculate delta time for smooth animation
    gameState.delta = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;

    try {
        // Update game state
        update(gameState.delta / 1000); // Convert to seconds

        // Render frame
        render();

        // Continue loop
        gameState.animationFrameId = requestAnimationFrame(gameLoop);
    } catch (error) {
        handleError('Game loop error:', error);
    }
}

// ==========================================
// Update and render
// ==========================================
function update(deltaTime) {
    // Main game update logic goes here
    // This function updates the game state based on:
    // - Input
    // - Physics
    // - Game rules
    // - Collision detection

    // Example:
    updateGameElements(deltaTime);
    checkCollisions();
    updateScore();
}

function updateGameElements(deltaTime) {
    // Update all game elements based on deltaTime
    // Example:
    // player.x += player.velocity.x * deltaTime;
    // enemies.forEach(enemy => enemy.update(deltaTime));
}

function checkCollisions() {
    // Detect and handle collisions between game elements
    // Example:
    // if (checkPlayerEnemyCollision()) {
    //     reduceLife();
    // }
}

function updateScore() {
    // Update score based on game events
    // Example:
    // if (collectibleCollected) {
    //     gameState.score += 10;
    //     scoreDisplay.textContent = gameState.score;
    // }
}

function reduceLife() {
    gameState.lives--;
    updateLivesDisplay();

    if (gameState.lives <= 0) {
        gameOver();
    }
}

function render() {
    // Clear canvas
    ctx.fillStyle = CONFIG.VISUAL.BACKGROUND_COLOR || '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render based on current game state
    switch (gameState.state) {
        case CONFIG.GAME_STATE.INTRO:
            renderIntro();
            break;
        case CONFIG.GAME_STATE.PLAYING:
            renderGame();
            break;
        case CONFIG.GAME_STATE.PAUSED:
            renderGame(); // Still render the game while paused
            break;
        case CONFIG.GAME_STATE.GAME_OVER:
            renderGameOver();
            break;
    }
}

function renderIntro() {
    // Render intro screen
    // Example: animations, title, etc.
}

function renderGame() {
    // Render main gameplay elements
    renderGameElements();
}

function renderGameOver() {
    // Render game over effects/animations
    // The overlay is handled by HTML/CSS
}

function renderGameElements() {
    // Render all game-specific elements
    // Example:
    // renderPlayer();
    // renderEnemies();
    // renderCollectibles();
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