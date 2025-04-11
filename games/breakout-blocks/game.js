/**
 * Breakout Blocks - Minimalist Arcade Game
 * A classic brick-breaking game with keyboard controls
 */

// ==========================================
// Game constants
// ==========================================
const CONFIG = {
    // Game settings
    INITIAL_LIVES: 3,
    STORAGE_KEY: 'breakoutBlocksHighScore',

    // Visual settings
    VISUAL: {
        MAIN_COLOR: '#FFFFFF',
        SECONDARY_COLOR: '#999999',
        TRANSITION_SPEED: 0.3, // seconds
    },

    // Physics/gameplay constants
    PHYSICS: {
        PADDLE_HEIGHT: 10,
        PADDLE_WIDTH: 75,
        BALL_RADIUS: 8,
        BALL_SPEED: 4,
        PADDLE_SPEED: 7,
    },

    // Brick layout
    BRICKS: {
        ROW_COUNT: 4,
        COLUMN_COUNT: 8,
        WIDTH: 65,
        HEIGHT: 20,
        PADDING: 10,
        OFFSET_TOP: 30,
        OFFSET_LEFT: 30,
        COLORS: [
            '#FFFFFF', // White for top row
            '#CCCCCC', // Light gray
            '#999999', // Medium gray
            '#666666'  // Dark gray for bottom row
        ]
    },

    // Various states the game can be in
    GAME_STATE: {
        INTRO: 'intro',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameover',
        WIN: 'win',
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

    // Animation and timing
    lastTime: 0,
    delta: 0,
    animationFrameId: null,
    timers: [],

    // Input state
    keys: {
        left: false,
        right: false
    },

    // Game-specific state variables
    paddle: {
        x: 0
    },
    ball: {
        x: 0,
        y: 0,
        dx: 0,
        dy: 0
    },
    bricks: []
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
        canvas = document.getElementById('gameCanvas');
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
        gameState.highScore = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;

        // Create lives indicators
        createLivesIndicators();

        // Add event listeners
        addEventListeners();

        // Initialize game-specific elements
        initializeGameElements();

        // Start the game
        startGame();

    } catch (error) {
        handleError('Game initialization error:', error);
    }
}

// ==========================================
// Setup functions
// ==========================================
function createLivesIndicators() {
    livesContainer.innerHTML = '';
    for (let i = 0; i < CONFIG.INITIAL_LIVES; i++) {
        const life = document.createElement('div');
        life.className = 'life';
        livesContainer.appendChild(life);
    }
}

