/**
 * Void Serpent - A minimalist snake game
 * Canvas-based implementation with keyboard controls
 */

// ==========================================
// Game constants
// ==========================================
const CONFIG = {
    // Core gameplay settings
    GRID_SIZE: 20, // Size of each grid cell in pixels
    INITIAL_SPEED: 10, // Initial frames per movement
    MAX_SPEED: 5, // Maximum speed (minimum frames per movement)
    SPEED_INCREMENT: 0.05, // How much speed increases per fragment collected
    BOOST_SPEED_MULTIPLIER: 2.5, // Speed multiplier when space is pressed (Adjusted from 2)
    INITIAL_LENGTH: 5, // Starting length of serpent
    FRAGMENT_TYPES: ['circle', 'square', 'triangle'], // Different fragment shapes
    STORAGE_KEY: 'voidSerpentHighScore',

    // Visual settings
    VISUAL: {
        MAIN_COLOR: '#FFFFFF',
        BACKGROUND_COLOR: '#000000',
        TRANSITION_SPEED: 0.3, // seconds
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
    isPlaying: false,
    isPaused: false,
    score: 0,
    highScore: 0,

    // Serpent state
    serpent: [],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },

    // Fragment state
    fragment: { x: 0, y: 0, type: 'circle' },

    // Animation and timing
    framesPerMovement: CONFIG.INITIAL_SPEED,
    lastMoveTime: 0,
    animationFrameId: null,
    gameTime: 0,

    // Visual effects
    shakeEffect: false,
    shakeTime: 0,
    pulseEffect: false,
    pulseTime: 0,
    pulseRadius: 0,
    trail: [],

    // Input tracking
    keys: {
        left: false,
        right: false,
        up: false,
        down: false,
        space: false // Track space key state
    }
};

// ==========================================
// DOM elements
// ==========================================
let canvas, ctx;
let helpButton, helpPanel, closeHelp;
let pauseOverlay, gameOverOverlay;
let scoreDisplay, highScoreDisplay;
let errorOverlay, livesContainer;

// ==========================================
// Initialization
// ==========================================
function initGame() {
    try {
        // Get DOM elements
        canvas = document.getElementById('game-canvas');
        ctx = canvas.getContext('2d');

        helpButton = document.getElementById('help-button');
        helpPanel = document.getElementById('help-panel');
        closeHelp = document.getElementById('close-help');

        pauseOverlay = document.getElementById('pause-overlay');
        gameOverOverlay = document.getElementById('game-over');

        scoreDisplay = document.getElementById('score-display');
        highScoreDisplay = document.getElementById('high-score-display');

        errorOverlay = document.getElementById('error-overlay');
        livesContainer = document.getElementById('lives-container');

        // Set canvas size to match window
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Load high score from localStorage
        gameState.highScore = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;
        updateScoreDisplay();

        // Add event listeners
        addEventListeners();

        // Reset game to initial state
        resetGame();

        // Start game loop
        gameLoop(performance.now());

        // Set up error handling
        window.addEventListener('error', event => handleError('Game error:', event.error));
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

function addEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup); // Add keyup listener

    // Help button toggle
    helpButton.addEventListener('click', toggleHelpPanel);
    closeHelp.addEventListener('click', toggleHelpPanel);

    // Restart button
    document.getElementById('restart-button').addEventListener('click', startGame);
}

// ==========================================
// UI functions
// ==========================================
function toggleHelpPanel() {
    helpPanel.classList.toggle('hidden');
}

function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    gameState.state = gameState.isPaused ? CONFIG.GAME_STATE.PAUSED : CONFIG.GAME_STATE.PLAYING;
    pauseOverlay.classList.toggle('hidden', !gameState.isPaused);
}

function updateScoreDisplay() {
    scoreDisplay.textContent = gameState.score;
    highScoreDisplay.textContent = gameState.highScore;
}

// ==========================================
// Game state functions
// ==========================================
function resetGame() {
    // Clear serpent array
    gameState.serpent = [];

    // Create initial serpent in the middle of the screen
    const centerX = Math.floor(canvas.width / (2 * CONFIG.GRID_SIZE));
    const centerY = Math.floor(canvas.height / (2 * CONFIG.GRID_SIZE));

    for (let i = 0; i < CONFIG.INITIAL_LENGTH; i++) {
        gameState.serpent.unshift({ x: centerX - i, y: centerY });
    }

    // Reset game variables
    gameState.direction = { x: 1, y: 0 };
    gameState.nextDirection = { x: 1, y: 0 };
    gameState.framesPerMovement = CONFIG.INITIAL_SPEED;
    gameState.score = 0;
    gameState.gameTime = 0;
    gameState.trail = [];
    gameState.state = CONFIG.GAME_STATE.INTRO;
    gameState.isPlaying = false;
    gameState.isPaused = false;

    // Create initial fragment
    createFragment();

    // Update score display
    updateScoreDisplay();
}

function startGame() {
    resetGame();
    gameState.state = CONFIG.GAME_STATE.PLAYING;
    gameState.isPlaying = true;

    // Hide overlays
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
}

