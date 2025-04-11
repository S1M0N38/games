// Game constants
const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 75;
const BALL_RADIUS = 8;
const BRICK_ROW_COUNT = 4;
const BRICK_COLUMN_COUNT = 8;
const BRICK_WIDTH = 65;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 30;
const BALL_SPEED = 4;
const PADDLE_SPEED = 7;
const INITIAL_LIVES = 3;

// Game state
const gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    lives: INITIAL_LIVES,
    highScore: 0,
    timers: [],
    lastTime: 0,
    delta: 0
};

// Ball and paddle positions
let paddleX = 0;
let ballX = 0;
let ballY = 0;
let ballDX = 0;
let ballDY = 0;
let rightPressed = false;
let leftPressed = false;
let bricks = [];

// Brick grayscale colors (from light to dark)
const brickColors = [
    '#FFFFFF', // White for top row
    '#CCCCCC', // Light gray
    '#999999', // Medium gray
    '#666666'  // Dark gray for bottom row
];

// DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const livesContainer = document.getElementById('lives-container');
const helpButton = document.getElementById('help-button');
const helpPanel = document.getElementById('help-panel');
const closeHelp = document.getElementById('close-help');
const pauseOverlay = document.getElementById('pause-overlay');
const gameOverOverlay = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const highScoreDisplay = document.getElementById('high-score');
const restartButton = document.getElementById('restart-button');
const errorOverlay = document.getElementById('error-overlay');

// Initialize game
function initGame() {
    try {
        // Load high score from localStorage
        gameState.highScore = parseInt(localStorage.getItem('breakoutBlocksHighScore')) || 0;

        // Create lives indicators
        createLivesIndicators();

        // Add event listeners
        addEventListeners();

        // Start the game
        startGame();
    } catch (error) {
        showErrorOverlay();
        console.error('Game initialization error:', error);
    }
}

// Create lives indicators
function createLivesIndicators() {
    livesContainer.innerHTML = '';
    for (let i = 0; i < INITIAL_LIVES; i++) {
        const life = document.createElement('div');
        life.className = 'life';
        livesContainer.appendChild(life);
    }
}

// Initialize brick array
function initBricks() {
    bricks = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        bricks[c] = [];
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
            const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;

            bricks[c][r] = {
                x: brickX,
                y: brickY,
                status: 1,
                color: brickColors[r],
                points: (BRICK_ROW_COUNT - r) * 10 // Higher rows worth more points
            };
        }
    }
}

// Add event listeners
function addEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    // Help button toggle
    helpButton.addEventListener('click', toggleHelpPanel);
    closeHelp.addEventListener('click', toggleHelpPanel);

    // Restart button
    restartButton.addEventListener('click', startGame);
}

// Toggle help panel
function toggleHelpPanel() {
    helpPanel.classList.toggle('hidden');
}

// Handle key down
function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (e.key === 'Escape') {
        togglePause();
    } else if (e.key === 'q' || e.key === 'Q') {
        navigateToLanding();
    }
}

// Handle key up
function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
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
        // Resume the game loop with the current time
        gameState.lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
}

// Start game
function startGame() {
    // Reset game state
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.lives = INITIAL_LIVES;

    // Reset ball and paddle
    paddleX = (canvas.width - PADDLE_WIDTH) / 2;
    resetBall();

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
    requestAnimationFrame(gameLoop);
}

// Reset the ball position
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    // Random horizontal direction, always upward
    ballDX = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2);
    ballDY = -BALL_SPEED;
}

// Game loop using requestAnimationFrame
function gameLoop(timestamp) {
    if (!gameState.isPlaying) return;
    if (gameState.isPaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    // Calculate delta time
    gameState.delta = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update game state
    update(gameState.delta / 16.67); // Normalize to 60FPS

    // Draw game elements
    draw();

    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Update game state
function update(deltaMultiplier) {
    // Move paddle
    if (rightPressed && paddleX < canvas.width - PADDLE_WIDTH) {
        paddleX += PADDLE_SPEED * deltaMultiplier;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= PADDLE_SPEED * deltaMultiplier;
    }

    // Keep paddle within bounds
    paddleX = Math.max(0, Math.min(canvas.width - PADDLE_WIDTH, paddleX));

    // Move ball
    ballX += ballDX * deltaMultiplier;
    ballY += ballDY * deltaMultiplier;

    // Ball collision with walls
    if (ballX + ballDX > canvas.width - BALL_RADIUS || ballX + ballDX < BALL_RADIUS) {
        ballDX = -ballDX;
    }

    // Ball collision with top
    if (ballY + ballDY < BALL_RADIUS) {
        ballDY = -ballDY;
    }

    // Ball collision with bottom
    if (ballY + ballDY > canvas.height - BALL_RADIUS) {
        // Check if ball hits paddle
        if (ballX > paddleX && ballX < paddleX + PADDLE_WIDTH) {
            // Calculate hit position on paddle (0 to 1)
            const hitPosition = (ballX - paddleX) / PADDLE_WIDTH;

            // Adjust ball direction based on where it hit the paddle
            ballDX = BALL_SPEED * (hitPosition - 0.5) * 2;
            ballDY = -Math.abs(ballDY); // Always go up
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

// Check for collisions between ball and bricks
function checkBrickCollisions() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            const brick = bricks[c][r];

            if (brick.status === 1) {
                // Check if ball is inside brick boundaries
                if (ballX > brick.x &&
                    ballX < brick.x + BRICK_WIDTH &&
                    ballY > brick.y &&
                    ballY < brick.y + BRICK_HEIGHT) {

                    ballDY = -ballDY; // Reverse ball direction
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

// Check if all bricks are cleared
function checkWinCondition() {
    let bricksRemaining = 0;

    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            if (bricks[c][r].status === 1) {
                bricksRemaining++;
            }
        }
    }

    if (bricksRemaining === 0) {
        gameWin();
    }
}

// Win condition
function gameWin() {
    gameState.isPlaying = false;

    // Check for high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('breakoutBlocksHighScore', gameState.highScore);
    }

    // Update game over screen
    finalScoreDisplay.textContent = gameState.score;
    highScoreDisplay.textContent = gameState.highScore;

    // Show game over overlay
    gameOverOverlay.classList.remove('hidden');
}

// Game over
function gameOver() {
    gameState.isPlaying = false;

    // Check for high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('breakoutBlocksHighScore', gameState.highScore);
    }

    // Update game over screen
    finalScoreDisplay.textContent = gameState.score;
    highScoreDisplay.textContent = gameState.highScore;

    // Show game over overlay
    gameOverOverlay.classList.remove('hidden');
}

// Update lives display
function updateLivesDisplay() {
    const lifeElements = document.querySelectorAll('.life');
    lifeElements.forEach((life, index) => {
        life.classList.toggle('lost', index >= gameState.lives);
    });
}

// Draw game elements
function draw() {
    // Draw bricks
    drawBricks();

    // Draw paddle
    drawPaddle();

    // Draw ball
    drawBall();
}

// Draw all bricks
function drawBricks() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            if (bricks[c][r].status === 1) {
                const brick = bricks[c][r];
                drawBrick(brick);
            }
        }
    }
}

// Draw a single brick
function drawBrick(brick) {
    ctx.beginPath();
    ctx.rect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
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

// Draw the paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.closePath();

    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FFFFFF';
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// Draw the ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.closePath();

    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FFFFFF';
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
    ctx.shadowBlur = 0;
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
