/**
 * Balance Beam - Core Game Logic
 * A minimalist physics game about keeping a ball balanced on a beam
 */

// ==========================================
// CONSTANTS
// ==========================================
const CONFIG = {
    // Game settings
    STORAGE_KEY: 'balanceBeamHighScore',

    // Visual settings
    VISUAL: {
        MAIN_COLOR: '#FFFFFF',
        SECONDARY_COLOR: '#999999',
        TRANSITION_SPEED: 0.3, // seconds
    },

    // Physics constants
    PHYSICS: {
        BEAM: {
            LENGTH: 300,
            THICKNESS: 4,
            MAX_ROTATION_ANGLE: Math.PI / 6, // 30 degrees
            ROTATION_SPEED: 0.05,
            INITIAL_ANGLE_RANGE: Math.PI / 12 // Random initial tilt up to 15 degrees
        },
        BALL: {
            RADIUS: 8
        },
        INITIAL_GRAVITY: 0.0015,
        FRICTION: 0.99,
        DIFFICULTY_INCREASE_RATE: 0.0001,
        WIND_GUST: {
            MIN_FORCE: 0.005,
            MAX_FORCE: 0.02,
            MIN_INTERVAL: 800,
            MAX_INTERVAL: 3500,
            DURATION: 300,
            WARNING_TIME: 1000  // Time before gust hits when arrow appears (ms)
        }
    },

    // Scoring
    SCORING: {
        POINTS_PER_SECOND: 10
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
// GAME STATE
// ==========================================
const gameState = {
    // Core game state
    state: CONFIG.GAME_STATE.INTRO,
    score: 0,
    highScore: 0,
    isPlaying: false,
    isPaused: false,

    // Animation and timing
    lastTime: 0,
    delta: 0,
    animationFrameId: null,
    timers: [],
    gameTime: 0,

    // Physics state
    currentGravity: CONFIG.PHYSICS.INITIAL_GRAVITY,

    // Wind effects
    nextWindTime: 0,
    windActive: false,
    windForce: 0,
    windDuration: 0,
    windDirection: 0,       // Direction of next/current wind gust
    windWarningActive: false, // Whether wind warning is currently active
    windWarningTime: 0,      // Start time for the warning
    windWarningProgress: 0,   // Progress of the warning animation (0-1)

    // Input state
    keys: {
        left: false,
        right: false
    },

    // Game elements
    beam: {
        x: 0, // Will be set during initialization
        y: 0, // Will be set during initialization
        length: CONFIG.PHYSICS.BEAM.LENGTH,
        thickness: CONFIG.PHYSICS.BEAM.THICKNESS,
        angle: 0,
        targetAngle: 0,
        rotationSpeed: CONFIG.PHYSICS.BEAM.ROTATION_SPEED
    },
    ball: {
        x: 0, // Will be set during initialization
        y: 0, // Will be set during initialization
        velocity: 0,
        radius: CONFIG.PHYSICS.BALL.RADIUS,
        pulseAnimation: 0 // For visual feedback of wind gusts
    }
};

// ==========================================
// DOM ELEMENTS
// ==========================================
let canvas, ctx;
let scoreDisplay;
let helpButton, helpPanel, closeHelp;
let pauseOverlay, gameOverOverlay, finalScoreDisplay, highScoreDisplay, restartButton;
let errorOverlay;
let canvasWidth, canvasHeight;

// ==========================================
// INITIALIZATION
// ==========================================
function initGame() {
    try {
        // Get DOM elements
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;

        scoreDisplay = document.getElementById('score');

        helpButton = document.getElementById('help-button');
        helpPanel = document.getElementById('help-panel');
        closeHelp = document.getElementById('close-help');

        pauseOverlay = document.getElementById('pause-overlay');
        gameOverOverlay = document.getElementById('game-over');
        finalScoreDisplay = document.getElementById('final-score');
        highScoreDisplay = document.getElementById('high-score');
        restartButton = document.getElementById('restart-button');

        errorOverlay = document.getElementById('error-overlay');

        // Initialize beam and ball positions
        gameState.beam.x = canvasWidth / 2;
        gameState.beam.y = canvasHeight / 2;
        gameState.ball.x = canvasWidth / 2;
        gameState.ball.y = canvasHeight / 2 - gameState.ball.radius - gameState.beam.thickness / 2;

        // Load high score from localStorage
        gameState.highScore = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;

        // Add event listeners
        setupEventListeners();

        // Render the intro/static state
        render();

    } catch (error) {
        handleError('Game initialization error:', error);
    }
}

// ==========================================
// SETUP FUNCTIONS
// ==========================================
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // UI controls
    helpButton.addEventListener('click', toggleHelpPanel);
    closeHelp.addEventListener('click', toggleHelpPanel);
    restartButton.addEventListener('click', startGame);

    // Error handling
    window.addEventListener('error', (event) => {
        handleError('Global error:', event.error);
    });
}

// ==========================================
// UI FUNCTIONS
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

function navigateToLanding() {
    window.location.href = '../../index.html';
}

function updateScoreDisplay() {
    scoreDisplay.textContent = gameState.score;
}

// ==========================================
// GAME STATE FUNCTIONS
// ==========================================
function startGame() {
    resetGame();

    // Hide overlays
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    // Set random initial beam angle to make it challenging from the start
    const randomSign = Math.random() > 0.5 ? 1 : -1;
    gameState.beam.angle = randomSign * (Math.random() * CONFIG.PHYSICS.BEAM.INITIAL_ANGLE_RANGE);

    // Schedule first wind gust
    scheduleNextWindGust();

    // Start game loop
    gameState.state = CONFIG.GAME_STATE.PLAYING;
    gameState.isPlaying = true;
    gameState.lastTime = performance.now();
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
}

function resetGame() {
    // Reset game state
    gameState.state = CONFIG.GAME_STATE.INTRO;
    gameState.isPlaying = false;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.gameTime = 0;
    gameState.currentGravity = CONFIG.PHYSICS.INITIAL_GRAVITY;
    gameState.timers = [];
    gameState.windActive = false;
    gameState.windForce = 0;
    gameState.windDuration = 0;
    gameState.windDirection = 0;
    gameState.windWarningActive = false;
    gameState.windWarningTime = 0;
    gameState.windWarningProgress = 0;

    // Reset beam state - angle will be set in startGame
    gameState.beam.targetAngle = 0;

    // Reset ball state
    gameState.ball.x = canvasWidth / 2;
    gameState.ball.y = canvasHeight / 2 - gameState.ball.radius - gameState.beam.thickness / 2;
    gameState.ball.velocity = 0;
    gameState.ball.pulseAnimation = 0;

    // Update UI
    updateScoreDisplay();
}

function gameOver() {
    gameState.state = CONFIG.GAME_STATE.GAME_OVER;
    gameState.isPlaying = false;

    // Cancel animation frame
    cancelAnimationFrame(gameState.animationFrameId);

    // Clear timers
    gameState.timers.forEach(timer => clearTimeout(timer));
    gameState.timers = [];

    // Check for high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem(CONFIG.STORAGE_KEY, gameState.highScore);
    }

    // Update game over screen
    finalScoreDisplay.textContent = gameState.score;
    highScoreDisplay.textContent = gameState.highScore; // Removed "Best: " prefix

    // Show game over overlay
    gameOverOverlay.classList.remove('hidden');
}

