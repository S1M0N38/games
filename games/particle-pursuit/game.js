/**
 * Particle Pursuit
 * A minimalist game where you control a particle that absorbs smaller ones and avoids larger ones.
 */

// ==========================================
// Game Configuration
// ==========================================
const CONFIG = {
    // Game settings
    INITIAL_LIVES: 3,
    STORAGE_KEY: 'particlePursuitHighScore',

    // Player settings
    PLAYER: {
        INITIAL_SIZE: 20,
        MAX_SIZE: 40,
        MIN_SIZE: 10,
        SPEED_FACTOR: 0.15,
        SHRINK_RATE: 0.015,
        GROWTH_FACTOR: 0.5,  // INCREASED from 0.4 for faster growth
        INVULNERABILITY_TIME: 800,
    },

    // Particle settings
    PARTICLES: {
        MIN_SIZE: 4,
        MAX_SIZE: 30,
        MIN_SPEED: 50,      // INCREASED from 30 for faster minimum speed
        MAX_SPEED: 120,     // INCREASED from 90 for faster maximum speed
        COUNT: 35,
        SPAWN_RATE: 3,
        SAFE_MARGIN: 0.75,
        DANGER_MARGIN: 1.1,
        SMALL_PARTICLE_BIAS: 0.7,  // NEW: Higher values = more small particles
    },

    // Difficulty progression
    DIFFICULTY: {
        INCREASE_INTERVAL: 10000, // Milliseconds between difficulty increases
        INCREASE_RATE: 0.1,       // How quickly difficulty increases
        MAX_LEVEL: 8,             // Maximum difficulty level
        SPEED_MULTIPLIER: 0.15,  // INCREASED from 0.1 for more aggressive speed increase per level
        SIZE_MULTIPLIER: 0.05,    // How much larger dangerous particles get
        COUNT_MULTIPLIER: 0.2,    // How many more particles spawn per level
    },

    // Visual settings
    VISUAL: {
        BG_COLOR: '#000000',
        PLAYER_COLOR: '#FFFFFF',
        PARTICLE_COLORS: [
            '#FFFFFF', // Smallest/safest
            '#DDDDDD',
            '#BBBBBB',
            '#999999',
            '#777777',
            '#555555'  // Largest/most dangerous
        ],
        FLASH_DURATION: 500,  // Milliseconds
        FLASH_COLOR: '#FF0000', // Damage indicator color
    },

    // Game states
    STATE: {
        INTRO: 'intro',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'game_over',
        ERROR: 'error'
    }
};

// ==========================================
// Game State
// ==========================================
const game = {
    // Core game state
    state: CONFIG.STATE.INTRO,
    score: 0,
    lives: CONFIG.INITIAL_LIVES,
    highScore: 0,
    difficultyLevel: 1,

    // Timing variables
    lastTime: 0,
    deltaTime: 0,
    timeSinceLastSpawn: 0,
    timeSinceDifficultyIncrease: 0,

    // Animation handling
    animationId: null,

    // Game objects
    player: {
        x: 0,
        y: 0,
        size: CONFIG.PLAYER.INITIAL_SIZE,
        isFlashing: false,
        flashTimeRemaining: 0,
        isInvulnerable: false,
        invulnerabilityTimeRemaining: 0,
    },
    particles: [],

    // Mouse input
    mouse: {
        x: 0,
        y: 0
    }
};

// ==========================================
// DOM Elements
// ==========================================
let canvas, ctx;
let scoreDisplay, livesContainer;
let helpButton, helpPanel, closeHelp;
let pauseOverlay, gameOverOverlay, finalScoreDisplay, highScoreDisplay, restartButton;
let errorOverlay;

// ==========================================
// Initialization
// ==========================================
function init() {
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

        // Set canvas size
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Load high score
        game.highScore = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;

        // Create life indicators
        createLifeIndicators();

        // Set up event listeners
        setupEventListeners();

        // Center player at start
        resetPlayerPosition();

        // Start in intro state
        startIntro();
    } catch (error) {
        console.error('Initialization error:', error);
        showErrorScreen();
    }
}

