/**
 * Pendulum Pulse - A minimalist black and white timing game
 * 
 * Core mechanics:
 * - A double pendulum swings across the screen in a chaotic motion
 * - Player must click when the second pendulum crosses the center line
 * - Timing precision determines score and visual feedback
 */

// ==========================================
// Game constants
// ==========================================
const CONFIG = {
    // Game settings
    INITIAL_LIVES: 3,
    STORAGE_KEY: 'pendulumPulseHighScore',

    // Physics and motion
    PHYSICS: {
        PENDULUM1_LENGTH_RATIO: 0.25, // Ratio of screen height for first pendulum
        PENDULUM2_LENGTH_RATIO: 0.25, // Ratio of screen height for second pendulum
        PENDULUM1_MASS: 10,  // Mass of first pendulum bob
        PENDULUM2_MASS: 5,   // Mass of second pendulum bob
        GRAVITY: 0.03,     // Acceleration due to gravity
        DAMPING: 1.0,      // Changed to 1.0 for a frictionless system (no energy loss)
        ENERGY_BOOST: 0.0001, // Tiny energy boost to counteract any numerical error
        INITIAL_ANGLE1: Math.PI / 2.5,  // Initial angle of first pendulum
        INITIAL_ANGLE2: -Math.PI / 1.8,  // Initial angle of second pendulum
        PHYSICS_STEPS: 3, // Simulation steps per frame
        TIME_STEP: 0.7    // Time step size
    },

    // Difficulty progression
    DIFFICULTY: {
        BASE_SPEED: 1.0,
        SPEED_INCREMENT: 0.1,
        MAX_SPEED: 2.0
    },

    // Timing and scoring
    SCORING: {
        PERFECT_TIMING: 0.08, // Time window for perfect timing (in radians)
        GOOD_TIMING: 0.2,     // Time window for good timing (in radians)
        SCORE_PERFECT: 100,
        SCORE_GOOD: 50,
        SCORE_MISS: 0
    },

    // Visual settings
    VISUAL: {
        PENDULUM_COLOR: '#FFFFFF',
        PENDULUM_WIDTH: 3,
        BOB1_SIZE: 10,
        BOB2_SIZE: 15,
        CENTER_LINE_WIDTH: 2,
        PULSE_MAX_SIZE: 100,
        PULSE_SPEED: 0.05,
        PARTICLE_COUNT: 20,
        PARTICLE_LIFESPAN: 60 // frames
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

    // Pendulum physics
    angle1: CONFIG.PHYSICS.INITIAL_ANGLE1,
    angle2: CONFIG.PHYSICS.INITIAL_ANGLE2,
    angleVelocity1: 0,
    angleVelocity2: 0,
    pendulum1Length: 0,
    pendulum2Length: 0,
    speedMultiplier: CONFIG.DIFFICULTY.BASE_SPEED,

    // Visual effects
    pulses: [],
    particles: [],

    // Animation and timing
    lastTime: 0,
    delta: 0,
    animationFrameId: null,
    timers: []
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

        // Set up canvas
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Load high score from localStorage
        gameState.highScore = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;

        // Create lives indicators
        createLivesIndicators();

        // Add event listeners
        addEventListeners();

        // Start in intro state with short animation that goes to the game
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

    // Calculate pendulum lengths based on canvas size
    const baseLength = Math.min(canvas.width, canvas.height);
    gameState.pendulum1Length = baseLength * CONFIG.PHYSICS.PENDULUM1_LENGTH_RATIO;
    gameState.pendulum2Length = baseLength * CONFIG.PHYSICS.PENDULUM2_LENGTH_RATIO;
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
    // Game interaction
    canvas.addEventListener('click', handleClick);

    // UI controls
    helpButton.addEventListener('click', toggleHelpPanel);
    closeHelp.addEventListener('click', toggleHelpPanel);
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
        // Clear any animation frame
        cancelAnimationFrame(gameState.animationFrameId);
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

// ==========================================
// Game state functions
// ==========================================
function startIntro() {
    gameState.state = CONFIG.GAME_STATE.INTRO;

    // Short intro animation - just the pendulum moving for a moment
    gameState.isPlaying = true;
    gameState.angle1 = CONFIG.PHYSICS.INITIAL_ANGLE1;
    gameState.angle2 = CONFIG.PHYSICS.INITIAL_ANGLE2;
    gameState.angleVelocity1 = 0;
    gameState.angleVelocity2 = 0;

    // Start game loop for intro animation
    gameState.lastTime = performance.now();
    gameLoop(gameState.lastTime);

    // Start the actual game after a short delay
    setTimeout(() => {
        startGame();
    }, 1500);
}

function startGame() {
    // Reset game state
    gameState.state = CONFIG.GAME_STATE.PLAYING;
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.lives = CONFIG.INITIAL_LIVES;
    gameState.angle1 = CONFIG.PHYSICS.INITIAL_ANGLE1;
    gameState.angle2 = CONFIG.PHYSICS.INITIAL_ANGLE2;
    gameState.angleVelocity1 = 0;
    gameState.angleVelocity2 = 0;
    gameState.speedMultiplier = CONFIG.DIFFICULTY.BASE_SPEED;
    gameState.pulses = [];
    gameState.particles = [];

    // Update UI
    scoreDisplay.textContent = '0';
    updateLivesDisplay();

    // Hide overlays
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
}

function gameOver() {
    gameState.state = CONFIG.GAME_STATE.GAME_OVER;
    gameState.isPlaying = false;

    // Cancel animation frame
    cancelAnimationFrame(gameState.animationFrameId);

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
// Game loop
// ==========================================
function gameLoop(timestamp) {
    if (!gameState.isPlaying || gameState.isPaused) return;

    // Calculate delta time for smooth animation
    gameState.delta = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;

    try {
        // Update game state
        update(gameState.delta);

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
    // Use multiple sub-steps for more accurate physics
    const timeStep = CONFIG.PHYSICS.TIME_STEP * gameState.speedMultiplier;

    // Apply physics calculations with the new timestep
    for (let i = 0; i < CONFIG.PHYSICS.PHYSICS_STEPS; i++) {
        updateDoublePendulum(timeStep);
    }

    // Update visual effects
    updatePulses();
    updateParticles();
}

function updateDoublePendulum(timeStep) {
    // Calculate factors that appear in both equations
    const m1 = CONFIG.PHYSICS.PENDULUM1_MASS;
    const m2 = CONFIG.PHYSICS.PENDULUM2_MASS;
    const l1 = gameState.pendulum1Length;
    const l2 = gameState.pendulum2Length;
    const theta1 = gameState.angle1;
    const theta2 = gameState.angle2;
    const omega1 = gameState.angleVelocity1;
    const omega2 = gameState.angleVelocity2;
    const g = CONFIG.PHYSICS.GRAVITY;

    // Calculate angular acceleration for first pendulum
    const num1 = -g * (2 * m1 + m2) * Math.sin(theta1);
    const num2 = -m2 * g * Math.sin(theta1 - 2 * theta2);
    const num3 = -2 * Math.sin(theta1 - theta2) * m2 * (omega2 * omega2 * l2 + omega1 * omega1 * l1 * Math.cos(theta1 - theta2));
    const den = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2));
    const alpha1 = (num1 + num2 + num3) / den;

    // Calculate angular acceleration for second pendulum
    const num4 = 2 * Math.sin(theta1 - theta2);
    const num5 = omega1 * omega1 * l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(theta1);
    const num6 = omega2 * omega2 * l2 * m2 * Math.cos(theta1 - theta2);
    const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2));
    const alpha2 = (num4 * (num5 + num6)) / den2;

    // Update angular velocities
    gameState.angleVelocity1 += alpha1 * timeStep;
    gameState.angleVelocity2 += alpha2 * timeStep;

    // Apply damping and energy boost to maintain perpetual motion
    gameState.angleVelocity1 *= CONFIG.PHYSICS.DAMPING;
    gameState.angleVelocity2 *= CONFIG.PHYSICS.DAMPING;

    // Add tiny energy boost to maintain motion if velocities are significant
    // This prevents the system from ever coming to rest due to numerical errors
    if (Math.abs(gameState.angleVelocity1) > 0.01) {
        gameState.angleVelocity1 *= (1 + CONFIG.PHYSICS.ENERGY_BOOST * Math.sign(gameState.angleVelocity1));
    }
    if (Math.abs(gameState.angleVelocity2) > 0.01) {
        gameState.angleVelocity2 *= (1 + CONFIG.PHYSICS.ENERGY_BOOST * Math.sign(gameState.angleVelocity2));
    }

    // Update angles
    gameState.angle1 += gameState.angleVelocity1 * timeStep;
    gameState.angle2 += gameState.angleVelocity2 * timeStep;
}

