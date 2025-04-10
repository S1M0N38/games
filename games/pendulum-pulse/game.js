/**
 * Pendulum Pulse - A minimalist black and white timing game
 * 
 * Core mechanics:
 * - A pendulum swings across the screen in a natural arc motion
 * - Player must click/tap when the pendulum crosses the center line
 * - Timing precision determines score and visual feedback
 */

// Game Configuration
const CONFIG = {
    // Physics and motion
    pendulumLength: 0, // Will be set based on screen size
    gravity: 0.001,    // Gravity constant for pendulum physics
    damping: 0.999,    // Slight damping for natural motion
    initialAngle: Math.PI / 8, // Starting angle in radians
    
    // Difficulty progression
    baseSpeed: 1,      // Base speed multiplier
    speedIncrement: 0.1, // How much speed increases after successful hits
    maxSpeed: 2.5,     // Maximum speed cap
    
    // Timing and scoring
    perfectTiming: 0.05, // Time window for perfect timing (in radians)
    goodTiming: 0.15,    // Time window for good timing (in radians)
    scoreMultipliers: {
        perfect: 100,
        good: 50,
        miss: 0
    },
    
    // Visual settings
    pendulumColor: "#FFFFFF",
    pendulumWidth: 3,
    bobSize: 15,
    centerLineWidth: 2,
    
    // Animation settings
    pulseMaxSize: 100,
    pulseSpeed: 0.05,
    particleCount: 20,
    particleLifespan: 60 // frames
};

// Game state
const state = {
    running: false,
    score: 0,
    pulses: [],
    particles: [],
    angle: CONFIG.initialAngle,
    angleVelocity: 0,
    speedMultiplier: CONFIG.baseSpeed,
    gameTime: 0,
    lives: 3
};

// DOM Elements
let canvas, ctx, scoreElement, accuracyElement, menuElement, gameOverElement, finalScoreElement;

// Initialize game when window loads
window.addEventListener('load', init);

/**
 * Initialize the game
 */
function init() {
    // Get DOM elements
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    scoreElement = document.getElementById('score');
    accuracyElement = document.getElementById('accuracy');
    menuElement = document.getElementById('menu');
    gameOverElement = document.getElementById('gameOver');
    finalScoreElement = document.getElementById('finalScore');
    
    // Set up event listeners
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', startGame);
    canvas.addEventListener('click', handleClick);
    
    // Set canvas size to window size and handle resizing
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Calculate pendulum length based on canvas size
    CONFIG.pendulumLength = Math.min(canvas.width, canvas.height) * 0.4;
    
    // Show the menu initially
    showMenu();
    
    // Render the initial frame
    render();
}

/**
 * Set canvas dimensions to match window
 */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Recalculate pendulum length for new canvas size
    CONFIG.pendulumLength = Math.min(canvas.width, canvas.height) * 0.4;
}

/**
 * Start or restart the game
 */
function startGame() {
    // Reset game state
    state.running = true;
    state.score = 0;
    state.pulses = [];
    state.particles = [];
    state.angle = CONFIG.initialAngle;
    state.angleVelocity = 0;
    state.speedMultiplier = CONFIG.baseSpeed;
    state.gameTime = 0;
    state.lives = 3;
    
    // Update UI
    scoreElement.textContent = '0';
    hideMenu();
    hideGameOver();
    
    // Start game loop if it's not already running
    if (!state.animationFrameId) {
        gameLoop();
    }
}

/**
 * Main game loop
 */
function gameLoop() {
    // Update game state
    update();
    
    // Render the current frame
    render();
    
    // Continue the loop
    state.animationFrameId = requestAnimationFrame(gameLoop);
}

/**
 * Update game state for current frame
 */
function update() {
    if (!state.running) return;
    
    // Increment game time
    state.gameTime++;
    
    // Update pendulum physics
    updatePendulum();
    
    // Update visual effects
    updatePulses();
    updateParticles();
    
    // Check if game over condition is met
    if (state.lives <= 0) {
        endGame();
    }
}

/**
 * Update pendulum position using physics
 */
function updatePendulum() {
    // Apply gravity to create acceleration
    const acceleration = CONFIG.gravity * Math.sin(state.angle) * -1;
    
    // Update velocity with acceleration and apply speed multiplier
    state.angleVelocity += acceleration * state.speedMultiplier;
    
    // Apply damping to simulate natural motion
    state.angleVelocity *= CONFIG.damping;
    
    // Update angle with velocity
    state.angle += state.angleVelocity * state.speedMultiplier;
}

/**
 * Update pulse animations
 */
function updatePulses() {
    // Filter out completed pulses and update remaining ones
    state.pulses = state.pulses.filter(pulse => {
        // Increase pulse size
        pulse.size += CONFIG.pulseSpeed * pulse.speed;
        
        // Decrease opacity as size increases
        pulse.opacity = 1 - (pulse.size / CONFIG.pulseMaxSize);
        
        // Keep pulse if it's still visible
        return pulse.opacity > 0;
    });
}

/**
 * Update particle animations
 */
function updateParticles() {
    // Filter out expired particles and update remaining ones
    state.particles = state.particles.filter(particle => {
        // Move particle
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Apply gravity effect
        particle.vy += 0.05;
        
        // Fade out
        particle.life--;
        particle.opacity = particle.life / CONFIG.particleLifespan;
        
        // Keep particle if it's still alive
        return particle.life > 0;
    });
}