function addEventListeners() {
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

function initializeGameElements() {
    // Initialize brick array
    initBricks();
}

function initBricks() {
    gameState.bricks = [];
    for (let c = 0; c < CONFIG.BRICKS.COLUMN_COUNT; c++) {
        gameState.bricks[c] = [];
        for (let r = 0; r < CONFIG.BRICKS.ROW_COUNT; r++) {
            const brickX = c * (CONFIG.BRICKS.WIDTH + CONFIG.BRICKS.PADDING) + CONFIG.BRICKS.OFFSET_LEFT;
            const brickY = r * (CONFIG.BRICKS.HEIGHT + CONFIG.BRICKS.PADDING) + CONFIG.BRICKS.OFFSET_TOP;

            gameState.bricks[c][r] = {
                x: brickX,
                y: brickY,
                status: 1,
                color: CONFIG.BRICKS.COLORS[r],
                points: (CONFIG.BRICKS.ROW_COUNT - r) * 10 // Higher rows worth more points
            };
        }
    }
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
function startGame() {
    // Reset game state
    gameState.state = CONFIG.GAME_STATE.PLAYING;
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.lives = CONFIG.INITIAL_LIVES;

    // Reset paddle and ball
    resetGameState();

    // Initialize bricks
    initBricks();

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
    // Reset paddle
    gameState.paddle.x = (canvas.width - CONFIG.PHYSICS.PADDLE_WIDTH) / 2;

    // Reset ball
    resetBall();
}

function resetBall() {
    gameState.ball.x = canvas.width / 2;
    gameState.ball.y = canvas.height - 30;
    // Random horizontal direction, always upward
    gameState.ball.dx = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2);
    gameState.ball.dy = -CONFIG.PHYSICS.BALL_SPEED;
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

function gameWin() {
    gameState.state = CONFIG.GAME_STATE.WIN;
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
// Input handlers
// ==========================================
function handleKeyDown(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        gameState.keys.right = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        gameState.keys.left = true;
    } else if (e.key === 'Escape') {
        togglePause();
    } else if (e.key === 'q' || e.key === 'Q') {
        navigateToLanding();
    }
}

function handleKeyUp(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        gameState.keys.right = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        gameState.keys.left = false;
    }
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
        update(gameState.delta / 16.67); // Normalize to 60FPS

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
function update(deltaMultiplier) {
    // Move paddle based on key state
    if (gameState.keys.right && gameState.paddle.x < canvas.width - CONFIG.PHYSICS.PADDLE_WIDTH) {
        gameState.paddle.x += CONFIG.PHYSICS.PADDLE_SPEED * deltaMultiplier;
    } else if (gameState.keys.left && gameState.paddle.x > 0) {
        gameState.paddle.x -= CONFIG.PHYSICS.PADDLE_SPEED * deltaMultiplier;
    }

    // Keep paddle within bounds
    gameState.paddle.x = Math.max(0, Math.min(canvas.width - CONFIG.PHYSICS.PADDLE_WIDTH, gameState.paddle.x));

    // Move ball
    gameState.ball.x += gameState.ball.dx * deltaMultiplier;
    gameState.ball.y += gameState.ball.dy * deltaMultiplier;

    // Ball collision with walls
    if (gameState.ball.x + gameState.ball.dx > canvas.width - CONFIG.PHYSICS.BALL_RADIUS ||
        gameState.ball.x + gameState.ball.dx < CONFIG.PHYSICS.BALL_RADIUS) {
        gameState.ball.dx = -gameState.ball.dx;
    }

    // Ball collision with top
    if (gameState.ball.y + gameState.ball.dy < CONFIG.PHYSICS.BALL_RADIUS) {
        gameState.ball.dy = -gameState.ball.dy;
    }

    // Ball collision with bottom
    if (gameState.ball.y + gameState.ball.dy > canvas.height - CONFIG.PHYSICS.BALL_RADIUS) {
        // Check if ball hits paddle
        if (gameState.ball.x > gameState.paddle.x &&
            gameState.ball.x < gameState.paddle.x + CONFIG.PHYSICS.PADDLE_WIDTH) {
            // Calculate hit position on paddle (0 to 1)
            const hitPosition = (gameState.ball.x - gameState.paddle.x) / CONFIG.PHYSICS.PADDLE_WIDTH;

            // Adjust ball direction based on where it hit the paddle
            gameState.ball.dx = CONFIG.PHYSICS.BALL_SPEED * (hitPosition - 0.5) * 2;
            gameState.ball.dy = -Math.abs(gameState.ball.dy); // Always go up
        } else {
            // Ball missed paddle
            gameState.lives--;
            updateLivesDisplay();

            if (gameState.lives <= 0) {
                gameOver();
            } else {
                resetBall();
            }
        }
    }

    // Ball collision with bricks
    checkBrickCollisions();
}

function checkBrickCollisions() {
    for (let c = 0; c < CONFIG.BRICKS.COLUMN_COUNT; c++) {
        for (let r = 0; r < CONFIG.BRICKS.ROW_COUNT; r++) {
            const brick = gameState.bricks[c][r];

            if (brick.status === 1) {
                // Check if ball is inside brick boundaries
                if (gameState.ball.x > brick.x &&
                    gameState.ball.x < brick.x + CONFIG.BRICKS.WIDTH &&
                    gameState.ball.y > brick.y &&
                    gameState.ball.y < brick.y + CONFIG.BRICKS.HEIGHT) {

                    gameState.ball.dy = -gameState.ball.dy; // Reverse ball direction
                    brick.status = 0; // Brick is hit

                    // Update score
                    gameState.score += brick.points;
                    scoreDisplay.textContent = gameState.score;

                    // Check if all bricks are gone
                    checkWinCondition();
                }
            }
        }
    }
}

function checkWinCondition() {
    let bricksRemaining = 0;

    for (let c = 0; c < CONFIG.BRICKS.COLUMN_COUNT; c++) {
        for (let r = 0; r < CONFIG.BRICKS.ROW_COUNT; r++) {
            if (gameState.bricks[c][r].status === 1) {
                bricksRemaining++;
            }
        }
    }

    if (bricksRemaining === 0) {
        gameWin();
    }
}

function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawBricks();
    drawPaddle();
    drawBall();
}

function drawBricks() {
    for (let c = 0; c < CONFIG.BRICKS.COLUMN_COUNT; c++) {
        for (let r = 0; r < CONFIG.BRICKS.ROW_COUNT; r++) {
            if (gameState.bricks[c][r].status === 1) {
                const brick = gameState.bricks[c][r];
                drawBrick(brick);
            }
        }
    }
}

function drawBrick(brick) {
    ctx.beginPath();
    ctx.rect(brick.x, brick.y, CONFIG.BRICKS.WIDTH, CONFIG.BRICKS.HEIGHT);
    ctx.fillStyle = brick.color;
    ctx.fill();
    ctx.closePath();

    // Add subtle glow effect
    ctx.shadowBlur = 5;
    ctx.shadowColor = brick.color;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(gameState.paddle.x, canvas.height - CONFIG.PHYSICS.PADDLE_HEIGHT,
        CONFIG.PHYSICS.PADDLE_WIDTH, CONFIG.PHYSICS.PADDLE_HEIGHT);
    ctx.fillStyle = CONFIG.VISUAL.MAIN_COLOR;
    ctx.fill();
    ctx.closePath();

    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = CONFIG.VISUAL.MAIN_COLOR;
    ctx.strokeStyle = CONFIG.VISUAL.MAIN_COLOR;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, CONFIG.PHYSICS.BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.VISUAL.MAIN_COLOR;
    ctx.fill();
    ctx.closePath();

    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = CONFIG.VISUAL.MAIN_COLOR;
    ctx.strokeStyle = CONFIG.VISUAL.MAIN_COLOR;
    ctx.stroke();
    ctx.shadowBlur = 0;
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
