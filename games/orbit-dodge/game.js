// Game constants
const CONFIG = {
    INITIAL_LIVES: 3,
    STORAGE_KEY: 'orbitDodgeHighScore', // Unique key for this game

    VISUAL: {
        MAIN_COLOR: '#FFFFFF',
        SECONDARY_COLOR: '#999999', // Obstacle color
        ERROR_COLOR: '#FF0000', // Color for hit indication
        TRANSITION_SPEED: 0.3, // seconds
        ORBIT_PATH_DASH: [5, 10], // Dash pattern for orbit path
    },

    PHYSICS: {
        ORBIT_RADIUS_FACTOR: 0.25, // Factor of min(canvas.width, canvas.height)
        PLAYER_RADIUS: 10,
        OBSTACLE_SIZE: 60, // Increased from 30 to 60
        PLAYER_ANGULAR_SPEED: Math.PI / 1.5, // Radians per second
        INITIAL_OBSTACLE_SPEED: 100, // Pixels per second
        MAX_OBSTACLE_SPEED: 400,
        OBSTACLE_SPEED_INCREASE: 5, // Pixels per second, per second
        INITIAL_SPAWN_INTERVAL: 1.5, // Seconds
        MIN_SPAWN_INTERVAL: 0.3,
        SPAWN_INTERVAL_DECREASE: 0.02, // Seconds reduction per second
    },

    GAME_STATE: {
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameover',
        ERROR: 'error'
    }
};

// Game state
const gameState = {
    state: CONFIG.GAME_STATE.PLAYING, // Start directly in playing state
    score: 0,
    lives: CONFIG.INITIAL_LIVES,
    highScore: 0,
    isPlaying: false,
    isPaused: false,

    lastTime: 0,
    delta: 0,
    animationFrameId: null,
    timers: [], // For spawn timer

    // Game specific state
    orbitRadius: 100,
    centerX: 0,
    centerY: 0,
    playerAngle: 0, // Radians
    orbitDirection: 1, // 1 for clockwise, -1 for counter-clockwise
    obstacles: [], // { x, y, angleToCenter, speed }
    currentObstacleSpeed: CONFIG.PHYSICS.INITIAL_OBSTACLE_SPEED,
    currentSpawnInterval: CONFIG.PHYSICS.INITIAL_SPAWN_INTERVAL,
    timeSinceLastSpawn: 0,
    gameTime: 0, // Total time played in seconds
    playerHitTime: 0, // Timer for hit effect duration (seconds)
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

        resizeCanvas(); // Initial size calculation
        window.addEventListener('resize', resizeCanvas);

        gameState.highScore = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;

        createLivesIndicators();
        addEventListeners();
        initializeGameElements(); // Initialize positions based on canvas size
        startGame(); // Start the game directly

    } catch (error) {
        handleError('Game initialization error:', error);
    }
}

// Setup functions
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameState.centerX = canvas.width / 2;
    gameState.centerY = canvas.height / 2;
    gameState.orbitRadius = Math.min(canvas.width, canvas.height) * CONFIG.PHYSICS.ORBIT_RADIUS_FACTOR;
    // Re-render if game is active
    if (gameState.isPlaying || gameState.state === CONFIG.GAME_STATE.PAUSED) {
        render();
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
    helpButton.addEventListener('click', toggleHelpPanel);
    closeHelp.addEventListener('click', toggleHelpPanel);
    restartButton.addEventListener('click', startGame);

    // Mouse controls
    console.log("Mouse input enabled for this game.");
    canvas.addEventListener('click', handleMouseClick);

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
    // Initial state set in gameState definition or resizeCanvas
}

// UI functions
function toggleHelpPanel() {
    helpPanel.classList.toggle('hidden');
}