/**
 * Handle player click/tap
 */
function handleClick() {
    if (!state.running) return;
    
    // Calculate how close to the center the pendulum is
    const distanceFromCenter = Math.abs(state.angle);
    
    // Determine accuracy of the timing
    let result, points, feedbackText;
    
    if (distanceFromCenter < CONFIG.perfectTiming) {
        // Perfect timing
        result = 'perfect';
        points = CONFIG.scoreMultipliers.perfect;
        feedbackText = 'PERFECT!';
        
        // Create a strong pulse effect
        createPulse(2);
        
        // Create particles for visual reward
        createExplosion();
        
        // Increase difficulty slightly
        state.speedMultiplier = Math.min(
            state.speedMultiplier + CONFIG.speedIncrement,
            CONFIG.maxSpeed
        );
    } else if (distanceFromCenter < CONFIG.goodTiming) {
        // Good timing
        result = 'good';
        points = CONFIG.scoreMultipliers.good;
        feedbackText = 'GOOD!';
        
        // Create a medium pulse effect
        createPulse(1.5);
    } else {
        // Missed timing
        result = 'miss';
        points = CONFIG.scoreMultipliers.miss;
        feedbackText = 'MISS!';
        
        // Create a weak pulse effect
        createPulse(1);
        
        // Lose a life
        state.lives--;
    }
    
    // Update score
    state.score += points;
    scoreElement.textContent = state.score;
    
    // Apply score animation
    scoreElement.classList.remove('score-pulse');
    void scoreElement.offsetWidth; // Trigger reflow
    scoreElement.classList.add('score-pulse');
    
    // Show feedback text
    showAccuracyText(feedbackText);
}

/**
 * Create a pulse effect at the center
 */
function createPulse(speed = 1) {
    state.pulses.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 0,
        opacity: 1,
        speed: speed
    });
}

/**
 * Create particle explosion at pendulum bob position
 */
function createExplosion() {
    // Calculate pendulum bob position
    const bobX = canvas.width / 2 + Math.sin(state.angle) * CONFIG.pendulumLength;
    const bobY = canvas.height / 2 + Math.cos(state.angle) * CONFIG.pendulumLength;
    
    for (let i = 0; i < CONFIG.particleCount; i++) {
        // Calculate random velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        
        state.particles.push({
            x: bobX,
            y: bobY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 1 + Math.random() * 3,
            life: CONFIG.particleLifespan,
            opacity: 1
        });
    }
}

/**
 * Show accuracy feedback text
 */
function showAccuracyText(text) {
    accuracyElement.textContent = text;
    accuracyElement.classList.remove('show');
    void accuracyElement.offsetWidth; // Trigger reflow
    accuracyElement.classList.add('show');
}

/**
 * End the game
 */
function endGame() {
    state.running = false;
    finalScoreElement.textContent = state.score;
    showGameOver();
}

/**
 * Render the current frame
 */
function render() {
    // Clear the canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    drawCenterLine();
    
    // Draw pulses
    drawPulses();
    
    // Draw pendulum
    drawPendulum();
    
    // Draw particles
    drawParticles();
    
    // Draw lives
    drawLives();
}

/**
 * Draw the center line
 */
function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = CONFIG.centerLineWidth;
    
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
}

/**
 * Draw the pendulum
 */
function drawPendulum() {
    // Calculate pendulum position
    const pivotX = canvas.width / 2;
    const pivotY = canvas.height / 2;
    const bobX = pivotX + Math.sin(state.angle) * CONFIG.pendulumLength;
    const bobY = pivotY + Math.cos(state.angle) * CONFIG.pendulumLength;
    
    // Draw pendulum string
    ctx.strokeStyle = CONFIG.pendulumColor;
    ctx.lineWidth = CONFIG.pendulumWidth;
    
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();
    
    // Draw pendulum bob
    ctx.fillStyle = CONFIG.pendulumColor;
    ctx.beginPath();
    ctx.arc(bobX, bobY, CONFIG.bobSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pivot point
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, CONFIG.pendulumWidth * 2, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Draw pulse effects
 */
function drawPulses() {
    state.pulses.forEach(pulse => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulse.opacity})`;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.size, 0, Math.PI * 2);
        ctx.stroke();
    });
}

/**
 * Draw particles
 */
function drawParticles() {
    state.particles.forEach(particle => {
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

/**
 * Draw player lives
 */
function drawLives() {
    const radius = 8;
    const spacing = radius * 3;
    const startX = 20 + radius;
    const startY = 20 + radius;
    
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        
        if (i < state.lives) {
            // Filled circle for remaining lives
            ctx.fillStyle = "white";
            ctx.arc(startX + i * spacing, startY, radius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Hollow circle for lost lives
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.lineWidth = 2;
            ctx.arc(startX + i * spacing, startY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

/**
 * Show the main menu
 */
function showMenu() {
    menuElement.classList.remove('hidden');
}

/**
 * Hide the main menu
 */
function hideMenu() {
    menuElement.classList.add('hidden');
}

/**
 * Show the game over screen
 */
function showGameOver() {
    gameOverElement.classList.remove('hidden');
}

/**
 * Hide the game over screen
 */
function hideGameOver() {
    gameOverElement.classList.add('hidden');
}