// ==========================================
// INPUT HANDLERS
// ==========================================
function handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowLeft':
            gameState.keys.left = true;
            break;
        case 'ArrowRight':
            gameState.keys.right = true;
            break;
        case 'Escape':
            togglePause();
            break;
        case 'q':
        case 'Q':
            navigateToLanding();
            break;
    }

    // Start game on first key press if not already playing
    if (gameState.state === CONFIG.GAME_STATE.INTRO &&
        (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        startGame();
    }
}

function handleKeyUp(event) {
    switch (event.key) {
        case 'ArrowLeft':
            gameState.keys.left = false;
            break;
        case 'ArrowRight':
            gameState.keys.right = false;
            break;
    }
}

// ==========================================
// GAME LOOP
// ==========================================
function gameLoop(timestamp) {
    if (!gameState.isPlaying || gameState.isPaused) return;

    // Calculate delta time
    gameState.delta = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;

    try {
        update(gameState.delta);
        render();
        gameState.animationFrameId = requestAnimationFrame(gameLoop);
    } catch (error) {
        handleError('Game loop error:', error);
    }
}

// ==========================================
// UPDATE FUNCTIONS
// ==========================================
function update(deltaTime) {
    updateGameTimeAndScore(deltaTime);
    updateDifficulty();
    updateBeamAngle(deltaTime);
    updateWindEffect(deltaTime);
    updateBallPhysics(deltaTime);
    updateVisualEffects(deltaTime);
    checkGameOver();
    updateScoreDisplay();
}

function updateGameTimeAndScore(deltaTime) {
    // Update game time and calculate score
    gameState.gameTime += deltaTime / 1000;
    gameState.score = Math.floor(gameState.gameTime * CONFIG.SCORING.POINTS_PER_SECOND);
}