function togglePause() {
    if (gameState.state !== CONFIG.GAME_STATE.PLAYING && gameState.state !== CONFIG.GAME_STATE.PAUSED) return;

    gameState.isPaused = !gameState.isPaused;
    gameState.state = gameState.isPaused ? CONFIG.GAME_STATE.PAUSED : CONFIG.GAME_STATE.PLAYING;
    pauseOverlay.classList.toggle('hidden', !gameState.isPaused);

    if (gameState.isPaused) {
        cancelAnimationFrame(gameState.animationFrameId);
        clearTimeout(gameState.spawnTimerId); // Clear spawn timer
    } else {
        gameState.lastTime = performance.now(); // Reset lastTime to avoid large delta
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
function startGame() {
    // Prevent starting if already playing or in error state
    if (gameState.isPlaying || gameState.state === CONFIG.GAME_STATE.ERROR) return;

    gameState.state = CONFIG.GAME_STATE.PLAYING;
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.lives = CONFIG.INITIAL_LIVES;
    gameState.gameTime = 0;

    resetGameState();

    scoreDisplay.textContent = gameState.score;
    updateLivesDisplay();
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    errorOverlay.classList.add('hidden'); // Ensure error overlay is hidden

    gameState.lastTime = performance.now();
    gameLoop(gameState.lastTime);
}

function resetGameState() {
    gameState.playerAngle = 0;
    gameState.orbitDirection = 1;
    gameState.obstacles = [];
    gameState.currentObstacleSpeed = CONFIG.PHYSICS.INITIAL_OBSTACLE_SPEED;
    gameState.currentSpawnInterval = CONFIG.PHYSICS.INITIAL_SPAWN_INTERVAL;
    gameState.timeSinceLastSpawn = 0;
    clearTimeout(gameState.spawnTimerId); // Clear any pending spawns
}

function gameOver() {
    gameState.state = CONFIG.GAME_STATE.GAME_OVER;
    gameState.isPlaying = false;

    cancelAnimationFrame(gameState.animationFrameId);
    clearTimeout(gameState.spawnTimerId);

    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem(CONFIG.STORAGE_KEY, gameState.highScore);
    }

    finalScoreDisplay.textContent = gameState.score; // Removed "Score: " prefix
    highScoreDisplay.textContent = gameState.highScore; // Removed "High: " prefix

    // Delay showing overlay for effect
    setTimeout(() => {
        if (gameState.state === CONFIG.GAME_STATE.GAME_OVER) { // Check state hasn't changed
            gameOverOverlay.classList.remove('hidden');
        }
    }, 500); // Shorter delay
}

// Input handlers
function handleMouseClick(event) {
    if (gameState.isPlaying && !gameState.isPaused) {
        gameState.orbitDirection *= -1; // Flip direction
    }
}

// Game loop
function gameLoop(timestamp) {
    if (!gameState.isPlaying || gameState.isPaused) return;

    gameState.delta = (timestamp - gameState.lastTime) / 1000; // Delta time in seconds
    gameState.lastTime = timestamp;

    // Prevent huge delta after pause or lag
    if (gameState.delta > 0.1) gameState.delta = 0.1;

    try {
        update(gameState.delta);
        render();
        gameState.animationFrameId = requestAnimationFrame(gameLoop);
    } catch (error) {
        handleError('Game loop error:', error);
    }
}

// Update and render
function update(deltaTime) {
    gameState.gameTime += deltaTime;

    // Update player position
    gameState.playerAngle += CONFIG.PHYSICS.PLAYER_ANGULAR_SPEED * gameState.orbitDirection * deltaTime;
    gameState.playerAngle %= (2 * Math.PI); // Keep angle within 0-2PI

    // Update hit effect timer
    if (gameState.playerHitTime > 0) {
        gameState.playerHitTime -= deltaTime;
    }

    // Update obstacles
    updateObstacles(deltaTime);

    // Spawn new obstacles
    spawnObstacles(deltaTime);

    // Check collisions
    checkCollisions();

    // Update score (e.g., based on time survived)
    updateScore(deltaTime);

    // Increase difficulty
    increaseDifficulty(deltaTime);
}

function updateObstacles(deltaTime) {
    for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
        const obs = gameState.obstacles[i];
        const moveX = Math.cos(obs.angleToCenter) * obs.speed * deltaTime;
        const moveY = Math.sin(obs.angleToCenter) * obs.speed * deltaTime;
        obs.x -= moveX;
        obs.y -= moveY;

        // Remove obstacles that have passed the center significantly
        const distSq = (obs.x - gameState.centerX) ** 2 + (obs.y - gameState.centerY) ** 2;
        if (distSq < (CONFIG.PHYSICS.OBSTACLE_SIZE) ** 2) { // Use size threshold
            gameState.obstacles.splice(i, 1);
        }
    }
}

function spawnObstacles(deltaTime) {
    gameState.timeSinceLastSpawn += deltaTime;
    if (gameState.timeSinceLastSpawn >= gameState.currentSpawnInterval) {
        gameState.timeSinceLastSpawn = 0;

        const angle = Math.random() * 2 * Math.PI;
        const spawnDist = Math.max(canvas.width, canvas.height) / 1.5; // Spawn further out
        const startX = gameState.centerX + Math.cos(angle) * spawnDist;
        const startY = gameState.centerY + Math.sin(angle) * spawnDist;

        // Calculate angle towards center from spawn point
        const angleToCenter = Math.atan2(startY - gameState.centerY, startX - gameState.centerX);

        gameState.obstacles.push({
            x: startX,
            y: startY,
            angleToCenter: angleToCenter, // Angle pointing from obstacle towards center
            speed: gameState.currentObstacleSpeed
        });
    }
}

