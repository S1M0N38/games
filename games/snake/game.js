// Game Configuration
const config = {
    gridSize: 20,          // Size of each grid cell in pixels
    initialSpeed: 150,     // Initial time delay between moves in milliseconds
    speedIncrease: 5,      // Decrease in ms per food eaten
    minSpeed: 50,          // Minimum delay in ms (maximum speed)
    foodValue: 10          // Points earned per food
};

// Game Variables
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameInterval;
let isPaused = false;
let isGameOver = false;

// DOM Elements
let scoreElement, highScoreElement, finalScoreElement;
let startButton, pauseButton, restartButton;
let gameOverOverlay;

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    // Get canvas and context
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    // Get DOM elements
    scoreElement = document.getElementById('score');
    highScoreElement = document.getElementById('high-score');
    finalScoreElement = document.getElementById('final-score');
    startButton = document.getElementById('start-btn');
    pauseButton = document.getElementById('pause-btn');
    restartButton = document.getElementById('restart-btn');
    gameOverOverlay = document.getElementById('game-over');

    // Set initial high score display
    highScoreElement.textContent = highScore;

    // Event listeners
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', togglePause);
    restartButton.addEventListener('click', () => {
        gameOverOverlay.classList.add('hidden');
        startGame();
    });

    document.addEventListener('keydown', handleKeyPress);

    // Draw initial canvas
    drawBoard();
});

// Start a new game
function startGame() {
    // Reset game state
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    isGameOver = false;
    isPaused = false;

    // Clear any existing interval
    if (gameInterval) {
        clearInterval(gameInterval);
    }

    // Update score display
    scoreElement.textContent = score;

    // Generate first food
    generateFood();

    // Start game loop
    gameInterval = setInterval(gameLoop, config.initialSpeed);

    // Update button states
    startButton.disabled = true;
    pauseButton.disabled = false;
}

// Game loop - called on each tick
function gameLoop() {
    if (isPaused || isGameOver) return;

    // Move the snake
    moveSnake();

    // Check for collisions
    if (checkCollision()) {
        gameOver();
        return;
    }

    // Check if food is eaten
    if (eatFood()) {
        // Grow snake - handled in eatFood()
        // Generate new food
        generateFood();
        // Update score
        score += config.foodValue;
        scoreElement.textContent = score;

        // Check for high score
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }

        // Increase speed if not at max
        let currentSpeed = config.initialSpeed - Math.floor(score / config.foodValue) * config.speedIncrease;
        if (currentSpeed < config.minSpeed) {
            currentSpeed = config.minSpeed;
        }

        // Reset interval with new speed
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, currentSpeed);
    }

    // Draw updated game state
    drawBoard();
    drawSnake();
    drawFood();
}

// Move the snake in the current direction
function moveSnake() {
    // Update direction from nextDirection
    direction = nextDirection;

    // Calculate new head position
    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    // Add new head to beginning of snake array
    snake.unshift(head);

    // Remove tail (unless food was eaten, which is handled in eatFood())
    if (!eatFood()) {
        snake.pop();
    }
}

// Check for collisions with walls or self
function checkCollision() {
    const head = snake[0];

    // Check wall collisions
    if (
        head.x < 0 ||
        head.x >= canvas.width / config.gridSize ||
        head.y < 0 ||
        head.y >= canvas.height / config.gridSize
    ) {
        return true;
    }

    // Check self-collision (start from index 1 to skip the head)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

// Check if snake head is on food
function eatFood() {
    const head = snake[0];

    if (head.x === food.x && head.y === food.y) {
        return true;
    }

    // If not on food, remove the last segment
    return false;
}

// Generate a new food at a random position
function generateFood() {
    // Get available positions (not occupied by snake)
    const availablePositions = [];
    const gridWidth = canvas.width / config.gridSize;
    const gridHeight = canvas.height / config.gridSize;

    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            // Check if position is occupied by snake
            let isOccupied = false;
            for (const segment of snake) {
                if (segment.x === x && segment.y === y) {
                    isOccupied = true;
                    break;
                }
            }

            if (!isOccupied) {
                availablePositions.push({ x, y });
            }
        }
    }

    // Choose a random position
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    food = availablePositions[randomIndex];
}

// Handle game over
function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);

    // Update final score
    finalScoreElement.textContent = score;

    // Show game over overlay
    gameOverOverlay.classList.remove('hidden');

    // Reset button states
    startButton.disabled = false;
    pauseButton.disabled = true;
}

// Toggle pause state
function togglePause() {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
}

// Draw the game board
function drawBoard() {
    // Clear canvas
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines (optional)
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= canvas.width; x += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += config.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Draw the snake
function drawSnake() {
    snake.forEach((segment, index) => {
        // Snake head is a different color
        if (index === 0) {
            ctx.fillStyle = '#e74c3c'; // Red for head
        } else {
            // Gradient from dark to light green for body
            const colorValue = Math.max(60, 120 - index * 2);
            ctx.fillStyle = `rgb(46, ${colorValue}, 64)`;
        }

        // Draw segment
        ctx.fillRect(
            segment.x * config.gridSize,
            segment.y * config.gridSize,
            config.gridSize,
            config.gridSize
        );

        // Add a border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            segment.x * config.gridSize,
            segment.y * config.gridSize,
            config.gridSize,
            config.gridSize
        );
    });
}

// Draw the food
function drawFood() {
    ctx.fillStyle = '#3498db'; // Blue

    // Draw a circular food
    const centerX = food.x * config.gridSize + config.gridSize / 2;
    const centerY = food.y * config.gridSize + config.gridSize / 2;
    const radius = config.gridSize / 2 - 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Add a highlight effect
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(
        centerX - radius / 3,
        centerY - radius / 3,
        radius / 4,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Handle keyboard input
function handleKeyPress(event) {
    // Update direction based on key press
    // Don't allow 180-degree turns (e.g., right to left)
    switch (event.key) {
        case 'ArrowUp':
            if (direction !== 'down') {
                nextDirection = 'up';
            }
            event.preventDefault();
            break;
        case 'ArrowDown':
            if (direction !== 'up') {
                nextDirection = 'down';
            }
            event.preventDefault();
            break;
        case 'ArrowLeft':
            if (direction !== 'right') {
                nextDirection = 'left';
            }
            event.preventDefault();
            break;
        case 'ArrowRight':
            if (direction !== 'left') {
                nextDirection = 'right';
            }
            event.preventDefault();
            break;
        case ' ': // Spacebar
            togglePause();
            event.preventDefault();
            break;
        case 'Enter':
            if (isGameOver) {
                gameOverOverlay.classList.add('hidden');
                startGame();
            }
            event.preventDefault();
            break;
    }
}