// ==========================================
// Setup Functions
// ==========================================
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function resetPlayerPosition() {
    game.player.x = canvas.width / 2;
    game.player.y = canvas.height / 2;
    game.mouse.x = game.player.x;
    game.mouse.y = game.player.y;
}

function createLifeIndicators() {
    livesContainer.innerHTML = '';
    for (let i = 0; i < CONFIG.INITIAL_LIVES; i++) {
        const life = document.createElement('div');
        life.className = 'life';
        livesContainer.appendChild(life);
    }
}

function setupEventListeners() {
    // Mouse input
    canvas.addEventListener('mousemove', (e) => {
        game.mouse.x = e.clientX;
        game.mouse.y = e.clientY;
    });

    // UI elements
    helpButton.addEventListener('click', toggleHelpPanel);
    closeHelp.addEventListener('click', toggleHelpPanel);
    restartButton.addEventListener('click', startGame);

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'Escape':
                togglePause();
                break;
            case 'q':
            case 'Q':
                window.location.href = '../../index.html';
                break;
        }
    });

    // Error handling
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        showErrorScreen();
    });
}

// ==========================================
// Game States
// ==========================================
function startIntro() {
    game.state = CONFIG.STATE.INTRO;

    // Reset player for intro animation
    resetPlayerPosition();
    game.player.size = CONFIG.PLAYER.INITIAL_SIZE * 1.2;

    // Create initial particles
    game.particles = [];
    for (let i = 0; i < CONFIG.PARTICLES.COUNT; i++) {
        createParticle();
    }

    // Start animation
    render();

    // Auto transition to game after a short delay
    setTimeout(startGame, 2000);
}

function startGame() {
    // Reset game state
    game.state = CONFIG.STATE.PLAYING;
    game.score = 0;
    game.lives = CONFIG.INITIAL_LIVES;
    game.difficultyLevel = 1;
    game.timeSinceDifficultyIncrease = 0;

    // Reset player
    resetPlayerPosition();
    game.player.size = CONFIG.PLAYER.INITIAL_SIZE;
    game.player.isFlashing = false;
    game.player.isInvulnerable = false;

    // Reset particles
    game.particles = [];
    for (let i = 0; i < CONFIG.PARTICLES.COUNT; i++) {
        createParticle();
    }

    // Update UI
    scoreDisplay.textContent = game.score;
    updateLivesDisplay();

    // Hide overlays
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    // Start game loop
    game.lastTime = performance.now();
    cancelAnimationFrame(game.animationId);
    game.animationId = requestAnimationFrame(gameLoop);
}

function togglePause() {
    if (game.state !== CONFIG.STATE.PLAYING && game.state !== CONFIG.STATE.PAUSED) {
        return;
    }

    if (game.state === CONFIG.STATE.PLAYING) {
        game.state = CONFIG.STATE.PAUSED;
        pauseOverlay.classList.remove('hidden');
        cancelAnimationFrame(game.animationId);
    } else {
        game.state = CONFIG.STATE.PLAYING;
        pauseOverlay.classList.add('hidden');
        game.lastTime = performance.now();
        game.animationId = requestAnimationFrame(gameLoop);
    }
}

function gameOver() {
    game.state = CONFIG.STATE.GAME_OVER;
    cancelAnimationFrame(game.animationId);

    // Check for high score
    if (game.score > game.highScore) {
        game.highScore = game.score;
        localStorage.setItem(CONFIG.STORAGE_KEY, game.highScore);
    }

    // Update game over display
    finalScoreDisplay.textContent = game.score;
    highScoreDisplay.textContent = game.highScore;

    // Show game over screen after a brief delay
    setTimeout(() => {
        gameOverOverlay.classList.remove('hidden');
    }, 1000);
}

function showErrorScreen() {
    game.state = CONFIG.STATE.ERROR;
    errorOverlay.classList.remove('hidden');
    cancelAnimationFrame(game.animationId);
}

function toggleHelpPanel() {
    helpPanel.classList.toggle('hidden');
}

