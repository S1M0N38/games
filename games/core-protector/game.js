// Game constants
const CONFIG = {
    INITIAL_LIVES: 3,
    STORAGE_KEY: 'coreProtectorHighScore',

    VISUAL: {
        MAIN_COLOR: '#FFFFFF',
        SECONDARY_COLOR: '#999999',
        CORE_COLOR: '#FFFFFF',
        SHIELD_COLOR: '#FFFFFF',
        PROJECTILE_COLOR: '#FFFFFF',
        IMPACT_COLOR: '#666666', // For brief flash on impact (shield)
        ERROR_COLOR: '#FF0000', // Red for core hit and errors
        TRANSITION_SPEED: 0.3, // seconds
        CORE_RADIUS: 25,
        SHIELD_RADIUS: 50, // Distance from center
        SHIELD_ARC_LENGTH: Math.PI / 3, // Radians (60 degrees)
        SHIELD_THICKNESS: 6,
        PROJECTILE_RADIUS: 5,
    },

    PHYSICS: {
        INITIAL_PROJECTILE_SPEED: 100, // pixels per second
        MAX_PROJECTILE_SPEED: 400,
        SPEED_INCREASE_RATE: 5, // Speed added per second
        INITIAL_SPAWN_INTERVAL: 1500, // milliseconds
        MIN_SPAWN_INTERVAL: 300,
        SPAWN_INTERVAL_DECREASE_RATE: 20, // Interval decrease per second (ms)
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
    gameTime: 0, // Total time elapsed while playing

    // Input state
    mouse: { x: 0, y: 0, angle: 0 }, // Angle relative to center

    // Game elements
    core: { x: 0, y: 0, radius: CONFIG.VISUAL.CORE_RADIUS, hitTimer: 0 },
    shield: { angle: 0, radius: CONFIG.VISUAL.SHIELD_RADIUS, arc: CONFIG.VISUAL.SHIELD_ARC_LENGTH, hitTimer: 0 },
    projectiles: [],
    currentProjectileSpeed: CONFIG.PHYSICS.INITIAL_PROJECTILE_SPEED,
    currentSpawnInterval: CONFIG.PHYSICS.INITIAL_SPAWN_INTERVAL,
    spawnTimer: 0,
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

        resizeCanvas(); // Initial size
        window.addEventListener('resize', resizeCanvas);

        gameState.highScore = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;

        createLivesIndicators();
        addEventListeners();
        initializeGameElements(); // Set initial positions based on canvas size
        startIntro();

    } catch (error) {
        handleError('Game initialization error:', error);
    }
}

// Setup functions
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Recenter core on resize
    gameState.core.x = canvas.width / 2;
    gameState.core.y = canvas.height / 2;
    // Update mouse angle based on new center
    updateMouseAngle();
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

    // --- Mouse controls ---
    console.log("Mouse input enabled for this game.");
    canvas.addEventListener('mousemove', handleMouseMove);
    // canvas.addEventListener('click', handleMouseClick); // No click needed for this game

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
    gameState.core.x = canvas.width / 2;
    gameState.core.y = canvas.height / 2;
    gameState.projectiles = [];
    gameState.shield.angle = gameState.mouse.angle; // Start shield facing mouse
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
        clearTimeout(gameState.spawnTimer); // Pause spawning
    } else {
        gameState.lastTime = performance.now(); // Reset lastTime to avoid large delta
        scheduleNextSpawn(); // Reschedule spawn
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
    // Simple fade-in or delay before starting
    setTimeout(() => { startGame(); }, 1500); // Start after 1.5 seconds
}

function startGame() {
    gameState.state = CONFIG.GAME_STATE.PLAYING;
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.lives = CONFIG.INITIAL_LIVES;
    gameState.gameTime = 0;
    gameState.currentProjectileSpeed = CONFIG.PHYSICS.INITIAL_PROJECTILE_SPEED;
    gameState.currentSpawnInterval = CONFIG.PHYSICS.INITIAL_SPAWN_INTERVAL;

    resetGameState();

    scoreDisplay.textContent = gameState.score;
    updateLivesDisplay();
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    gameState.lastTime = performance.now();
    scheduleNextSpawn();
    gameLoop(gameState.lastTime);
}

function resetGameState() {
    gameState.projectiles = [];
    clearTimeout(gameState.spawnTimer);
    gameState.core.hitTimer = 0;
    gameState.shield.hitTimer = 0;
    initializeGameElements(); // Reset positions
}

