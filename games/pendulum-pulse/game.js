/**
 * Pendulum Pulse - A minimalist black and white timing game
 * 
 * Core mechanics:
 * - A double pendulum swings across the screen in a chaotic motion
 * - Player must click when the second pendulum crosses the center line
 * - Timing precision determines score and visual feedback
 */

// Game constants
const CONFIG = {
    // Physics and motion
    PENDULUM1_LENGTH_RATIO: 0.25, // Ratio of screen height for first pendulum
    PENDULUM2_LENGTH_RATIO: 0.25, // Ratio of screen height for second pendulum
    PENDULUM1_MASS: 10,  // Mass of first pendulum bob
    PENDULUM2_MASS: 5,   // Mass of second pendulum bob
    GRAVITY: 0.03,     // Significantly increased from 0.01 for more dramatic acceleration
    DAMPING: 0.9995,   // Slightly increased from 0.999 to maintain energy longer
    INITIAL_ANGLE1: Math.PI / 2.5,  // Increased from PI/3 for more initial energy
    INITIAL_ANGLE2: -Math.PI / 1.8,  // Changed to negative angle for more chaotic initial movement

    // Difficulty progression
    BASE_SPEED: 1.0,
    SPEED_INCREMENT: 0.1,
    MAX_SPEED: 2.0,

    // Timing and scoring
    PERFECT_TIMING: 0.08, // Time window for perfect timing (in radians)
    GOOD_TIMING: 0.2,     // Time window for good timing (in radians)
    SCORE_PERFECT: 100,
    SCORE_GOOD: 50,
    SCORE_MISS: 0,

    // Visual settings
    PENDULUM_COLOR: '#FFFFFF',
    PENDULUM_WIDTH: 3,
    BOB1_SIZE: 10,
    BOB2_SIZE: 15,
    CENTER_LINE_WIDTH: 2,

    // Visual effects
    PULSE_MAX_SIZE: 100,
    PULSE_SPEED: 0.05,
    PARTICLE_COUNT: 20,
    PARTICLE_LIFESPAN: 60, // frames

    // Game settings
    INITIAL_LIVES: 3,

    // Physics simulation steps
    PHYSICS_STEPS: 3, // Adjusted from 4 to 3 for balance between speed and stability
    TIME_STEP: 0.7    // Increased from 0.5 for larger angle changes per frame
};

// Game state
const gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    lives: CONFIG.INITIAL_LIVES,
    highScore: 0,

    // Pendulum physics
    angle1: CONFIG.INITIAL_ANGLE1,    // Angle of first pendulum
    angle2: CONFIG.INITIAL_ANGLE2,    // Angle of second pendulum
    angleVelocity1: 0,                // Angular velocity of first pendulum
    angleVelocity2: 0,                // Angular velocity of second pendulum
    pendulum1Length: 0,
    pendulum2Length: 0,
    speedMultiplier: CONFIG.BASE_SPEED,

    // Visual effects
    pulses: [],
    particles: [],

    // Animation and timing
    animationFrameId: null,
    lastFrameTime: 0
};

// DOM elements
let canvas, ctx;
let scoreDisplay, livesContainer;
let helpButton, helpPanel, closeHelp;
let pauseOverlay, gameOverOverlay, finalScoreDisplay, highScoreDisplay, restartButton;
let errorOverlay;

// Initialize game
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

        // Load high score from localStorage
        gameState.highScore = parseInt(localStorage.getItem('pendulumPulseHighScore')) || 0;

        // Set up canvas
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Create lives indicators
        createLivesIndicators();

        // Add event listeners
        addEventListeners();

        // Start game
        startGame();

    } catch (error) {
        showErrorOverlay();
        console.error('Game initialization error:', error);
    }
}

// Resize canvas to fill window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Calculate pendulum lengths based on canvas size
    const baseLength = Math.min(canvas.width, canvas.height);
    gameState.pendulum1Length = baseLength * CONFIG.PENDULUM1_LENGTH_RATIO;
    gameState.pendulum2Length = baseLength * CONFIG.PENDULUM2_LENGTH_RATIO;
}

// Create lives indicators
function createLivesIndicators() {
    livesContainer.innerHTML = '';
    for (let i = 0; i < CONFIG.INITIAL_LIVES; i++) {
        const life = document.createElement('div');
        life.className = 'life';
        livesContainer.appendChild(life);
    }
}