// ==========================================
// Game Loop
// ==========================================
function gameLoop(timestamp) {
    try {
        // Calculate delta time
        game.deltaTime = (timestamp - game.lastTime) / 1000; // Convert to seconds
        game.lastTime = timestamp;

        // Cap delta time to avoid large jumps
        if (game.deltaTime > 0.1) game.deltaTime = 0.1;

        // Update game state
        update();

        // Render the frame
        render();

        // Continue the loop
        game.animationId = requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('Game loop error:', error);
        showErrorScreen();
    }
}

// ==========================================
// Update Functions
// ==========================================
function update() {
    updatePlayer();
    updateParticles();
    spawnParticles();
    checkCollisions();
    updateDifficulty();
}

function updatePlayer() {
    // Move player towards mouse position with smoothing
    game.player.x += (game.mouse.x - game.player.x) * CONFIG.PLAYER.SPEED_FACTOR;
    game.player.y += (game.mouse.y - game.player.y) * CONFIG.PLAYER.SPEED_FACTOR;

    // Gradually shrink player over time
    game.player.size = Math.max(
        CONFIG.PLAYER.MIN_SIZE,
        game.player.size - (CONFIG.PLAYER.SHRINK_RATE * game.difficultyLevel * game.deltaTime * 60)
    );

    // Update flash effect
    if (game.player.isFlashing) {
        game.player.flashTimeRemaining -= game.deltaTime * 1000;
        if (game.player.flashTimeRemaining <= 0) {
            game.player.isFlashing = false;
        }
    }

    // Update invulnerability
    if (game.player.isInvulnerable) {
        game.player.invulnerabilityTimeRemaining -= game.deltaTime * 1000;
        if (game.player.invulnerabilityTimeRemaining <= 0) {
            game.player.isInvulnerable = false;
        }
    }
}

function updateParticles() {
    for (let i = game.particles.length - 1; i >= 0; i--) {
        const particle = game.particles[i];

        // Move particles
        particle.x += particle.vx * game.deltaTime;
        particle.y += particle.vy * game.deltaTime;

        // Check if off-screen and remove
        const margin = particle.size * 2;
        if (
            particle.x < -margin ||
            particle.x > canvas.width + margin ||
            particle.y < -margin ||
            particle.y > canvas.height + margin
        ) {
            game.particles.splice(i, 1);
        }
    }
}

function spawnParticles() {
    // Track time since last spawn
    game.timeSinceLastSpawn += game.deltaTime;

    // Calculate spawn interval based on difficulty
    const spawnRate = CONFIG.PARTICLES.SPAWN_RATE *
        (1 + (game.difficultyLevel - 1) * CONFIG.DIFFICULTY.COUNT_MULTIPLIER);
    const spawnInterval = 1 / spawnRate;

    // Cap particle count based on difficulty
    const maxParticles = Math.floor(
        CONFIG.PARTICLES.COUNT * (1 + (game.difficultyLevel - 1) * CONFIG.DIFFICULTY.COUNT_MULTIPLIER)
    );

    // Spawn new particles if needed
    if (game.timeSinceLastSpawn > spawnInterval && game.particles.length < maxParticles) {
        createParticle();
        game.timeSinceLastSpawn = 0;
    }
}

function checkCollisions() {
    if (game.player.isInvulnerable) return;

    for (let i = game.particles.length - 1; i >= 0; i--) {
        const particle = game.particles[i];

        // Calculate distance between player and particle centers
        const dx = game.player.x - particle.x;
        const dy = game.player.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Combined radii with a small buffer for collision detection
        const combinedRadius = (game.player.size + particle.size) * 0.8;

        // Check for collision
        if (distance < combinedRadius) {
            // If particle is small enough to absorb
            if (particle.size < game.player.size * CONFIG.PARTICLES.SAFE_MARGIN) {
                absorbParticle(particle, i);
            }
            // If particle is too large and dangerous
            else if (particle.size > game.player.size * CONFIG.PARTICLES.DANGER_MARGIN) {
                handleDangerousCollision(particle, dx, dy, distance);
            }
        }
    }
}

