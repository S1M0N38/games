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
        SHRINK_RATE: 0.025, // INCREASED from 0.015 for faster shrinking
        GROWTH_FACTOR: 0.5,
        INVULNERABILITY_TIME: 700, // DECREASED from 800
    },

    // Particle settings
    PARTICLES: {
        MIN_SIZE: 4,
        MAX_SIZE: 30,
        MIN_SPEED: 180,
        MAX_SPEED: 280,
        COUNT: 60,
        SPAWN_RATE: 5,
        SAFE_MARGIN: 0.85,
        DANGER_MARGIN: 1.02,
        TARGET_VISIBLE_MIN: 20,
        TARGET_VISIBLE_MAX: 30,
        TARGET_VISIBLE_SAFE_RATIO: 0.2, // Target ratio of safe (smaller) particles among visible ones
        VISIBLE_RATIO_TOLERANCE: 0.05, // Allowable deviation from the target ratio before forcing spawns
    },

    // Difficulty progression
    DIFFICULTY: {
        INCREASE_INTERVAL: 8000,
        INCREASE_RATE: 0.15,
        MAX_LEVEL: 10,
        SPEED_MULTIPLIER: 0.22,  // INCREASED from 0.2 (faster speed scaling)
        SIZE_MULTIPLIER: 0.07,
        COUNT_MULTIPLIER: 0.25,
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

    // Check if it's time to potentially spawn
    if (game.timeSinceLastSpawn > spawnInterval) {
        let visibleParticles = 0;
        let visibleSafeCount = 0;
        let visibleDangerousCount = 0;

        // Count visible particles and classify them relative to current player size
        for (const particle of game.particles) {
            const isVisible =
                particle.x + particle.size > 0 &&
                particle.x - particle.size < canvas.width &&
                particle.y + particle.size > 0 &&
                particle.y - particle.size < canvas.height;

            if (isVisible) {
                visibleParticles++;
                if (particle.size < game.player.size * CONFIG.PARTICLES.SAFE_MARGIN) {
                    visibleSafeCount++;
                } else if (particle.size > game.player.size * CONFIG.PARTICLES.DANGER_MARGIN) {
                    visibleDangerousCount++;
                }
                // Particles in the margin don't count towards safe/dangerous ratio balancing
            }
        }

        const currentTotalVisibleRatioRelevant = visibleSafeCount + visibleDangerousCount;
        const currentSafeRatio = currentTotalVisibleRatioRelevant > 0
            ? visibleSafeCount / currentTotalVisibleRatioRelevant
            : CONFIG.PARTICLES.TARGET_VISIBLE_SAFE_RATIO; // Assume target ratio if none are visible yet

        // Overall maximum particle cap (safety)
        const maxTotalParticles = Math.floor(
            CONFIG.PARTICLES.COUNT * (1 + (game.difficultyLevel - 1) * CONFIG.DIFFICULTY.COUNT_MULTIPLIER)
        );

        let spawnedThisFrame = 0;
        // Spawn if below minimum visible count
        while (
            visibleParticles < CONFIG.PARTICLES.TARGET_VISIBLE_MIN &&
            game.particles.length < maxTotalParticles
        ) {
            let forceType = null; // Default: let createParticle decide randomly (20/80)

            // Check if ratio needs correction
            if (currentSafeRatio > CONFIG.PARTICLES.TARGET_VISIBLE_SAFE_RATIO + CONFIG.PARTICLES.VISIBLE_RATIO_TOLERANCE) {
                // Too many safe particles visible, force spawn dangerous
                forceType = 'dangerous';
            } else if (currentSafeRatio < CONFIG.PARTICLES.TARGET_VISIBLE_SAFE_RATIO - CONFIG.PARTICLES.VISIBLE_RATIO_TOLERANCE) {
                // Too few safe particles visible, force spawn safe
                forceType = 'safe';
            }

            createParticle(forceType);
            visibleParticles++; // Optimistic increment
            spawnedThisFrame++;
            if (spawnedThisFrame > CONFIG.PARTICLES.TARGET_VISIBLE_MIN) break; // Safety break
        }

        // Reset spawn timer only if we attempted to spawn
        if (spawnedThisFrame > 0) {
            game.timeSinceLastSpawn = 0;
        }
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

        // Combined radii with a slightly larger buffer for collision detection
        const combinedRadius = (game.player.size + particle.size) * 0.9; // INCREASED from 0.8

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
            // Optional: Handle particles exactly in the margin (neither safe nor dangerous)
            // else {
            //     // e.g., push them away slightly without damage or absorption
            //     if (distance > 0) {
            //         const pushStrength = 50; // Gentle push
            //         const normX = dx / distance;
            //         const normY = dy / distance;
            //         particle.vx -= normX * pushStrength * game.deltaTime; // Apply push over time
            //         particle.vy -= normY * pushStrength * game.deltaTime;
            //     }
            // }
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
function createParticle(forceType = null) {
    const currentPlayerSize = game.player.size;
    const difficultyLevel = game.difficultyLevel;

    // Base size characteristics adjusted by difficulty
    const difficultySizeFactor = 1 + (difficultyLevel - 1) * CONFIG.DIFFICULTY.SIZE_MULTIPLIER;
    const baseMinSize = CONFIG.PARTICLES.MIN_SIZE;
    // This baseMaxSize acts more like a general cap or reference now
    const baseMaxSize = CONFIG.PARTICLES.MAX_SIZE * difficultySizeFactor;
    // Define an absolute maximum to prevent extreme sizes
    const absoluteMaxSize = CONFIG.PARTICLES.MAX_SIZE * (1 + (CONFIG.DIFFICULTY.MAX_LEVEL - 1) * CONFIG.DIFFICULTY.SIZE_MULTIPLIER) * 1.3;


    // Determine particle size range based on ratio or forced type
    let minSpawnSize, maxSpawnSize;
    let shouldBeSmaller;

    if (forceType === 'safe') {
        shouldBeSmaller = true;
    } else if (forceType === 'dangerous') {
        shouldBeSmaller = false;
    } else {
        // Default random 20/80 split if type is not forced
        shouldBeSmaller = Math.random() < CONFIG.PARTICLES.TARGET_VISIBLE_SAFE_RATIO; // Use config ratio
    }


    if (shouldBeSmaller) {
        // Generate a particle smaller than the player (Safe/Food)
        minSpawnSize = baseMinSize;
        // Target max size is safely below player size
        maxSpawnSize = Math.max(minSpawnSize + 1, currentPlayerSize * CONFIG.PARTICLES.SAFE_MARGIN);
        // Clamp to the general base max size for difficulty
        maxSpawnSize = Math.min(maxSpawnSize, baseMaxSize);

    } else {
        // Generate a particle larger than the player (Dangerous)
        // Min size ensures it's noticeably larger than the player's danger threshold
        minSpawnSize = Math.max(baseMinSize + 1, currentPlayerSize * CONFIG.PARTICLES.DANGER_MARGIN);
        // Target max size scales significantly with player size
        maxSpawnSize = Math.max(minSpawnSize + 5, currentPlayerSize * 1.5); // e.g., up to 150% of player size
        // Apply the absolute overall maximum size cap
        maxSpawnSize = Math.min(maxSpawnSize, absoluteMaxSize);
    }

    // Ensure minSpawnSize is strictly less than maxSpawnSize and within global bounds
    minSpawnSize = Math.max(baseMinSize, minSpawnSize); // Clamp min to global min
    // Ensure maxSpawnSize respects the absolute max and is greater than minSpawnSize
    maxSpawnSize = Math.min(absoluteMaxSize, maxSpawnSize);
    maxSpawnSize = Math.max(minSpawnSize + 1, maxSpawnSize); // Ensure max > min


    if (minSpawnSize >= maxSpawnSize) {
        // Fallback if ranges overlap or become invalid (less likely now but good safety)
        if (shouldBeSmaller) {
            minSpawnSize = baseMinSize;
            maxSpawnSize = Math.min(absoluteMaxSize, baseMinSize + 5); // Small range
        } else {
            minSpawnSize = Math.max(baseMinSize, absoluteMaxSize - 5); // Large range near absolute max
            maxSpawnSize = absoluteMaxSize;
        }
        if (minSpawnSize >= maxSpawnSize) { // Final absolute fallback
            minSpawnSize = baseMinSize;
            maxSpawnSize = Math.min(absoluteMaxSize, minSpawnSize + 1);
        }
    }

    // Generate the actual size within the calculated range
    const size = minSpawnSize + Math.random() * (maxSpawnSize - minSpawnSize);

    // Speed based on size and difficulty (relative to BASE min/max for consistency)
    const speedFactor = 1 + (difficultyLevel - 1) * CONFIG.DIFFICULTY.SPEED_MULTIPLIER;
    // Use the original baseMin/Max for speed scaling to avoid erratic speed changes due to dynamic ranges
    const referenceMaxSizeForSpeed = CONFIG.PARTICLES.MAX_SIZE * difficultySizeFactor;
    const speedRatio = 1 - (size - baseMinSize) / Math.max(1, referenceMaxSizeForSpeed - baseMinSize);
    const baseSpeedBoost = 1.2;
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
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? -size : canvas.height + size;
    } else {
        x = Math.random() < 0.5 ? -size : canvas.width + size;
        y = Math.random() * canvas.height;
    }

    // Color based on size (relative to BASE min/max for consistency)
    const referenceMaxSizeForColor = CONFIG.PARTICLES.MAX_SIZE * difficultySizeFactor;
    const colorRatio = (size - baseMinSize) / Math.max(1, referenceMaxSizeForColor - baseMinSize);
    const colorIndex = Math.floor(
        lerp(0, CONFIG.VISUAL.PARTICLE_COLORS.length - 1, colorRatio)
    );
    const clampedColorIndex = Math.max(0, Math.min(CONFIG.VISUAL.PARTICLE_COLORS.length - 1, colorIndex));

    // Create the particle
    game.particles.push({
        x,
        y,
        size,
        vx,
        vy,
        color: CONFIG.VISUAL.PARTICLE_COLORS[clampedColorIndex]
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