// Add event listeners
function addEventListeners() {
    // Game interaction
    canvas.addEventListener('click', handleClick);

    // UI controls
    helpButton.addEventListener('click', toggleHelpPanel);
    closeHelp.addEventListener('click', toggleHelpPanel);
    restartButton.addEventListener('click', startGame);

    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
}

// Toggle help panel
function toggleHelpPanel() {
    helpPanel.classList.toggle('hidden');
}

// Handle key press
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

// Navigate to landing page
function navigateToLanding() {
    window.location.href = '../../index.html';
}

// Toggle pause state
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    pauseOverlay.classList.toggle('hidden', !gameState.isPaused);

    if (!gameState.isPaused && gameState.isPlaying) {
        // Resume game loop if unpausing
        gameState.lastFrameTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
}

// Start or restart game
function startGame() {
    // Reset game state
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.lives = CONFIG.INITIAL_LIVES;
    gameState.angle1 = CONFIG.INITIAL_ANGLE1;
    gameState.angle2 = CONFIG.INITIAL_ANGLE2;
    gameState.angleVelocity1 = 0;
    gameState.angleVelocity2 = 0;
    gameState.speedMultiplier = CONFIG.BASE_SPEED;
    gameState.pulses = [];
    gameState.particles = [];

    // Update UI
    scoreDisplay.textContent = '0';
    updateLivesDisplay();

    // Hide overlays
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    // Start game loop if needed
    if (!gameState.animationFrameId) {
        gameState.lastFrameTime = performance.now();
        gameState.animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// Update lives display
function updateLivesDisplay() {
    const lifeElements = document.querySelectorAll('.life');
    lifeElements.forEach((life, index) => {
        life.classList.toggle('lost', index >= gameState.lives);
    });
}

// Main game loop
function gameLoop(timestamp) {
    // Calculate delta time for smooth animation
    const deltaTime = timestamp - gameState.lastFrameTime;
    gameState.lastFrameTime = timestamp;

    // Only update if game is running and not paused
    if (gameState.isPlaying && !gameState.isPaused) {
        update(deltaTime);
    }

    // Always render to ensure UI updates are visible
    render();

    // Continue loop if game is still running
    if (gameState.isPlaying) {
        gameState.animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// Update game state
function update(deltaTime) {
    try {
        // Use multiple sub-steps for more accurate physics
        const timeStep = CONFIG.TIME_STEP * gameState.speedMultiplier;

        // Apply physics calculations with the new timestep
        for (let i = 0; i < CONFIG.PHYSICS_STEPS; i++) {
            updateDoublePendulum(timeStep);
        }

        // Update visual effects
        updatePulses();
        updateParticles();

    } catch (error) {
        showErrorOverlay();
        console.error('Update error:', error);
    }
}

// Update double pendulum position using physics
function updateDoublePendulum(timeStep) {
    // Calculate factors that appear in both equations
    const m1 = CONFIG.PENDULUM1_MASS;
    const m2 = CONFIG.PENDULUM2_MASS;
    const l1 = gameState.pendulum1Length;
    const l2 = gameState.pendulum2Length;
    const theta1 = gameState.angle1;
    const theta2 = gameState.angle2;
    const omega1 = gameState.angleVelocity1;
    const omega2 = gameState.angleVelocity2;
    const g = CONFIG.GRAVITY;

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

    // Apply damping
    gameState.angleVelocity1 *= CONFIG.DAMPING;
    gameState.angleVelocity2 *= CONFIG.DAMPING;

    // Update angles
    gameState.angle1 += gameState.angleVelocity1 * timeStep;
    gameState.angle2 += gameState.angleVelocity2 * timeStep;
}

// Update pulse animations
function updatePulses() {
    // Filter out completed pulses and update remaining ones
    gameState.pulses = gameState.pulses.filter(pulse => {
        // Increase pulse size
        pulse.size += CONFIG.PULSE_SPEED * pulse.speed;

        // Decrease opacity as size increases
        pulse.opacity = 1 - (pulse.size / CONFIG.PULSE_MAX_SIZE);

        // Keep pulse if it's still visible
        return pulse.opacity > 0;
    });
}

// Update particle animations
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
        particle.opacity = particle.life / CONFIG.PARTICLE_LIFESPAN;

        // Keep particle if it's still alive
        return particle.life > 0;
    });
}

// Handle player click
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

        if (distanceFromCenter < CONFIG.PERFECT_TIMING) {
            // Perfect timing
            result = 'perfect';
            points = CONFIG.SCORE_PERFECT;

            // Create visual effects
            createPulse(2);
            createParticles();

            // Increase difficulty slightly
            gameState.speedMultiplier = Math.min(
                gameState.speedMultiplier + CONFIG.SPEED_INCREMENT,
                CONFIG.MAX_SPEED
            );

        } else if (distanceFromCenter < CONFIG.GOOD_TIMING) {
            // Good timing
            result = 'good';
            points = CONFIG.SCORE_GOOD;

            // Create medium pulse effect
            createPulse(1.5);

        } else {
            // Missed timing
            result = 'miss';
            points = CONFIG.SCORE_MISS;

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
        showErrorOverlay();
        console.error('Click handling error:', error);
    }
}

