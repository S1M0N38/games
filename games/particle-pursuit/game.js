/**
 * Particle Pursuit
 * A minimalist mouse-controlled game where players absorb smaller particles
 * while avoiding larger ones.
 */

// ==========================================
// Game constants
// ==========================================
const CONFIG = {
    // Game settings
    INITIAL_LIVES: 3,
    STORAGE_KEY: 'particlePursuitHighScore',

    // Player settings
    PLAYER: {
        INITIAL_SIZE: 20,
        MAX_SIZE: 50,
        MIN_SIZE: 10,
        MOVEMENT_LERP: 0.15,  // Smoothing factor for movement
        SHRINK_RATE: 0.01,    // How quickly player shrinks over time
        GROWTH_FACTOR: 0.5,   // How much player grows when absorbing particles
    },

    // Particle settings
    PARTICLES: {
        MIN_SIZE: 5,
        MAX_SIZE: 30,
        MIN_SPEED: 20,
        MAX_SPEED: 80,
        COUNT: 30,           // Initial particle count
        SPAWN_RATE: 2,       // Particles per second
        SAFE_MARGIN: 0.8,    // Size ratio below which particles are safe to absorb
        DANGEROUS_MARGIN: 1.1 // Size ratio above which particles are dangerous
    },

    // Difficulty progression
    DIFFICULTY: {
        INCREASE_RATE: 0.1,   // How quickly difficulty increases
        MAX_PARTICLE_COUNT: 60,
        MAX_SPEED_MULTIPLIER: 2,
        INCREASE_INTERVAL: 10000, // Milliseconds between difficulty increases
    },

    // Visual settings
    VISUAL: {
        MAIN_COLOR: '#FFFFFF',
        SECONDARY_COLOR: '#999999',
        TRANSITION_SPEED: 0.3, // seconds
        PARTICLE_COLORS: ['#FFFFFF', '#EEEEEE', '#DDDDDD', '#CCCCCC', '#AAAAAA', '#999999', '#777777', '#555555'],
        DAMAGE_FLASH_DURATION: 300, // milliseconds
    },

    // Game states
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
    difficultyLevel: 1,
    timeSinceStart: 0,
    lastDifficultyIncrease: 0,

    // Animation and timing
    lastTime: 0,
    delta: 0,
    animationFrameId: null,
    timers: [],

    // Mouse input state
    mouse: {
        x: 0,
        y: 0
    },

    // Player
    player: {
        x: 0,
        y: 0,
        size: CONFIG.PLAYER.INITIAL_SIZE,
        targetX: 0,
        targetY: 0,
        isFlashing: false,
        flashTimeRemaining: 0
    },

    // Particles
    particles: [],
    timeSinceLastSpawn: 0
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

    // Mouse controls
    canvas.addEventListener('mousemove', handleMouseMove);

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
    // Set player initial position to center of screen
    gameState.player.x = canvas.width / 2;
    gameState.player.y = canvas.height / 2;
    gameState.player.targetX = gameState.player.x;
    gameState.player.targetY = gameState.player.y;

    // Initialize particles
    gameState.particles = [];
    for (let i = 0; i < CONFIG.PARTICLES.COUNT; i++) {
        spawnParticle();
    }
}

// ==========================================
// Particle functions
// ==========================================
function spawnParticle() {
    // Determine particle size based on difficulty
    const minSize = CONFIG.PARTICLES.MIN_SIZE;
    const maxSize = CONFIG.PARTICLES.MAX_SIZE * (1 + (gameState.difficultyLevel - 1) * 0.1);
    const size = minSize + Math.random() * (maxSize - minSize);

    // Determine speed - smaller particles move faster
    const speed = lerp(
        CONFIG.PARTICLES.MAX_SPEED,
        CONFIG.PARTICLES.MIN_SPEED,
        size / maxSize
    ) * (1 + (gameState.difficultyLevel - 1) * 0.1);

    // Random direction
    const angle = Math.random() * Math.PI * 2;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    // Start off-screen
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

    // Color based on size (smaller = lighter, larger = darker)
    const colorIndex = Math.floor(lerp(
        0,
        CONFIG.VISUAL.PARTICLE_COLORS.length - 1,
        size / maxSize
    ));
    const color = CONFIG.VISUAL.PARTICLE_COLORS[colorIndex];

    gameState.particles.push({
        x,
        y,
        size,
        vx,
        vy,
        color
    });
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

    // Start with a pulsing player particle
    gameState.player.size = CONFIG.PLAYER.INITIAL_SIZE * 1.5;

    // Render intro frame
    render();

    // Auto-transition to game after a short delay
    setTimeout(() => {
        startGame();
    }, 2000);
}

