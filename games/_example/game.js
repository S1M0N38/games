// Game constants
const CONFIG = {
    INITIAL_LIVES: 3,
    STORAGE_KEY: 'exampleGameHighScore', // TODO: Replace with actual game name

    VISUAL: {
        MAIN_COLOR: '#FFFFFF',
        SECONDARY_COLOR: '#999999',
        TRANSITION_SPEED: 0.3, // seconds
    },

    PHYSICS: {
        // TODO: Add game-specific physics constants here
    },

    GAME_STATE: {
        INTRO: 'intro',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameover',
        ERROR: 'error'
    }
};

// Game state
const gameState = {
    state: CONFIG.GAME_STATE.INTRO,
    score: 0,
    lives: CONFIG.INITIAL_LIVES,
    highScore: 0,
    isPlaying: false,
    isPaused: false,

    lastTime: 0,
    delta: 0,
    animationFrameId: null,
    timers: [],

    // Input state (modify based on your input method)
    keys: { left: false, right: false, up: false, down: false },
    mouse: { x: 0, y: 0 },

    // TODO: Add game-specific state variables here
};

// DOM elements
let canvas, ctx;
let scoreDisplay, livesContainer;
let helpButton, helpPanel, closeHelp;
let pauseOverlay, gameOverOverlay, finalScoreDisplay, highScoreDisplay, restartButton;
let errorOverlay;

// Initialization
function initGame() {
    try {
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

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        gameState.highScore = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;

        createLivesIndicators();
        addEventListeners();
        initializeGameElements();
        startIntro();

    } catch (error) {
        handleError('Game initialization error:', error);
    }
}

// Setup functions
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
    helpButton.addEventListener('click', toggleHelpPanel);
    closeHelp.addEventListener('click', toggleHelpPanel);
    restartButton.addEventListener('click', startGame);

    // --- CHOOSE ONE INPUT METHOD ---
    // TODO: Uncomment and implement EITHER keyboard OR mouse controls.
    // OPTION 1: Keyboard controls
    /*
    console.log("Keyboard input enabled for this game.");
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    */
    // OPTION 2: Mouse controls
    /*
    console.log("Mouse input enabled for this game.");
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleMouseClick);
    */
    // --- END INPUT METHOD CHOICE ---

    // Universal keyboard controls
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'Escape': togglePause(); break;
            case 'q': case 'Q': navigateToLanding(); break;
        }
    });

    window.addEventListener('error', (event) => {
        handleError('Global error:', event.error);
    });
}

function initializeGameElements() {
    // TODO: Initialize game-specific elements (objects, arrays, etc.)
}

// UI functions
function toggleHelpPanel() {
    helpPanel.classList.toggle('hidden');
}

function togglePause() {
    if (!gameState.isPlaying) return;

    gameState.isPaused = !gameState.isPaused;
    gameState.state = gameState.isPaused ? CONFIG.GAME_STATE.PAUSED : CONFIG.GAME_STATE.PLAYING;
    pauseOverlay.classList.toggle('hidden', !gameState.isPaused);

    if (gameState.isPaused) {
        cancelAnimationFrame(gameState.animationFrameId);
        gameState.timers.forEach(timer => clearTimeout(timer));
        gameState.timers = [];
    } else {
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

// Game state functions
function startIntro() {
    gameState.state = CONFIG.GAME_STATE.INTRO;
    gameState.isPlaying = false;
    gameState.isPaused = false;
    // TODO: Add intro animation or setup here
    setTimeout(() => { startGame(); }, 2000); // Adjust timing as needed
}

function startGame() {
    gameState.state = CONFIG.GAME_STATE.PLAYING;
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.lives = CONFIG.INITIAL_LIVES;

    resetGameState();

    scoreDisplay.textContent = gameState.score;
    updateLivesDisplay();
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    gameState.lastTime = performance.now();
    gameLoop(gameState.lastTime);
}

function resetGameState() {
    // TODO: Reset game-specific state (positions, velocities, etc.)
}

function gameOver() {
    gameState.state = CONFIG.GAME_STATE.GAME_OVER;
    gameState.isPlaying = false;

    cancelAnimationFrame(gameState.animationFrameId);
    gameState.timers.forEach(timer => clearTimeout(timer));
    gameState.timers = [];

    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem(CONFIG.STORAGE_KEY, gameState.highScore);
    }

    finalScoreDisplay.textContent = `${gameState.score}`; // Display final score. Only the number, no text.
    highScoreDisplay.textContent = `${gameState.highScore}`; // Display high score. Only the number, no text.

    setTimeout(() => { gameOverOverlay.classList.remove('hidden'); }, 1000);
}

// Input handlers
// --- TODO: Implement the handlers for the CHOSEN input method ---
// Example Keyboard Handlers (if OPTION 1 chosen)
/*
function handleKeyDown(event) { ... }
function handleKeyUp(event) { ... }
*/
// Example Mouse Handlers (if OPTION 2 chosen)
/*
function handleMouseMove(event) { ... }
function handleMouseClick(event) { ... }
*/
// --- End Input Handlers ---

// Game loop
function gameLoop(timestamp) {
    if (!gameState.isPlaying || gameState.isPaused) return;

    gameState.delta = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;

    try {
        update(gameState.delta / 1000); // Delta time in seconds
        render();
        gameState.animationFrameId = requestAnimationFrame(gameLoop);
    } catch (error) {
        handleError('Game loop error:', error);
    }
}

// Update and render
function update(deltaTime) {
    // TODO: Main game update logic (input, physics, rules, collisions)
    updateGameElements(deltaTime);
    checkCollisions();
    updateScore();
}

function updateGameElements(deltaTime) {
    // TODO: Update all game elements based on deltaTime
}

function checkCollisions() {
    // TODO: Detect and handle collisions
}

function updateScore() {
    // TODO: Update score based on game events
    // Example: gameState.score += 10; scoreDisplay.textContent = gameState.score;
}

function reduceLife() {
    gameState.lives--;
    updateLivesDisplay();
    if (gameState.lives <= 0) {
        gameOver();
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (gameState.state) {
        case CONFIG.GAME_STATE.INTRO: renderIntro(); break;
        case CONFIG.GAME_STATE.PLAYING: renderGame(); break;
        case CONFIG.GAME_STATE.PAUSED: renderGame(); break; // Still render game when paused
        case CONFIG.GAME_STATE.GAME_OVER: renderGameOver(); break;
    }
}

function renderIntro() {
    // TODO: Render intro screen elements
}

function renderGame() {
    // TODO: Render main gameplay elements
    renderGameElements();
}

function renderGameOver() {
    // TODO: Render any specific game over effects/animations if needed
    // Overlay is handled by HTML/CSS
}

function renderGameElements() {
    // TODO: Render all game-specific elements (player, enemies, etc.)
}

// Error handling
function handleError(message, error) {
    console.error(message, error);
    gameState.state = CONFIG.GAME_STATE.ERROR;
    showErrorOverlay();
}

function showErrorOverlay() {
    errorOverlay.classList.remove('hidden');
}

// Initialization
document.addEventListener('DOMContentLoaded', initGame);