function updatePulses() {
    // Filter out completed pulses and update remaining ones
    gameState.pulses = gameState.pulses.filter(pulse => {
        // Increase pulse size
        pulse.size += CONFIG.VISUAL.PULSE_SPEED * pulse.speed;

        // Decrease opacity as size increases
        pulse.opacity = 1 - (pulse.size / CONFIG.VISUAL.PULSE_MAX_SIZE);

        // Keep pulse if it's still visible
        return pulse.opacity > 0;
    });
}

function updateParticles() {
    // Filter out expired particles and update remaining ones
    gameState.particles = gameState.particles.filter(particle => {
        // Move particle
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Apply gravity effect
        particle.vy += 0.05;

        // Fade out
        particle.life--;
        particle.opacity = particle.life / CONFIG.VISUAL.PARTICLE_LIFESPAN;

        // Keep particle if it's still alive
        return particle.life > 0;
    });
}

// ==========================================
// Input handlers
// ==========================================
function handleClick() {
    if (!gameState.isPlaying || gameState.isPaused) return;

    try {
        // Calculate positions to determine if second pendulum is crossing center
        const pivot1X = canvas.width / 2;
        const pivot1Y = canvas.height / 2;
        const bob1X = pivot1X + Math.sin(gameState.angle1) * gameState.pendulum1Length;
        const bob1Y = pivot1Y + Math.cos(gameState.angle1) * gameState.pendulum1Length;
        const bob2X = bob1X + Math.sin(gameState.angle2) * gameState.pendulum2Length;

        // Calculate how close to the center the second pendulum is
        // We care about the x-position distance from center
        const distanceFromCenter = Math.abs(bob2X - canvas.width / 2) / (canvas.width / 2);
        let result, points;

        if (distanceFromCenter < CONFIG.SCORING.PERFECT_TIMING) {
            // Perfect timing
            result = 'perfect';
            points = CONFIG.SCORING.SCORE_PERFECT;

            // Create visual effects
            createPulse(2);
            createParticles();

            // Increase difficulty slightly
            gameState.speedMultiplier = Math.min(
                gameState.speedMultiplier + CONFIG.DIFFICULTY.SPEED_INCREMENT,
                CONFIG.DIFFICULTY.MAX_SPEED
            );

        } else if (distanceFromCenter < CONFIG.SCORING.GOOD_TIMING) {
            // Good timing
            result = 'good';
            points = CONFIG.SCORING.SCORE_GOOD;

            // Create medium pulse effect
            createPulse(1.5);

        } else {
            // Missed timing
            result = 'miss';
            points = CONFIG.SCORING.SCORE_MISS;

            // Create weak pulse effect
            createPulse(1);

            // Lose a life
            gameState.lives--;
            updateLivesDisplay();

            // Check for game over
            if (gameState.lives <= 0) {
                gameOver();
                return;
            }
        }

        // Update score
        gameState.score += points;
        scoreDisplay.textContent = gameState.score;

    } catch (error) {
        handleError('Click handling error:', error);
    }
}

