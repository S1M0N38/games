// Game constants
const CONFIG = {
    INITIAL_LIVES: 3,
    STORAGE_KEY: 'echoPulseHighScore',

    VISUAL: {
        MAIN_COLOR: '#FFFFFF',
        SECONDARY_COLOR: '#999999',
        TRANSITION_SPEED: 0.3, // seconds
    },

    PHYSICS: {
        BASE_PULSE_SPEED: 75, // pixels per second (increased from 60)
        PULSE_ACCELERATION: 0.08, // increase per second (increased from 0.05)
        MIN_PULSE_INTERVAL: 400, // milliseconds (decreased from 500)
        MAX_PULSE_INTERVAL: 1600, // milliseconds (decreased from 2000)
        PERFECT_TIMING_WINDOW: 0.12, // seconds (decreased from 0.15)
        GOOD_TIMING_WINDOW: 0.25, // seconds (decreased from 0.3)
    },

    TARGET: {
        RADIUS: 150 // single target ring radius
    },

    SCORING: {
        PERFECT: 1, // Changed from 100
        GOOD: 1,    // Changed from 50
        MISS: 0,
    },

    GAME_STATE: {
        READY: 'ready',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameover',
        ERROR: 'error'
    },

    TIMING: {
        READY_DURATION: 500  // milliseconds to transition from ready to play
    }
};

// Game state
const gameState = {
    state: CONFIG.GAME_STATE.READY,
    score: 0,
    lives: CONFIG.INITIAL_LIVES,
    highScore: 0,
    isPlaying: false,
    isPaused: false,

    lastTime: 0,
    delta: 0,
    animationFrameId: null,
    timers: [],
    pulseSpeed: CONFIG.PHYSICS.BASE_PULSE_SPEED,

    // Rings management
    pulseRings: [],
    nextPulseTime: 0,

    // Visual feedback
    feedback: { type: null, time: 0 },
};

// Game elements
let canvas, ctx;
let scoreDisplay, livesContainer; // Removed comboDisplay
let helpButton, helpPanel, closeHelp;
let pauseOverlay, gameOverOverlay, finalScoreDisplay, highScoreDisplay, restartButton; // highScoreDisplay is for game over screen
let errorOverlay;

// Classes
class PulseRing {
    constructor() {
        this.radius = 0;
        this.opacity = 1;
        this.expanding = true;
        this.scored = false; // Track if this ring has been scored
        this.hit = false; // Track if this ring has been hit
    }

    update(deltaTime, speed) {
        if (this.expanding) {
            this.radius += speed * deltaTime;

            // Decrease opacity as the ring expands
            const maxRadius = CONFIG.TARGET.RADIUS + 100;
            this.opacity = Math.max(0, 1 - (this.radius / maxRadius));

            // Remove ring once fully expanded and transparent
            if (this.radius > maxRadius) {
                return false;
            }
        }
        return true;
    }