function absorbParticle(particle, index) {
    // Bonus growth for very small particles
    const growthMultiplier =
        particle.size < CONFIG.PARTICLES.MIN_SIZE + 3 ? 1.5 : 1.0;

    // Increase player size (with cap)
    game.player.size = Math.min(
        CONFIG.PLAYER.MAX_SIZE,
        game.player.size + particle.size * CONFIG.PLAYER.GROWTH_FACTOR * growthMultiplier
    );

    // Add score based on particle size
    const points = Math.max(1, Math.floor(particle.size));
    game.score += points;
    scoreDisplay.textContent = game.score;

    // Remove particle and create a new one
    game.particles.splice(index, 1);
    createParticle();
}

function handleDangerousCollision(particle, dx, dy, distance) {
    // Reduce life
    loseLife();

    // Apply damage effects
    game.player.isFlashing = true;
    game.player.flashTimeRemaining = CONFIG.VISUAL.FLASH_DURATION;

    // Apply temporary invulnerability
    game.player.isInvulnerable = true;
    game.player.invulnerabilityTimeRemaining = CONFIG.PLAYER.INVULNERABILITY_TIME;

    // Shrink player from damage
    game.player.size = Math.max(
        CONFIG.PLAYER.MIN_SIZE,
        game.player.size * 0.75
    );

    // Push particle away (with safe handling of zero distance)
    if (distance > 0) {
        const pushStrength = 150;
        const normX = dx / distance;
        const normY = dy / distance;
        particle.vx += normX * pushStrength;
        particle.vy += normY * pushStrength;
    } else {
        // Random direction if centers overlap exactly
        const angle = Math.random() * Math.PI * 2;
        const pushStrength = 150;
        particle.vx += Math.cos(angle) * pushStrength;
        particle.vy += Math.sin(angle) * pushStrength;
    }
}

function loseLife() {
    game.lives--;
    updateLivesDisplay();

    if (game.lives <= 0) {
        gameOver();
    }
}

function updateDifficulty() {
    // Track time for difficulty increase
    game.timeSinceDifficultyIncrease += game.deltaTime * 1000;

    // Check if it's time to increase difficulty
    if (game.timeSinceDifficultyIncrease >= CONFIG.DIFFICULTY.INCREASE_INTERVAL) {
        game.difficultyLevel = Math.min(
            game.difficultyLevel + CONFIG.DIFFICULTY.INCREASE_RATE,
            CONFIG.DIFFICULTY.MAX_LEVEL
        );
        game.timeSinceDifficultyIncrease = 0;
    }
}

function updateLivesDisplay() {
    const lifeElements = document.querySelectorAll('.life');
    lifeElements.forEach((life, index) => {
        life.classList.toggle('lost', index >= game.lives);
    });
}

// ==========================================
// Rendering Functions
// ==========================================
function render() {
    // Clear the canvas
    ctx.fillStyle = CONFIG.VISUAL.BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render based on game state
    switch (game.state) {
        case CONFIG.STATE.INTRO:
            renderIntro();
            break;
        case CONFIG.STATE.PLAYING:
        case CONFIG.STATE.PAUSED:
            renderGameplay();
            break;
        case CONFIG.STATE.GAME_OVER:
            renderGameOver();
            break;
    }
}

function renderIntro() {
    // Render particles
    renderParticles(0.7);

    // Render pulsing player
    const pulseSize = game.player.size * (1 + 0.2 * Math.sin(performance.now() / 300));

    ctx.fillStyle = CONFIG.VISUAL.PLAYER_COLOR;
    ctx.beginPath();
    ctx.arc(game.player.x, game.player.y, pulseSize, 0, Math.PI * 2);
    ctx.fill();

    // Render glow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(game.player.x, game.player.y, pulseSize + 5, 0, Math.PI * 2);
    ctx.stroke();
}

function renderGameplay() {
    // Render particles
    renderParticles(1.0);

    // Render player
    renderPlayer();
}

function renderGameOver() {
    // Render particles with fade
    renderParticles(0.5);

    // Render player (faded)
    ctx.globalAlpha = 0.7;
    renderPlayer();
    ctx.globalAlpha = 1.0;
}