// ==========================================
// Visual effects
// ==========================================
function createPulse(speed = 1) {
    gameState.pulses.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 0,
        opacity: 1,
        speed: speed
    });
}

function createParticles() {
    // Calculate second pendulum bob position for particle origin
    const pivot1X = canvas.width / 2;
    const pivot1Y = canvas.height / 2;
    const bob1X = pivot1X + Math.sin(gameState.angle1) * gameState.pendulum1Length;
    const bob1Y = pivot1Y + Math.cos(gameState.angle1) * gameState.pendulum1Length;
    const bob2X = bob1X + Math.sin(gameState.angle2) * gameState.pendulum2Length;
    const bob2Y = bob1Y + Math.cos(gameState.angle2) * gameState.pendulum2Length;

    for (let i = 0; i < CONFIG.VISUAL.PARTICLE_COUNT; i++) {
        // Calculate random velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;

        gameState.particles.push({
            x: bob2X,
            y: bob2Y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 1 + Math.random() * 3,
            life: CONFIG.VISUAL.PARTICLE_LIFESPAN,
            opacity: 1
        });
    }
}

// ==========================================
// Rendering
// ==========================================
function render() {
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw based on game state
    switch (gameState.state) {
        case CONFIG.GAME_STATE.INTRO:
        case CONFIG.GAME_STATE.PLAYING:
        case CONFIG.GAME_STATE.PAUSED:
            renderGame();
            break;
        case CONFIG.GAME_STATE.GAME_OVER:
            renderGame(); // Continue showing the game in background
            break;
    }
}