    draw(ctx, centerX, centerY) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Initialization
function initGame() {
    try {
        // Get DOM elements
        canvas = document.getElementById('game-canvas');
        ctx = canvas.getContext('2d');
        scoreDisplay = document.getElementById('score'); // Reverted ID
        livesContainer = document.getElementById('lives-container');
        helpButton = document.getElementById('help-button');
        helpPanel = document.getElementById('help-panel');
        closeHelp = document.getElementById('close-help');
        pauseOverlay = document.getElementById('pause-overlay');
        gameOverOverlay = document.getElementById('game-over');
        finalScoreDisplay = document.getElementById('final-score');
        highScoreDisplay = document.getElementById('high-score'); // This is for the game over screen
        restartButton = document.getElementById('restart-button');
        errorOverlay = document.getElementById('error-overlay');

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        gameState.highScore = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;

        createLivesIndicators();
        addEventListeners();
        initializeGameElements();
        getReady();

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

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    window.addEventListener('error', (event) => {
        handleError('Global error:', event.error);
    });
}

function initializeGameElements() {
    gameState.pulseRings = [];
    gameState.pulseSpeed = CONFIG.PHYSICS.BASE_PULSE_SPEED;
    gameState.nextPulseTime = 0;
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
function getReady() {
    gameState.state = CONFIG.GAME_STATE.READY;
    gameState.isPlaying = false; // Ensure isPlaying is false during READY
    gameState.isPaused = false;

    // Render ready screen (optional, currently just shows target)
    const renderReadyScreen = () => {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderTargetRing(centerX, centerY); // Simplified call
        renderCentralEmitter(centerX, centerY);

        if (gameState.state === CONFIG.GAME_STATE.READY) {
            requestAnimationFrame(renderReadyScreen);
        }
    };
    renderReadyScreen();


    // Automatically start game after ready duration
    setTimeout(() => {
        // Check if still in READY state before starting
        if (gameState.state === CONFIG.GAME_STATE.READY) {
            startGame();
        }
    }, CONFIG.TIMING.READY_DURATION);
}

function startGame() {
    gameState.state = CONFIG.GAME_STATE.PLAYING;
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.lives = CONFIG.INITIAL_LIVES;
    gameState.pulseSpeed = CONFIG.PHYSICS.BASE_PULSE_SPEED;

    resetGameState();

    scoreDisplay.textContent = gameState.score;
    updateLivesDisplay();
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    gameState.lastTime = performance.now();
    gameLoop(gameState.lastTime);
}

function resetGameState() {
    gameState.pulseRings = [];
    gameState.nextPulseTime = performance.now() + getRandomPulseInterval();

    // Clear any feedback
    gameState.feedback = { type: null, time: 0 };
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

    finalScoreDisplay.textContent = `${gameState.score}`;
    highScoreDisplay.textContent = `${gameState.highScore}`; // Game over screen still shows high score

    setTimeout(() => { gameOverOverlay.classList.remove('hidden'); }, 1000);
}

// Input handlers
function handleKeyDown(event) {
    if (event.repeat) return; // Prevent key repeat

    switch (event.key.toLowerCase()) {
        case 'escape':
            togglePause();
            break;
        case 'q':
            navigateToLanding();
            break;
        case ' ': // Spacebar - only for gameplay, not for starting
            if (gameState.isPlaying && !gameState.isPaused) {
                processSpacebar();
            }
            break;
    }
}

function handleKeyUp(event) {
    // No specific key-up handling needed for spacebar
}

function processSpacebar() {
    let bestResult = { type: 'miss', distance: Infinity };
    let hitRingIndex = -1;

    // Check all pulse rings to find the closest match
    gameState.pulseRings.forEach((ring, index) => {
        if (ring.scored || ring.hit) return; // Already scored or hit

        const distance = Math.abs(ring.radius - CONFIG.TARGET.RADIUS);
        const timingWindow = distance / gameState.pulseSpeed; // Time until perfect alignment

        if (timingWindow <= CONFIG.PHYSICS.PERFECT_TIMING_WINDOW && distance < bestResult.distance) {
            bestResult = { type: 'perfect', distance: distance };
            hitRingIndex = index;
        } else if (timingWindow <= CONFIG.PHYSICS.GOOD_TIMING_WINDOW && distance < bestResult.distance) {
            bestResult = { type: 'good', distance: distance };
            hitRingIndex = index;
        }
    });

    // Apply the hit result
    if (hitRingIndex !== -1) {
        const ring = gameState.pulseRings[hitRingIndex];
        ring.scored = true;
        ring.hit = true;

        handleHitFeedback(bestResult.type);
    } else {
        handleHitFeedback('miss');
    }
}

function handleHitFeedback(type) {
    // Apply appropriate feedback
    switch (type) {
        case 'perfect':
        case 'good': // Both perfect and good give 1 point
            updateScore(1); // Pass 1 directly
            break;
        case 'miss':
            updateScore(0); // Pass 0 for miss
            reduceLife();
            break;
    }

    // Store feedback for visual effects
    gameState.feedback = {
        type: type,
        time: performance.now()
    };
}

// Game mechanics
function getRandomPulseInterval() {
    // Simplified: No longer decreases interval based on score
    const minInterval = CONFIG.PHYSICS.MIN_PULSE_INTERVAL;
    const maxInterval = CONFIG.PHYSICS.MAX_PULSE_INTERVAL;

    return Math.random() * (maxInterval - minInterval) + minInterval;
}

function createPulseRing() {
    gameState.pulseRings.push(new PulseRing());
}

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
    // Create new pulse rings based on timing
    if (performance.now() >= gameState.nextPulseTime) {
        createPulseRing();
        gameState.nextPulseTime = performance.now() + getRandomPulseInterval();
    }

    // Accelerate pulse speed over time
    gameState.pulseSpeed += CONFIG.PHYSICS.PULSE_ACCELERATION * deltaTime;

    // Update pulse rings
    gameState.pulseRings = gameState.pulseRings.filter(ring =>
        ring.update(deltaTime, gameState.pulseSpeed));

    // Check for missed rings
    checkMissedRings();
}

function checkMissedRings() {
    gameState.pulseRings.forEach(ring => {
        // If the ring has passed the target's outer good timing window and hasn't been scored/hit
        const missThreshold = CONFIG.TARGET.RADIUS + (gameState.pulseSpeed * CONFIG.PHYSICS.GOOD_TIMING_WINDOW);
        if (ring.radius > missThreshold && !ring.scored && !ring.hit) {

            ring.scored = true; // Mark as scored/missed to prevent duplicate penalty

            // Apply miss penalty: lose life, reset combo
            handleHitFeedback('miss'); // Use the existing miss handling logic
        }
    });
}

function updateScore(points) {
    // Simplified: Only increment if points > 0
    if (points > 0) {
        gameState.score += points; // Increment score (will be 1)
        scoreDisplay.textContent = gameState.score; // Updates current score display
    }
    // No action needed for points === 0 (miss) regarding score update
}

function reduceLife() {
    if (gameState.lives <= 0) return; // Already game over

    gameState.lives--;
    updateLivesDisplay();

    // Clear all active pulse rings from the screen
    gameState.pulseRings = [];

    // Add a brief visual feedback for losing a life (optional, e.g., screen flash)
    // document.body.style.animation = 'miss-flash 0.3s ease-out';
    // setTimeout(() => { document.body.style.animation = ''; }, 300);


    if (gameState.lives <= 0) {
        gameOver();
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    switch (gameState.state) {
        case CONFIG.GAME_STATE.READY:
            // Handled by getReady's renderReadyScreen loop
            break;
        case CONFIG.GAME_STATE.PLAYING: renderGame(centerX, centerY); break;
        case CONFIG.GAME_STATE.PAUSED: renderGame(centerX, centerY); break;
        case CONFIG.GAME_STATE.GAME_OVER: renderGameOver(centerX, centerY); break;
    }
}

function renderGame(centerX, centerY) {
    // Render target ring
    renderTargetRing(centerX, centerY); // Simplified call

    // Render pulse rings
    gameState.pulseRings.forEach(ring => {
        ring.draw(ctx, centerX, centerY);
    });

    // Render central emitter
    renderCentralEmitter(centerX, centerY);

    // Render feedback effects
    renderFeedbackEffects(centerX, centerY);
}

function renderTargetRing(centerX, centerY) { // Removed 'pulsing' parameter
    ctx.beginPath();
    ctx.arc(centerX, centerY, CONFIG.TARGET.RADIUS, 0, Math.PI * 2);

    // Always render the gameplay style target ring
    ctx.strokeStyle = CONFIG.VISUAL.SECONDARY_COLOR;
    ctx.lineWidth = 3;

    ctx.stroke();
}

function renderCentralEmitter(centerX, centerY) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.VISUAL.MAIN_COLOR;
    ctx.fill();
}

function renderFeedbackEffects(centerX, centerY) {
    if (gameState.feedback.type && (performance.now() - gameState.feedback.time < 300)) {
        const targetRadius = CONFIG.TARGET.RADIUS;
        const elapsedTime = (performance.now() - gameState.feedback.time) / 300; // 0 to 1

        // Draw feedback at the target ring position
        ctx.beginPath();
        ctx.arc(centerX, centerY, targetRadius, 0, Math.PI * 2);

        if (gameState.feedback.type === 'perfect') {
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - elapsedTime})`;
            ctx.lineWidth = 5 * (1 - elapsedTime) + 2;
        } else if (gameState.feedback.type === 'good') {
            ctx.strokeStyle = `rgba(180, 180, 180, ${1 - elapsedTime})`;
            ctx.lineWidth = 4 * (1 - elapsedTime) + 2;
        } else if (gameState.feedback.type === 'miss') {
            ctx.strokeStyle = `rgba(255, 0, 0, ${0.5 * (1 - elapsedTime)})`;
            ctx.lineWidth = 3 * (1 - elapsedTime) + 2;
        }

        ctx.stroke();
    }
}

function renderGameOver(centerX, centerY) {
    // Still render the game elements, but faded
    ctx.globalAlpha = 0.3;
    renderTargetRing(centerX, centerY); // Simplified call
    renderCentralEmitter(centerX, centerY);
    ctx.globalAlpha = 1.0;
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