function gameOver() {
    gameState.state = CONFIG.GAME_STATE.GAME_OVER;
    gameState.isPlaying = false;

    // Update high score if needed
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem(CONFIG.STORAGE_KEY, gameState.highScore);
        updateScoreDisplay();
    }

    // Show game over overlay
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('high-score').textContent = gameState.highScore;
    gameOverOverlay.classList.remove('hidden'); // Restore this line
}

// ==========================================
// Input handlers
// ==========================================
function handleKeydown(e) {
    // Title screen - start game with any directional key
    if (!gameState.isPlaying) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            gameState.isPlaying = true;
            gameState.state = CONFIG.GAME_STATE.PLAYING;
        }
    }

    // Handle directional input based on key
    switch (e.key) {
        case 'ArrowUp':
            if (gameState.direction.y !== 1) { // Prevent 180 degree turns
                gameState.nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'ArrowDown':
            if (gameState.direction.y !== -1) {
                gameState.nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'ArrowLeft':
            if (gameState.direction.x !== 1) {
                gameState.nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'ArrowRight':
            if (gameState.direction.x !== -1) {
                gameState.nextDirection = { x: 1, y: 0 };
            }
            break;
        case ' ': // Space key
            if (gameState.state === CONFIG.GAME_STATE.PLAYING && !gameState.isPaused) {
                gameState.keys.space = true;
            }
            break;
        case 'Escape':
            // Toggle pause state
            togglePause();
            break;
        case 'q':
        case 'Q':
            // Exit to landing page
            window.location.href = '../../index.html';
            break;
        case 'r':
        case 'R':
            // Restart game (hidden feature)
            if (!gameState.isPlaying) {
                startGame();
            }
            break;
    }
}

// Add a handler for keyup events
function handleKeyup(e) {
    switch (e.key) {
        case ' ': // Space key
            gameState.keys.space = false;
            break;
    }
}

// ==========================================
// Game mechanics
// ==========================================
function createFragment() {
    // Calculate grid dimensions
    const gridWidth = Math.floor(canvas.width / CONFIG.GRID_SIZE);
    const gridHeight = Math.floor(canvas.height / CONFIG.GRID_SIZE);

    // Generate random position ensuring it's not on the serpent
    let newPos;
    do {
        newPos = {
            x: Math.floor(Math.random() * (gridWidth - 2)) + 1,
            y: Math.floor(Math.random() * (gridHeight - 2)) + 1
        };
    } while (isPositionOnSerpent(newPos));

    // Select random fragment type
    const randomType = CONFIG.FRAGMENT_TYPES[Math.floor(Math.random() * CONFIG.FRAGMENT_TYPES.length)];

    // Set new fragment
    gameState.fragment = {
        x: newPos.x,
        y: newPos.y,
        type: randomType
    };

    // Trigger pulse effect
    gameState.pulseEffect = true;
    gameState.pulseTime = 0;
    gameState.pulseRadius = 0;
}

function isPositionOnSerpent(pos) {
    return gameState.serpent.some(segment => segment.x === pos.x && segment.y === pos.y);
}

// ==========================================
// Update and render
// ==========================================
function update(timestamp) {
    // Increment game time
    gameState.gameTime += 1;

    // Only update game logic if playing and not paused
    if (gameState.state !== CONFIG.GAME_STATE.PLAYING || gameState.isPaused) return;

    // Determine current speed based on space key state
    const currentFramesPerMovement = gameState.keys.space
        ? Math.max(1, gameState.framesPerMovement / CONFIG.BOOST_SPEED_MULTIPLIER) // Ensure speed doesn't go below 1 frame
        : gameState.framesPerMovement;

    // Update movement based on frames
    if (timestamp - gameState.lastMoveTime > (1000 / 60) * currentFramesPerMovement) {
        gameState.lastMoveTime = timestamp;

        // Apply nextDirection to current direction
        gameState.direction = { ...gameState.nextDirection };

        // Calculate new head position
        const head = { ...gameState.serpent[0] };
        head.x += gameState.direction.x;
        head.y += gameState.direction.y;

        // Add current head to trail for motion effect
        if (gameState.gameTime % 2 === 0) {
            gameState.trail.push({
                x: gameState.serpent[0].x,
                y: gameState.serpent[0].y,
                age: 0
            });
        }

        // Age and remove old trail segments
        gameState.trail.forEach(segment => segment.age++);
        gameState.trail = gameState.trail.filter(segment => segment.age < 10);

        // Check for collision with walls
        const gridWidth = Math.floor(canvas.width / CONFIG.GRID_SIZE);
        const gridHeight = Math.floor(canvas.height / CONFIG.GRID_SIZE);

        if (head.x < 0 || head.y < 0 || head.x >= gridWidth || head.y >= gridHeight) {
            handleCollision();
            return;
        }

        // Check for collision with self (except when just starting)
        if (gameState.serpent.length > CONFIG.INITIAL_LENGTH) {
            for (let i = 0; i < gameState.serpent.length; i++) {
                if (gameState.serpent[i].x === head.x && gameState.serpent[i].y === head.y) {
                    handleCollision();
                    return;
                }
            }
        }

        // Check for fragment collection
        if (head.x === gameState.fragment.x && head.y === gameState.fragment.y) {
            // Increase score
            gameState.score++;
            updateScoreDisplay();

            // Create new fragment
            createFragment();

            // Increase speed
            gameState.framesPerMovement = Math.max(CONFIG.MAX_SPEED, gameState.framesPerMovement - CONFIG.SPEED_INCREMENT);
        } else {
            // Remove tail segment if no fragment was collected
            gameState.serpent.pop();
        }

        // Add new head
        gameState.serpent.unshift(head);
    }

    // Update pulse effect
    if (gameState.pulseEffect) {
        gameState.pulseTime += 1;
        gameState.pulseRadius = 30 * Math.sin(gameState.pulseTime * 0.1);

        if (gameState.pulseTime > 30) {
            gameState.pulseEffect = false;
        }
    }

    // Update shake effect
    if (gameState.shakeEffect) {
        gameState.shakeTime += 1;

        if (gameState.shakeTime > 30) {
            gameState.shakeEffect = false;
            gameState.shakeTime = 0;
        }
    }
}

function handleCollision() {
    gameState.shakeEffect = true;
    gameOver();
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply shake effect if active
    if (gameState.shakeEffect) {
        const shakeIntensity = 5;
        const shakeX = Math.random() * shakeIntensity * 2 - shakeIntensity;
        const shakeY = Math.random() * shakeIntensity * 2 - shakeIntensity;
        ctx.save();
        ctx.translate(shakeX, shakeY);
    }

    // Draw based on game state
    switch (gameState.state) {
        case CONFIG.GAME_STATE.INTRO:
        case CONFIG.GAME_STATE.PLAYING:
        case CONFIG.GAME_STATE.PAUSED:
            renderGame();
            break;
        case CONFIG.GAME_STATE.GAME_OVER:
            renderGame(); // Still show final state
            break;
    }

    // Reset transformation if shake was applied
    if (gameState.shakeEffect) {
        ctx.restore();
    }
}

function renderGame() {
    // Draw trails
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    gameState.trail.forEach(segment => {
        const alpha = 0.3 - (segment.age / 10) * 0.3;
        ctx.globalAlpha = alpha;
        ctx.fillRect(
            segment.x * CONFIG.GRID_SIZE,
            segment.y * CONFIG.GRID_SIZE,
            CONFIG.GRID_SIZE,
            CONFIG.GRID_SIZE
        );
    });
    ctx.globalAlpha = 1;

    // Draw serpent
    ctx.fillStyle = CONFIG.VISUAL.MAIN_COLOR;
    gameState.serpent.forEach((segment, index) => {
        // Apply gradient to serpent segments - head is brightest
        const brightness = 255 - (index * 5);
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;

        ctx.fillRect(
            segment.x * CONFIG.GRID_SIZE,
            segment.y * CONFIG.GRID_SIZE,
            CONFIG.GRID_SIZE,
            CONFIG.GRID_SIZE
        );
    });

    // Draw fragment based on its type
    ctx.fillStyle = CONFIG.VISUAL.MAIN_COLOR;
    const fragmentX = gameState.fragment.x * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;
    const fragmentY = gameState.fragment.y * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;
    const fragmentSize = CONFIG.GRID_SIZE * 0.7;

    // Draw pulse effect if active
    if (gameState.pulseEffect) {
        ctx.beginPath();
        ctx.arc(fragmentX, fragmentY, gameState.pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
    }

    // Draw fragment based on type
    ctx.fillStyle = CONFIG.VISUAL.MAIN_COLOR;
    renderFragment(fragmentX, fragmentY, fragmentSize);
}

function renderFragment(x, y, size) {
    switch (gameState.fragment.type) {
        case 'circle':
            ctx.beginPath();
            ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'square':
            ctx.fillRect(
                gameState.fragment.x * CONFIG.GRID_SIZE + (CONFIG.GRID_SIZE - size) / 2,
                gameState.fragment.y * CONFIG.GRID_SIZE + (CONFIG.GRID_SIZE - size) / 2,
                size,
                size
            );
            break;
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(x, gameState.fragment.y * CONFIG.GRID_SIZE + (CONFIG.GRID_SIZE - size) / 2);
            ctx.lineTo(gameState.fragment.x * CONFIG.GRID_SIZE + (CONFIG.GRID_SIZE - size) / 2,
                gameState.fragment.y * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE - (CONFIG.GRID_SIZE - size) / 2);
            ctx.lineTo(gameState.fragment.x * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE - (CONFIG.GRID_SIZE - size) / 2,
                gameState.fragment.y * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE - (CONFIG.GRID_SIZE - size) / 2);
            ctx.closePath();
            ctx.fill();
            break;
    }
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
// Game loop
// ==========================================
function gameLoop(timestamp) {
    try {
        update(timestamp);
        draw();
        gameState.animationFrameId = requestAnimationFrame(gameLoop);
    } catch (error) {
        handleError('Game loop error:', error);
    }
}

// ==========================================
// Initialization
// ==========================================
window.addEventListener('DOMContentLoaded', initGame);