function renderGame() {
    // Draw center line
    drawCenterLine();

    // Draw pulses
    drawPulses();

    // Draw double pendulum
    drawDoublePendulum();

    // Draw particles
    drawParticles();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = CONFIG.VISUAL.CENTER_LINE_WIDTH;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
}

function drawDoublePendulum() {
    // Calculate pendulum positions
    const pivot1X = canvas.width / 2;
    const pivot1Y = canvas.height / 2;
    const bob1X = pivot1X + Math.sin(gameState.angle1) * gameState.pendulum1Length;
    const bob1Y = pivot1Y + Math.cos(gameState.angle1) * gameState.pendulum1Length;
    const bob2X = bob1X + Math.sin(gameState.angle2) * gameState.pendulum2Length;
    const bob2Y = bob1Y + Math.cos(gameState.angle2) * gameState.pendulum2Length;

    // Draw first pendulum string
    ctx.strokeStyle = CONFIG.VISUAL.PENDULUM_COLOR;
    ctx.lineWidth = CONFIG.VISUAL.PENDULUM_WIDTH;

    ctx.beginPath();
    ctx.moveTo(pivot1X, pivot1Y);
    ctx.lineTo(bob1X, bob1Y);
    ctx.stroke();

    // Draw second pendulum string
    ctx.beginPath();
    ctx.moveTo(bob1X, bob1Y);
    ctx.lineTo(bob2X, bob2Y);
    ctx.stroke();

    // Draw first pendulum bob
    ctx.fillStyle = CONFIG.VISUAL.PENDULUM_COLOR;
    ctx.beginPath();
    ctx.arc(bob1X, bob1Y, CONFIG.VISUAL.BOB1_SIZE, 0, Math.PI * 2);
    ctx.fill();

    // Draw second pendulum bob
    ctx.beginPath();
    ctx.arc(bob2X, bob2Y, CONFIG.VISUAL.BOB2_SIZE, 0, Math.PI * 2);
    ctx.fill();

    // Draw pivot point
    ctx.beginPath();
    ctx.arc(pivot1X, pivot1Y, CONFIG.VISUAL.PENDULUM_WIDTH * 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawPulses() {
    gameState.pulses.forEach(pulse => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulse.opacity})`;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.size, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function drawParticles() {
    gameState.particles.forEach(particle => {
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
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