function gameOver() {
    gameState.state = CONFIG.GAME_STATE.GAME_OVER;
    gameState.isPlaying = false;

    cancelAnimationFrame(gameState.animationFrameId);
    clearTimeout(gameState.spawnTimer);

    if (gameState.score > gameState.highScore) {
        // Ensure score is floored before comparing and saving
        const finalScoreFloored = Math.floor(gameState.score);
        if (finalScoreFloored > gameState.highScore) {
            gameState.highScore = finalScoreFloored;
            localStorage.setItem(CONFIG.STORAGE_KEY, gameState.highScore);
        }
    }

    // Display floored scores without text labels
    finalScoreDisplay.textContent = `${Math.floor(gameState.score)}`;
    highScoreDisplay.textContent = `${gameState.highScore}`;

    // Delay showing overlay for effect
    setTimeout(() => { gameOverOverlay.classList.remove('hidden'); }, 500);
}

// Input handlers
function handleMouseMove(event) {
    gameState.mouse.x = event.clientX;
    gameState.mouse.y = event.clientY;
    updateMouseAngle();
}

function updateMouseAngle() {
    const dx = gameState.mouse.x - gameState.core.x;
    const dy = gameState.mouse.y - gameState.core.y;
    gameState.mouse.angle = Math.atan2(dy, dx);
}

// Game loop
function gameLoop(timestamp) {
    if (!gameState.isPlaying || gameState.isPaused) return;

    gameState.delta = (timestamp - gameState.lastTime) / 1000; // Delta time in seconds
    gameState.lastTime = timestamp;
    gameState.gameTime += gameState.delta;

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
    // Update shield angle smoothly (optional, direct is fine too)
    // Lerp angle towards mouse angle for smoother feel? Maybe later.
    gameState.shield.angle = gameState.mouse.angle;

    // Update difficulty
    gameState.currentProjectileSpeed = Math.min(CONFIG.PHYSICS.MAX_PROJECTILE_SPEED, CONFIG.PHYSICS.INITIAL_PROJECTILE_SPEED + gameState.gameTime * CONFIG.PHYSICS.SPEED_INCREASE_RATE);
    gameState.currentSpawnInterval = Math.max(CONFIG.PHYSICS.MIN_SPAWN_INTERVAL, CONFIG.PHYSICS.INITIAL_SPAWN_INTERVAL - gameState.gameTime * CONFIG.PHYSICS.SPAWN_INTERVAL_DECREASE_RATE);

    // Update projectiles
    updateProjectiles(deltaTime);

    // Check collisions
    checkCollisions();

    // Update hit timers for visual feedback
    if (gameState.core.hitTimer > 0) gameState.core.hitTimer -= deltaTime;
    if (gameState.shield.hitTimer > 0) gameState.shield.hitTimer -= deltaTime;
}

function spawnProjectile() {
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = Math.max(canvas.width, canvas.height) / 2 + 50; // Spawn outside screen
    const startX = gameState.core.x + Math.cos(angle) * spawnDist;
    const startY = gameState.core.y + Math.sin(angle) * spawnDist;

    // Calculate velocity vector towards the core
    const dx = gameState.core.x - startX;
    const dy = gameState.core.y - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const velX = (dx / dist) * gameState.currentProjectileSpeed;
    const velY = (dy / dist) * gameState.currentProjectileSpeed;

    gameState.projectiles.push({
        x: startX,
        y: startY,
        vx: velX,
        vy: velY,
        radius: CONFIG.VISUAL.PROJECTILE_RADIUS
    });
}

function scheduleNextSpawn() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    gameState.spawnTimer = setTimeout(() => {
        spawnProjectile();
        scheduleNextSpawn(); // Schedule the next one
    }, gameState.currentSpawnInterval);
}


function updateProjectiles(deltaTime) {
    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
        const p = gameState.projectiles[i];
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;

        // Optional: Remove projectiles far out of bounds (shouldn't happen often)
        const distFromCenterSq = (p.x - gameState.core.x) ** 2 + (p.y - gameState.core.y) ** 2;
        if (distFromCenterSq > (Math.max(canvas.width, canvas.height)) ** 2) {
            gameState.projectiles.splice(i, 1);
        }
    }
}