// Create pulse effect
function createPulse(speed = 1) {
    gameState.pulses.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 0,
        opacity: 1,
        speed: speed
    });
}

// Create particle explosion
function createParticles() {
    // Calculate second pendulum bob position for particle origin
    const pivot1X = canvas.width / 2;
    const pivot1Y = canvas.height / 2;
    const bob1X = pivot1X + Math.sin(gameState.angle1) * gameState.pendulum1Length;
    const bob1Y = pivot1Y + Math.cos(gameState.angle1) * gameState.pendulum1Length;
    const bob2X = bob1X + Math.sin(gameState.angle2) * gameState.pendulum2Length;
    const bob2Y = bob1Y + Math.cos(gameState.angle2) * gameState.pendulum2Length;

    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
        // Calculate random velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;

        gameState.particles.push({
            x: bob2X,
            y: bob2Y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 1 + Math.random() * 3,
            life: CONFIG.PARTICLE_LIFESPAN,
            opacity: 1
        });
    }
}

// Game over handler
function gameOver() {
    gameState.isPlaying = false;

    // Check for high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('pendulumPulseHighScore', gameState.highScore);
    }

    // Update game over screen
    finalScoreDisplay.textContent = gameState.score;
    highScoreDisplay.textContent = gameState.highScore;

    // Show game over overlay
    gameOverOverlay.classList.remove('hidden');
}

// Render function
function render() {
    try {
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw center line
        drawCenterLine();

        // Draw pulses
        drawPulses();

        // Draw double pendulum
        drawDoublePendulum();

        // Draw particles
        drawParticles();

    } catch (error) {
        showErrorOverlay();
        console.error('Render error:', error);
    }
}

// Draw center line
function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = CONFIG.CENTER_LINE_WIDTH;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
}

// Draw double pendulum
function drawDoublePendulum() {
    // Calculate pendulum positions
    const pivot1X = canvas.width / 2;
    const pivot1Y = canvas.height / 2;
    const bob1X = pivot1X + Math.sin(gameState.angle1) * gameState.pendulum1Length;
    const bob1Y = pivot1Y + Math.cos(gameState.angle1) * gameState.pendulum1Length;
    const bob2X = bob1X + Math.sin(gameState.angle2) * gameState.pendulum2Length;
    const bob2Y = bob1Y + Math.cos(gameState.angle2) * gameState.pendulum2Length;

    // Draw first pendulum string
    ctx.strokeStyle = CONFIG.PENDULUM_COLOR;
    ctx.lineWidth = CONFIG.PENDULUM_WIDTH;

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
    ctx.fillStyle = CONFIG.PENDULUM_COLOR;
    ctx.beginPath();
    ctx.arc(bob1X, bob1Y, CONFIG.BOB1_SIZE, 0, Math.PI * 2);
    ctx.fill();

    // Draw second pendulum bob
    ctx.beginPath();
    ctx.arc(bob2X, bob2Y, CONFIG.BOB2_SIZE, 0, Math.PI * 2);
    ctx.fill();

    // Draw pivot point
    ctx.beginPath();
    ctx.arc(pivot1X, pivot1Y, CONFIG.PENDULUM_WIDTH * 2, 0, Math.PI * 2);
    ctx.fill();
}

// Draw pulse effects
function drawPulses() {
    gameState.pulses.forEach(pulse => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulse.opacity})`;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.size, 0, Math.PI * 2);
        ctx.stroke();
    });
}

// Draw particles
function drawParticles() {
    gameState.particles.forEach(particle => {
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Show error overlay
function showErrorOverlay() {
    errorOverlay.classList.remove('hidden');
}

// Handle window errors
window.addEventListener('error', (event) => {
    showErrorOverlay();
    console.error('Global error:', event.error);
});

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);