function checkCollisions() {
    const playerX = gameState.centerX + Math.cos(gameState.playerAngle) * gameState.orbitRadius;
    const playerY = gameState.centerY + Math.sin(gameState.playerAngle) * gameState.orbitRadius;

    for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
        const obs = gameState.obstacles[i];
        const obsHalfSize = CONFIG.PHYSICS.OBSTACLE_SIZE / 2;

        // Simple AABB collision check (close enough for small objects)
        if (playerX + CONFIG.PHYSICS.PLAYER_RADIUS > obs.x - obsHalfSize &&
            playerX - CONFIG.PHYSICS.PLAYER_RADIUS < obs.x + obsHalfSize &&
            playerY + CONFIG.PHYSICS.PLAYER_RADIUS > obs.y - obsHalfSize &&
            playerY - CONFIG.PHYSICS.PLAYER_RADIUS < obs.y + obsHalfSize) {

            gameState.obstacles.splice(i, 1); // Remove collided obstacle
            gameState.playerHitTime = 0.2; // Start hit effect timer (0.2 seconds)
            reduceLife();
            break; // Only handle one collision per frame
        }
    }
}

function updateScore(deltaTime) {
    // Increase score based on time survived (in whole seconds)
    gameState.score = Math.floor(gameState.gameTime);
    scoreDisplay.textContent = gameState.score;
}

function increaseDifficulty(deltaTime) {
    // Increase obstacle speed
    if (gameState.currentObstacleSpeed < CONFIG.PHYSICS.MAX_OBSTACLE_SPEED) {
        gameState.currentObstacleSpeed += CONFIG.PHYSICS.OBSTACLE_SPEED_INCREASE * deltaTime;
    }
    // Decrease spawn interval
    if (gameState.currentSpawnInterval > CONFIG.PHYSICS.MIN_SPAWN_INTERVAL) {
        gameState.currentSpawnInterval -= CONFIG.PHYSICS.SPAWN_INTERVAL_DECREASE * deltaTime;
    }
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
        case CONFIG.GAME_STATE.PLAYING: renderGame(); break;
        case CONFIG.GAME_STATE.PAUSED: renderGame(); break; // Still render game state when paused
        case CONFIG.GAME_STATE.GAME_OVER: renderGame(); break; // Render final frame before overlay fully covers
    }
}

function renderGame() {
    renderOrbitPath();
    renderObstacles();
    renderPlayer(gameState.playerAngle);
}

function renderOrbitPath() {
    ctx.strokeStyle = CONFIG.VISUAL.MAIN_COLOR;
    ctx.lineWidth = 1;
    ctx.setLineDash(CONFIG.VISUAL.ORBIT_PATH_DASH);
    ctx.beginPath();
    ctx.arc(gameState.centerX, gameState.centerY, gameState.orbitRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash
}

function renderPlayer(angle) {
    const playerX = gameState.centerX + Math.cos(angle) * gameState.orbitRadius;
    const playerY = gameState.centerY + Math.sin(angle) * gameState.orbitRadius;

    // Change color if recently hit
    ctx.fillStyle = gameState.playerHitTime > 0 ? CONFIG.VISUAL.ERROR_COLOR : CONFIG.VISUAL.MAIN_COLOR;

    ctx.beginPath();
    ctx.arc(playerX, playerY, CONFIG.PHYSICS.PLAYER_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
}

function renderObstacles() {
    ctx.fillStyle = CONFIG.VISUAL.SECONDARY_COLOR;
    const halfSize = CONFIG.PHYSICS.OBSTACLE_SIZE / 2;
    gameState.obstacles.forEach(obs => {
        ctx.fillRect(obs.x - halfSize, obs.y - halfSize, CONFIG.PHYSICS.OBSTACLE_SIZE, CONFIG.PHYSICS.OBSTACLE_SIZE);
    });
}

// Error handling
function handleError(message, error) {
    console.error(message, error);
    // Prevent further game logic execution
    gameState.isPlaying = false;
    gameState.state = CONFIG.GAME_STATE.ERROR;
    cancelAnimationFrame(gameState.animationFrameId);
    clearTimeout(gameState.spawnTimerId);
    showErrorOverlay();
}

function showErrorOverlay() {
    // Hide other overlays
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    helpPanel.classList.add('hidden');
    // Show error overlay
    errorOverlay.classList.remove('hidden');
}

// Initialization
document.addEventListener('DOMContentLoaded', initGame);