function updateDifficulty() {
    // Gradually increase gravity over time
    gameState.currentGravity = CONFIG.PHYSICS.INITIAL_GRAVITY +
        (gameState.gameTime * CONFIG.PHYSICS.DIFFICULTY_INCREASE_RATE);
}

function updateBeamAngle(deltaTime) {
    // Calculate target angle based on keyboard input
    if (gameState.keys.left && !gameState.keys.right) {
        gameState.beam.targetAngle = -CONFIG.PHYSICS.BEAM.MAX_ROTATION_ANGLE;
    } else if (gameState.keys.right && !gameState.keys.left) {
        gameState.beam.targetAngle = CONFIG.PHYSICS.BEAM.MAX_ROTATION_ANGLE;
    } else {
        gameState.beam.targetAngle = 0;
    }

    // Smoothly interpolate to target angle (ease-in-out effect)
    const angleDistance = gameState.beam.targetAngle - gameState.beam.angle;
    gameState.beam.angle += angleDistance * gameState.beam.rotationSpeed * (deltaTime / 16.67); // Normalize to ~60fps
}

function scheduleNextWindGust() {
    if (!gameState.isPlaying) return;

    // Calculate next wind gust time
    const interval = CONFIG.PHYSICS.WIND_GUST.MIN_INTERVAL +
        Math.random() * (CONFIG.PHYSICS.WIND_GUST.MAX_INTERVAL -
            CONFIG.PHYSICS.WIND_GUST.MIN_INTERVAL);

    // Determine wind direction for the next gust
    const direction = Math.random() > 0.5 ? 1 : -1;
    gameState.windDirection = direction;

    // Schedule warning to appear before the gust
    const warningTime = interval - CONFIG.PHYSICS.WIND_GUST.WARNING_TIME;
    gameState.nextWindTime = performance.now() + interval;

    // Schedule the warning to appear
    if (warningTime > 0) {
        const warningTimer = setTimeout(() => {
            if (gameState.isPlaying && !gameState.isPaused) {
                activateWindWarning();
            }
        }, warningTime);
        gameState.timers.push(warningTimer);
    }

    // Schedule the wind gust
    const timer = setTimeout(() => {
        if (gameState.isPlaying && !gameState.isPaused) {
            activateWindGust();
        }
    }, interval);

    gameState.timers.push(timer);
}

function activateWindWarning() {
    if (!gameState.isPlaying || gameState.isPaused) return;

    gameState.windWarningActive = true;
    gameState.windWarningTime = performance.now();
    gameState.windWarningProgress = 0;
}

function activateWindGust() {
    if (!gameState.isPlaying || gameState.isPaused) return;

    // Determine wind force (direction was already set in scheduleNextWindGust)
    const force = CONFIG.PHYSICS.WIND_GUST.MIN_FORCE +
        Math.random() * (CONFIG.PHYSICS.WIND_GUST.MAX_FORCE -
            CONFIG.PHYSICS.WIND_GUST.MIN_FORCE);

    gameState.windActive = true;
    gameState.windForce = gameState.windDirection * force;
    gameState.windDuration = CONFIG.PHYSICS.WIND_GUST.DURATION;
    gameState.windWarningActive = false;

    // Visual feedback - start pulse animation
    gameState.ball.pulseAnimation = 1;

    // Schedule end of wind gust
    const timer = setTimeout(() => {
        if (gameState.isPlaying) {
            gameState.windActive = false;
            gameState.windForce = 0;
            scheduleNextWindGust();
        }
    }, CONFIG.PHYSICS.WIND_GUST.DURATION);

    gameState.timers.push(timer);
}

function updateWindEffect(deltaTime) {
    // Update wind warning
    if (gameState.windWarningActive) {
        const elapsedTime = performance.now() - gameState.windWarningTime;
        gameState.windWarningProgress = Math.min(elapsedTime / CONFIG.PHYSICS.WIND_GUST.WARNING_TIME, 1);

        if (gameState.windWarningProgress >= 1) {
            gameState.windWarningActive = false;
        }
    }

    // Update active wind
    if (gameState.windActive) {
        // Apply wind force to ball
        gameState.ball.velocity += gameState.windForce * (deltaTime / 16.67);

        // Update wind duration
        gameState.windDuration -= deltaTime;
        if (gameState.windDuration <= 0) {
            gameState.windActive = false;
            gameState.windForce = 0;
        }
    } else if (gameState.isPlaying && performance.now() >= gameState.nextWindTime) {
        activateWindGust();
    }
}