function renderParticles(opacity = 1.0) {
    if (opacity !== 1.0) {
        ctx.globalAlpha = opacity;
    }

    game.particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });

    if (opacity !== 1.0) {
        ctx.globalAlpha = 1.0;
    }
}

function renderPlayer() {
    // Determine player color based on state
    if (game.player.isFlashing) {
        ctx.fillStyle = CONFIG.VISUAL.FLASH_COLOR;
    } else if (game.player.isInvulnerable) {
        // Pulsing white when invulnerable
        const flash = Math.sin(performance.now() / 100) > 0 ? 1 : 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${flash})`;
    } else {
        ctx.fillStyle = CONFIG.VISUAL.PLAYER_COLOR;
    }

    // Draw player circle
    ctx.beginPath();
    ctx.arc(game.player.x, game.player.y, game.player.size, 0, Math.PI * 2);
    ctx.fill();

    // Add subtle glow effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(game.player.x, game.player.y, game.player.size + 3, 0, Math.PI * 2);
    ctx.stroke();
}

// ==========================================
// Particle Creation
// ==========================================
function createParticle() {
    // Size characteristics - adjusted by difficulty
    const sizeFactor = 1 + (game.difficultyLevel - 1) * CONFIG.DIFFICULTY.SIZE_MULTIPLIER;
    const minSize = CONFIG.PARTICLES.MIN_SIZE;
    const maxSize = CONFIG.PARTICLES.MAX_SIZE * sizeFactor;

    // Determine particle size with a bias toward smaller particles
    let size;

    // Generate more small particles based on bias factor
    const smallParticleBias = CONFIG.PARTICLES.SMALL_PARTICLE_BIAS;

    if (Math.random() < smallParticleBias) {
        // Create a small, safe-to-eat particle
        const smallRangeMax = minSize + (maxSize - minSize) * 0.4;
        size = minSize + Math.random() * (smallRangeMax - minSize);
    } else if (Math.random() < 0.7) {
        // Create a medium-sized particle
        const midMin = minSize + (maxSize - minSize) * 0.4;
        const midMax = minSize + (maxSize - minSize) * 0.7;
        size = midMin + Math.random() * (midMax - midMin);
    } else {
        // Create a large, dangerous particle
        const largeMin = minSize + (maxSize - minSize) * 0.7;
        size = largeMin + Math.random() * (maxSize - largeMin);
    }

    // Speed based on size and difficulty (smaller = faster)
    const speedFactor = 1 + (game.difficultyLevel - 1) * CONFIG.DIFFICULTY.SPEED_MULTIPLIER;
    const speedRatio = 1 - (size - minSize) / (maxSize - minSize); // 1=smallest, 0=largest

    // Add a base speed boost to all particles
    const baseSpeedBoost = 1.2;  // 20% faster base speed for all particles

    const speed = lerp(
        CONFIG.PARTICLES.MIN_SPEED,
        CONFIG.PARTICLES.MAX_SPEED * speedFactor,
        speedRatio
    ) * baseSpeedBoost;

    // Random direction
    const angle = Math.random() * Math.PI * 2;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    // Place particle outside the screen
    let x, y;
    if (Math.random() < 0.5) {
        // Top or bottom
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? -size : canvas.height + size;
    } else {
        // Left or right
        x = Math.random() < 0.5 ? -size : canvas.width + size;
        y = Math.random() * canvas.height;
    }

    // Color based on size (larger = darker)
    const colorIndex = Math.floor(
        lerp(0, CONFIG.VISUAL.PARTICLE_COLORS.length - 1, (size - minSize) / (maxSize - minSize))
    );

    // Create the particle
    game.particles.push({
        x,
        y,
        size,
        vx,
        vy,
        color: CONFIG.VISUAL.PARTICLE_COLORS[colorIndex]
    });
}

// ==========================================
// Utility Functions
// ==========================================
function lerp(a, b, t) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
}

// ==========================================
// Start the game
// ==========================================
document.addEventListener('DOMContentLoaded', init);