function checkCollisions() {
    const shieldStartAngle = gameState.shield.angle - gameState.shield.arc / 2;
    const shieldEndAngle = gameState.shield.angle + gameState.shield.arc / 2;

    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
        const p = gameState.projectiles[i];
        const dx = p.x - gameState.core.x;
        const dy = p.y - gameState.core.y;
        const distSq = dx * dx + dy * dy;
        const projectileAngle = Math.atan2(dy, dx);

        // Check collision with shield
        const shieldOuterRadiusSq = (gameState.shield.radius + CONFIG.VISUAL.SHIELD_THICKNESS / 2 + p.radius) ** 2;
        const shieldInnerRadiusSq = (gameState.shield.radius - CONFIG.VISUAL.SHIELD_THICKNESS / 2 - p.radius) ** 2;

        if (distSq <= shieldOuterRadiusSq && distSq >= shieldInnerRadiusSq) {
            // Normalize angles for comparison
            let normProjectileAngle = (projectileAngle + Math.PI * 2) % (Math.PI * 2);
            let normShieldStart = (shieldStartAngle + Math.PI * 2) % (Math.PI * 2);
            let normShieldEnd = (shieldEndAngle + Math.PI * 2) % (Math.PI * 2);

            let isHit = false;
            if (normShieldStart < normShieldEnd) {
                // Normal case (doesn't cross 0 radians)
                isHit = normProjectileAngle >= normShieldStart && normProjectileAngle <= normShieldEnd;
            } else {
                // Shield crosses 0 radians
                isHit = normProjectileAngle >= normShieldStart || normProjectileAngle <= normShieldEnd;
            }

            if (isHit) {
                gameState.projectiles.splice(i, 1);
                gameState.shield.hitTimer = 0.1; // Visual feedback timer
                // Increment score on successful block
                gameState.score += 1; // Add 1 points per block
                scoreDisplay.textContent = gameState.score; // Update display immediately
                continue; // Move to next projectile
            }
        }

        // Check collision with core
        const coreRadiusSq = (gameState.core.radius + p.radius) ** 2;
        if (distSq <= coreRadiusSq) {
            gameState.projectiles.splice(i, 1);
            reduceLife();
            gameState.core.hitTimer = 0.15; // Visual feedback timer
            continue; // Move to next projectile
        }
    }
}


function updateScore(deltaTime) {
    // Score is now updated in checkCollisions on block.
    // This function could be removed or kept for potential future use.
    // For now, ensure the display is correct if score changes elsewhere (it doesn't currently).
    // scoreDisplay.textContent = Math.floor(gameState.score); // Keep display update just in case
}

function reduceLife() {
    if (!gameState.isPlaying) return; // Don't reduce life if game already over
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
        case CONFIG.GAME_STATE.PAUSED: renderGame(); break; // Still render game state when paused
        case CONFIG.GAME_STATE.GAME_OVER: renderGame(); break; // Render final state before overlay fully covers
    }
}

function renderIntro() {
    // Simple intro: Fade in core and shield? For now, just draw them.
    renderCore();
    renderShield();
}

function renderGame() {
    renderCore();
    renderShield();
    renderProjectiles();
}

function renderCore() {
    // Use ERROR_COLOR (red) when hit, otherwise use CORE_COLOR (white)
    ctx.fillStyle = gameState.core.hitTimer > 0 ? CONFIG.VISUAL.ERROR_COLOR : CONFIG.VISUAL.CORE_COLOR;
    ctx.beginPath();
    ctx.arc(gameState.core.x, gameState.core.y, gameState.core.radius, 0, Math.PI * 2);
    ctx.fill();
}

function renderShield() {
    const startAngle = gameState.shield.angle - gameState.shield.arc / 2;
    const endAngle = gameState.shield.angle + gameState.shield.arc / 2;

    ctx.strokeStyle = gameState.shield.hitTimer > 0 ? CONFIG.VISUAL.SECONDARY_COLOR : CONFIG.VISUAL.SHIELD_COLOR;
    ctx.lineWidth = CONFIG.VISUAL.SHIELD_THICKNESS;
    ctx.beginPath();
    ctx.arc(gameState.core.x, gameState.core.y, gameState.shield.radius, startAngle, endAngle);
    ctx.stroke();
}

function renderProjectiles() {
    ctx.fillStyle = CONFIG.VISUAL.PROJECTILE_COLOR;
    gameState.projectiles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Error handling
function handleError(message, error) {
    console.error(message, error);
    gameState.state = CONFIG.GAME_STATE.ERROR;
    gameState.isPlaying = false;
    cancelAnimationFrame(gameState.animationFrameId);
    clearTimeout(gameState.spawnTimer);
    showErrorOverlay();
}

function showErrorOverlay() {
    errorOverlay.classList.remove('hidden');
}

// Initialization
document.addEventListener('DOMContentLoaded', initGame);