function updateBallPhysics(deltaTime) {
    // Apply gravity based on beam angle
    gameState.ball.velocity += Math.sin(gameState.beam.angle) * gameState.currentGravity * deltaTime;

    // Apply friction
    gameState.ball.velocity *= CONFIG.PHYSICS.FRICTION;

    // Update ball position
    gameState.ball.x += gameState.ball.velocity * deltaTime;

    // Update ball's position on the beam
    updateBallPositionOnBeam();
}

function updateBallPositionOnBeam() {
    // Calculate beam endpoints
    const { x: beamX, y: beamY, length, angle } = gameState.beam;
    const halfLength = length / 2;

    const leftEndX = beamX - Math.cos(angle) * halfLength;
    const leftEndY = beamY - Math.sin(angle) * halfLength;
    const rightEndX = beamX + Math.cos(angle) * halfLength;
    const rightEndY = beamY + Math.sin(angle) * halfLength;

    // Calculate beam position under the ball using linear interpolation
    const relativeX = (gameState.ball.x - leftEndX) / (rightEndX - leftEndX);

    if (relativeX >= 0 && relativeX <= 1) {
        // Ball is above the beam
        const beamY = leftEndY + relativeX * (rightEndY - leftEndY);
        gameState.ball.y = beamY - gameState.ball.radius - gameState.beam.thickness / 2;
    }
}

function updateVisualEffects(deltaTime) {
    // Update pulse animation for wind effect
    if (gameState.ball.pulseAnimation > 0) {
        gameState.ball.pulseAnimation -= deltaTime / 300; // Fade over 300ms
        if (gameState.ball.pulseAnimation < 0) {
            gameState.ball.pulseAnimation = 0;
        }
    }
}

function checkGameOver() {
    const { x: beamX, angle, length } = gameState.beam;
    const halfLength = length / 2;

    // Calculate beam endpoints
    const leftEndX = beamX - Math.cos(angle) * halfLength;
    const rightEndX = beamX + Math.cos(angle) * halfLength;

    // Calculate how far along the beam the ball is
    const relativeX = (gameState.ball.x - leftEndX) / (rightEndX - leftEndX);

    // Check if ball is off the beam or outside canvas
    if (relativeX < 0 || relativeX > 1 || gameState.ball.x < 0 || gameState.ball.x > canvasWidth) {
        gameOver();
    }
}

// ==========================================
// RENDER FUNCTIONS
// ==========================================
function render() {
    clearCanvas();

    // Draw based on game state
    switch (gameState.state) {
        case CONFIG.GAME_STATE.INTRO:
        case CONFIG.GAME_STATE.PLAYING:
        case CONFIG.GAME_STATE.PAUSED:
            renderGame();
            break;
        case CONFIG.GAME_STATE.GAME_OVER:
            renderGame(); // Still draw the game in background
            break;
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function renderGame() {
    // Draw wind warning if active
    if (gameState.windWarningActive) {
        drawWindWarning();
    }

    drawBeam();
    drawBall();
}

function drawBeam() {
    const { x, y, length, thickness, angle } = gameState.beam;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = CONFIG.VISUAL.SECONDARY_COLOR; // Changed from MAIN_COLOR
    ctx.fillRect(-length / 2, -thickness / 2, length, thickness);
    ctx.restore();
}

function drawBall() {
    const { x, y, radius, pulseAnimation } = gameState.ball;

    // Draw pulse effect if active
    if (pulseAnimation > 0) {
        const pulseRadius = radius + (5 * pulseAnimation);
        const alpha = pulseAnimation * 0.5;

        // Pulse remains white but with alpha
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw the main ball (remains white)
    ctx.fillStyle = CONFIG.VISUAL.MAIN_COLOR;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawWindWarning() {
    const { windDirection, windWarningProgress } = gameState;
    const { x, y } = gameState.ball;

    // Only draw the arrow when we're far enough into the warning period
    if (windWarningProgress > 0.2) {
        // Calculate arrow properties based on progress
        const arrowOpacity = Math.min(1, windWarningProgress * 1.5);
        const arrowSize = 6 + (windWarningProgress * 4); // Arrow grows as it approaches impact
        const arrowDistance = 30 - (windWarningProgress * 15); // Arrow moves closer to ball

        const arrowX = x - (windDirection * arrowDistance);
        const arrowY = y;

        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${arrowOpacity})`;

        // Draw arrow
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - (windDirection * arrowSize), arrowY - arrowSize);
        ctx.lineTo(arrowX - (windDirection * arrowSize), arrowY + arrowSize);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

// ==========================================
// ERROR HANDLING
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
// START GAME
// ==========================================
document.addEventListener('DOMContentLoaded', initGame);