function startGame() {
    // Reset game state
    gameState.state = CONFIG.GAME_STATE.PLAYING;
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.lives = CONFIG.INITIAL_LIVES;
    gameState.difficultyLevel = 1;
    gameState.timeSinceStart = 0;
    gameState.lastDifficultyIncrease = 0;

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
    // Reset player
    gameState.player.x = canvas.width / 2;
    gameState.player.y = canvas.height / 2;
    gameState.player.targetX = gameState.player.x;
    gameState.player.targetY = gameState.player.y;
    gameState.player.size = CONFIG.PLAYER.INITIAL_SIZE;
    gameState.player.isFlashing = false;
    gameState.player.flashTimeRemaining = 0;

    // Reset particles
    gameState.particles = [];
    for (let i = 0; i < CONFIG.PARTICLES.COUNT; i++) {
        spawnParticle();
    }

    gameState.timeSinceLastSpawn = 0;
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
function handleMouseMove(event) {
    // Update target position for smooth movement
    gameState.player.targetX = event.clientX;
    gameState.player.targetY = event.clientY;
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
    // Track game time
    gameState.timeSinceStart += deltaTime * 1000;

    // Check if it's time to increase difficulty
    if (gameState.timeSinceStart - gameState.lastDifficultyIncrease >= CONFIG.DIFFICULTY.INCREASE_INTERVAL) {
        increaseDifficulty();
        gameState.lastDifficultyIncrease = gameState.timeSinceStart;
    }

    // Update player
    updatePlayer(deltaTime);

    // Update particles
    updateParticles(deltaTime);

    // Spawn new particles
    updateParticleSpawning(deltaTime);

    // Check collisions
    checkCollisions();
}

function updatePlayer(deltaTime) {
    // Smooth movement towards target position
    gameState.player.x = lerp(gameState.player.x, gameState.player.targetX, CONFIG.PLAYER.MOVEMENT_LERP);
    gameState.player.y = lerp(gameState.player.y, gameState.player.targetY, CONFIG.PLAYER.MOVEMENT_LERP);

    // Gradually shrink the player over time
    gameState.player.size = Math.max(
        CONFIG.PLAYER.MIN_SIZE,
        gameState.player.size - (CONFIG.PLAYER.SHRINK_RATE * gameState.difficultyLevel * deltaTime * 60)
    );

    // Update damage flash effect
    if (gameState.player.isFlashing) {
        gameState.player.flashTimeRemaining -= deltaTime * 1000;
        if (gameState.player.flashTimeRemaining <= 0) {
            gameState.player.isFlashing = false;
        }
    }
}

function updateParticles(deltaTime) {
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const particle = gameState.particles[i];

        // Move particle
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;

        // Remove particles that are far off-screen
        if (
            particle.x < -particle.size * 2 ||
            particle.x > canvas.width + particle.size * 2 ||
            particle.y < -particle.size * 2 ||
            particle.y > canvas.height + particle.size * 2
        ) {
            gameState.particles.splice(i, 1);
            spawnParticle();
        }
    }
}

function updateParticleSpawning(deltaTime) {
    // Track time since last spawn
    gameState.timeSinceLastSpawn += deltaTime;

    // Calculate spawn interval based on current difficulty
    const spawnInterval = 1 / (CONFIG.PARTICLES.SPAWN_RATE * (1 + (gameState.difficultyLevel - 1) * 0.2));

    // Spawn new particles if needed
    if (gameState.timeSinceLastSpawn >= spawnInterval) {
        if (gameState.particles.length < CONFIG.PARTICLES.COUNT * (1 + (gameState.difficultyLevel - 1) * 0.1)) {
            spawnParticle();
        }
        gameState.timeSinceLastSpawn = 0;
    }
}

function checkCollisions() {
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const particle = gameState.particles[i];
        const dx = gameState.player.x - particle.x;
        const dy = gameState.player.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const combinedRadius = gameState.player.size + particle.size;

        // Check if player and particle are colliding
        if (distance < combinedRadius * 0.8) {
            // If particle is small enough to absorb
            if (particle.size < gameState.player.size * CONFIG.PARTICLES.SAFE_MARGIN) {
                // Absorb particle
                gameState.player.size = Math.min(
                    CONFIG.PLAYER.MAX_SIZE,
                    gameState.player.size + particle.size * CONFIG.PLAYER.GROWTH_FACTOR
                );

                // Increase score
                const pointsGained = Math.ceil(particle.size);
                gameState.score += pointsGained;
                scoreDisplay.textContent = gameState.score;

                // Remove the absorbed particle and spawn a new one
                gameState.particles.splice(i, 1);
                spawnParticle();
            }
            // If particle is too large and dangerous
            else if (particle.size > gameState.player.size * CONFIG.PARTICLES.DANGEROUS_MARGIN) {
                // Take damage
                reduceLife();

                // Flash the player
                gameState.player.isFlashing = true;
                gameState.player.flashTimeRemaining = CONFIG.VISUAL.DAMAGE_FLASH_DURATION;

                // Push the particle away
                const pushForce = 100;
                const pushX = (dx / distance) * pushForce;
                const pushY = (dy / distance) * pushForce;
                particle.vx += pushX;
                particle.vy += pushY;
            }
        }
    }
}

function increaseDifficulty() {
    gameState.difficultyLevel += CONFIG.DIFFICULTY.INCREASE_RATE;

    // Cap at a reasonable maximum level
    gameState.difficultyLevel = Math.min(gameState.difficultyLevel, 5);

    // Adjust particle count based on difficulty
    CONFIG.PARTICLES.COUNT = Math.min(
        CONFIG.DIFFICULTY.MAX_PARTICLE_COUNT,
        Math.floor(CONFIG.PARTICLES.COUNT * (1 + CONFIG.DIFFICULTY.INCREASE_RATE))
    );
}

function reduceLife() {
    gameState.lives--;
    updateLivesDisplay();

    // Reduce player size
    gameState.player.size = Math.max(
        CONFIG.PLAYER.MIN_SIZE,
        gameState.player.size * 0.8
    );

    if (gameState.lives <= 0) {
        gameOver();
    }
}

function render() {
    // Clear canvas
    ctx.fillStyle = '#000000';
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
    // Render particles
    gameState.particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Render pulsing player
    const pulseSize = gameState.player.size * (1 + 0.2 * Math.sin(performance.now() / 300));
    ctx.fillStyle = CONFIG.VISUAL.MAIN_COLOR;
    ctx.beginPath();
    ctx.arc(gameState.player.x, gameState.player.y, pulseSize, 0, Math.PI * 2);
    ctx.fill();
}

function renderGame() {
    // Render particles
    gameState.particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Render player
    ctx.fillStyle = gameState.player.isFlashing ?
        (Math.floor(performance.now() / 100) % 2 === 0 ? '#FF0000' : '#FFFFFF') :
        '#FFFFFF';

    ctx.beginPath();
    ctx.arc(gameState.player.x, gameState.player.y, gameState.player.size, 0, Math.PI * 2);
    ctx.fill();

    // Draw a subtle glow around the player
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(gameState.player.x, gameState.player.y, gameState.player.size + 3, 0, Math.PI * 2);
    ctx.stroke();
}

function renderGameOver() {
    // Fade out the game elements
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render the particles with reduced opacity
    ctx.globalAlpha = 0.5;
    gameState.particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Render player fading
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(gameState.player.x, gameState.player.y, gameState.player.size, 0, Math.PI * 2);
    ctx.fill();

    // Reset alpha
    ctx.globalAlpha = 1;
}

// ==========================================
// Helper functions
// ==========================================
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
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
