/**
 * Space Dodger - A browser-based arcade game
 * 
 * Control a spaceship to dodge asteroids and collect power-ups
 * Use mouse movement to control the ship
 */

// Game Constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 30;
const ASTEROID_MIN_SIZE = 15;
const ASTEROID_MAX_SIZE = 40;
const ASTEROID_MIN_SPEED = 2;
const ASTEROID_MAX_SPEED = 5;
const ASTEROID_SPAWN_INTERVAL = 1000; // milliseconds
const POWERUP_SIZE = 25;
const POWERUP_SPAWN_CHANCE = 0.05; // 5% chance per asteroid spawn
const DIFFICULTY_INCREASE_INTERVAL = 10000; // 10 seconds
const DIFFICULTY_SPEED_MULTIPLIER = 0.2; // 20% faster each difficulty increase

// Game State
const gameState = {
    isActive: false,
    isPaused: false,
    score: 0,
    lives: 3,
    difficulty: 1,
    player: {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT - 100,
        size: PLAYER_SIZE,
        speed: 5,
        isShielded: false
    },
    asteroids: [],
    powerUps: [],
    activePowerUp: null,
    powerUpTimeRemaining: 0,
    lastAsteroidSpawn: 0,
    lastDifficultyIncrease: 0,
    animationFrameId: null,
    highScore: localStorage.getItem('spaceDodgerHighScore') || 0
};

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const livesDisplay = document.getElementById('lives');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('final-score');
const highScoreDisplay = document.getElementById('high-score');
const powerUpIndicator = document.getElementById('power-up-indicator');
const powerUpTypeDisplay = document.getElementById('power-up-type');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// Power-up types
const powerUpTypes = [
    { type: 'shield', color: '#00ff00', duration: 5000, effect: activateShield },
    { type: 'slow', color: '#0099ff', duration: 7000, effect: slowAsteroids },
    { type: 'points', color: '#ffff00', duration: 0, effect: addPoints }
];

// Event Listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
canvas.addEventListener('mousemove', movePlayer);
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

// Keyboard state tracking
const keyState = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false
};

// Keyboard handlers
function handleKeyDown(event) {
    if (keyState.hasOwnProperty(event.key)) {
        keyState[event.key] = true;
    }
    
    // Pause game with P or Escape key
    if ((event.key === 'p' || event.key === 'P' || event.key === 'Escape') && gameState.isActive) {
        togglePause();
    }
}

function handleKeyUp(event) {
    if (keyState.hasOwnProperty(event.key)) {
        keyState[event.key] = false;
    }
}

// Mouse movement handler
function movePlayer(event) {
    if (!gameState.isActive) return;
    
    // Get canvas bounds
    const rect = canvas.getBoundingClientRect();
    
    // Calculate relative mouse position within canvas
    gameState.player.x = Math.max(
        gameState.player.size / 2,
        Math.min(
            GAME_WIDTH - gameState.player.size / 2,
            event.clientX - rect.left
        )
    );
    
    gameState.player.y = Math.max(
        gameState.player.size / 2,
        Math.min(
            GAME_HEIGHT - gameState.player.size / 2,
            event.clientY - rect.top
        )
    );
}

// Process keyboard input
function processKeyboardInput(deltaTime) {
    if (!gameState.isActive) return;
    
    const moveSpeed = gameState.player.speed * deltaTime * 60;
    
    // Vertical movement
    if (keyState.ArrowUp || keyState.w) {
        gameState.player.y = Math.max(
            gameState.player.size / 2,
            gameState.player.y - moveSpeed
        );
    }
    if (keyState.ArrowDown || keyState.s) {
        gameState.player.y = Math.min(
            GAME_HEIGHT - gameState.player.size / 2,
            gameState.player.y + moveSpeed
        );
    }
    
    // Horizontal movement
    if (keyState.ArrowLeft || keyState.a) {
        gameState.player.x = Math.max(
            gameState.player.size / 2,
            gameState.player.x - moveSpeed
        );
    }
    if (keyState.ArrowRight || keyState.d) {
        gameState.player.x = Math.min(
            GAME_WIDTH - gameState.player.size / 2,
            gameState.player.x + moveSpeed
        );
    }
}

// Game initialization
function startGame() {
    // Reset game state
    gameState.isActive = true;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.difficulty = 1;
    gameState.asteroids = [];
    gameState.powerUps = [];
    gameState.activePowerUp = null;
    gameState.powerUpTimeRemaining = 0;
    gameState.lastAsteroidSpawn = 0;
    gameState.lastDifficultyIncrease = 0;
    
    // Reset player position
    gameState.player.x = GAME_WIDTH / 2;
    gameState.player.y = GAME_HEIGHT - 100;
    gameState.player.isShielded = false;
    
    // Update display
    updateDisplays();
    
    // Show game screen, hide other screens
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    powerUpIndicator.classList.add('hidden');
    
    // Start game loop
    if (gameState.animationFrameId) {
        cancelAnimationFrame(gameState.animationFrameId);
    }
    lastTimestamp = performance.now();
    gameLoop();
}

// Game over handling
function endGame() {
    gameState.isActive = false;
    
    // Check for high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('spaceDodgerHighScore', gameState.highScore);
    }
    
    // Update final score displays
    finalScoreDisplay.textContent = gameState.score;
    highScoreDisplay.textContent = gameState.highScore;
    
    // Show game over screen
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    
    // Cancel animation frame
    if (gameState.animationFrameId) {
        cancelAnimationFrame(gameState.animationFrameId);
        gameState.animationFrameId = null;
    }
}

// Update score, lives, and difficulty displays
function updateDisplays() {
    scoreDisplay.textContent = `Score: ${gameState.score}`;
    livesDisplay.textContent = `Lives: ${gameState.lives}`;
    document.getElementById('difficulty').textContent = `Difficulty: ${gameState.difficulty.toFixed(1)}`;
}

// Power-up effects
function activateShield() {
    gameState.player.isShielded = true;
    powerUpTypeDisplay.textContent = 'Shield';
    powerUpIndicator.classList.remove('hidden');
}

function slowAsteroids() {
    // Slow all existing asteroids by 50%
    gameState.asteroids.forEach(asteroid => {
        asteroid.speed *= 0.5;
    });
    powerUpTypeDisplay.textContent = 'Slow Time';
    powerUpIndicator.classList.remove('hidden');
}

function addPoints() {
    // Add bonus points
    const bonusPoints = 100 * gameState.difficulty;
    gameState.score += bonusPoints;
    updateDisplays();
    
    // Create a temporary indicator for bonus points
    const tempIndicator = document.createElement('div');
    tempIndicator.textContent = `+${bonusPoints}`;
    tempIndicator.style.position = 'absolute';
    tempIndicator.style.color = powerUpTypes[2].color;
    tempIndicator.style.fontSize = '24px';
    tempIndicator.style.fontWeight = 'bold';
    tempIndicator.style.top = '50%';
    tempIndicator.style.left = '50%';
    tempIndicator.style.transform = 'translate(-50%, -50%)';
    tempIndicator.style.opacity = '1';
    tempIndicator.style.transition = 'opacity 1s, transform 1s';
    gameScreen.appendChild(tempIndicator);
    
    // Animate and remove the indicator
    setTimeout(() => {
        tempIndicator.style.opacity = '0';
        tempIndicator.style.transform = 'translate(-50%, -100%)';
        setTimeout(() => {
            gameScreen.removeChild(tempIndicator);
        }, 1000);
    }, 100);
}

// Generate a random asteroid
function spawnAsteroid() {
    const size = Math.random() * (ASTEROID_MAX_SIZE - ASTEROID_MIN_SIZE) + ASTEROID_MIN_SIZE;
    const x = Math.random() * (GAME_WIDTH - size) + size / 2;
    const speedMultiplier = 1 + (gameState.difficulty - 1) * DIFFICULTY_SPEED_MULTIPLIER;
    const speed = (Math.random() * (ASTEROID_MAX_SPEED - ASTEROID_MIN_SPEED) + ASTEROID_MIN_SPEED) * speedMultiplier;
    
    // Random asteroid color variations
    const colorValue = Math.floor(Math.random() * 100) + 100;
    const color = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
    
    gameState.asteroids.push({
        x,
        y: -size, // Start above the screen
        size,
        speed,
        color
    });
    
    // Small chance to spawn a power-up with each asteroid
    if (Math.random() < POWERUP_SPAWN_CHANCE) {
        spawnPowerUp();
    }
}

// Generate a random power-up
function spawnPowerUp() {
    const powerUpIndex = Math.floor(Math.random() * powerUpTypes.length);
    const powerUpType = powerUpTypes[powerUpIndex];
    const x = Math.random() * (GAME_WIDTH - POWERUP_SIZE) + POWERUP_SIZE / 2;
    
    gameState.powerUps.push({
        x,
        y: -POWERUP_SIZE, // Start above the screen
        type: powerUpType.type,
        color: powerUpType.color,
        size: POWERUP_SIZE,
        speed: ASTEROID_MIN_SPEED, // Power-ups move slower than asteroids
        duration: powerUpType.duration,
        effect: powerUpType.effect
    });
}

// Check for collisions between two objects
function checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.size / 2 + obj2.size / 2);
}

// Handle player collision with asteroid
function handleAsteroidCollision() {
    if (gameState.player.isShielded) {
        gameState.player.isShielded = false;
        powerUpIndicator.classList.add('hidden');
        return false; // No life lost if shielded
    } else {
        gameState.lives--;
        updateDisplays();
        
        // Create explosion effect
        createExplosion(gameState.player.x, gameState.player.y);
        
        if (gameState.lives <= 0) {
            endGame();
            return true; // Game over
        }
        return false; // Game continues with fewer lives
    }
}

// Create particle explosion
function createExplosion(x, y) {
    const numParticles = 20;
    const particles = [];
    
    for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        const size = Math.random() * 6 + 2;
        const lifespan = 30; // frames
        
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: size,
            color: '#ff5500',
            life: lifespan
        });
    }
    
    // Animation loop for the explosion
    function animateExplosion() {
        // Clear the area for particles
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            // Fade out as life decreases
            const alpha = p.life / lifespan;
            ctx.globalAlpha = alpha;
            
            // Draw the particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            
            // Remove dead particles
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
        
        ctx.restore();
        
        // Continue animation if particles remain
        if (particles.length > 0 && gameState.isActive) {
            requestAnimationFrame(animateExplosion);
        }
    }
    
    animateExplosion();
}

// Main game loop
let lastTimestamp = 0;
function gameLoop(timestamp = 0) {
    // Calculate delta time in seconds
    const deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    
    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    if (gameState.isActive) {
        // Process keyboard input
        processKeyboardInput(deltaTime);
        
        // Increase score based on time survived
        gameState.score += Math.floor(deltaTime * 10);
        updateDisplays();
        
        // Spawn asteroids at intervals
        const currentTime = performance.now();
        if (currentTime - gameState.lastAsteroidSpawn > ASTEROID_SPAWN_INTERVAL / gameState.difficulty) {
            spawnAsteroid();
            gameState.lastAsteroidSpawn = currentTime;
        }
        
        // Increase difficulty over time
        if (currentTime - gameState.lastDifficultyIncrease > DIFFICULTY_INCREASE_INTERVAL) {
            gameState.difficulty += 0.2; // Gradual difficulty increase
            gameState.lastDifficultyIncrease = currentTime;
        }
        
        // Update active power-up timer
        if (gameState.activePowerUp && gameState.powerUpTimeRemaining > 0) {
            gameState.powerUpTimeRemaining -= deltaTime * 1000;
            
            // Power-up expired
            if (gameState.powerUpTimeRemaining <= 0) {
                if (gameState.activePowerUp.type === 'shield') {
                    gameState.player.isShielded = false;
                }
                gameState.activePowerUp = null;
                powerUpIndicator.classList.add('hidden');
            }
        }
        
        // Update and draw player
        drawPlayer();
        
        // Update and draw asteroids
        updateAsteroids(deltaTime);
        
        // Update and draw power-ups
        updatePowerUps(deltaTime);
        
        // Draw starfield background
        drawStarfield();
    }
    
    // Request next frame
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
}

// Draw the player spaceship
function drawPlayer() {
    ctx.save();
    
    // Draw the ship body
    ctx.beginPath();
    ctx.moveTo(gameState.player.x, gameState.player.y - gameState.player.size / 2);
    ctx.lineTo(gameState.player.x - gameState.player.size / 2, gameState.player.y + gameState.player.size / 2);
    ctx.lineTo(gameState.player.x + gameState.player.size / 2, gameState.player.y + gameState.player.size / 2);
    ctx.closePath();
    
    // Ship color and glow effect
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fill();
    
    // Draw engine thrust
    ctx.beginPath();
    ctx.moveTo(gameState.player.x - gameState.player.size / 4, gameState.player.y + gameState.player.size / 2);
    ctx.lineTo(gameState.player.x, gameState.player.y + gameState.player.size);
    ctx.lineTo(gameState.player.x + gameState.player.size / 4, gameState.player.y + gameState.player.size / 2);
    ctx.closePath();
    ctx.fillStyle = '#ff6600';
    ctx.shadowColor = '#ff6600';
    ctx.fill();
    
    // Draw shield if active
    if (gameState.player.isShielded) {
        ctx.beginPath();
        ctx.arc(gameState.player.x, gameState.player.y, gameState.player.size * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 15;
        ctx.stroke();
    }
    
    ctx.restore();
}

// Update asteroid positions and check collisions
function updateAsteroids(deltaTime) {
    for (let i = gameState.asteroids.length - 1; i >= 0; i--) {
        const asteroid = gameState.asteroids[i];
        
        // Update position
        asteroid.y += asteroid.speed * deltaTime * 60;
        
        // Remove if off-screen
        if (asteroid.y > GAME_HEIGHT + asteroid.size) {
            gameState.asteroids.splice(i, 1);
            continue;
        }
        
        // Check collision with player
        if (checkCollision(gameState.player, asteroid)) {
            // Handle collision and remove asteroid
            const gameOver = handleAsteroidCollision();
            gameState.asteroids.splice(i, 1);
            
            if (gameOver) return;
            continue;
        }
        
        // Draw asteroid
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = asteroid.color;
        ctx.fill();
        
        // Add crater details to asteroid
        const numCraters = Math.floor(asteroid.size / 10);
        for (let j = 0; j < numCraters; j++) {
            const craterSize = asteroid.size * 0.15;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * (asteroid.size / 2 - craterSize);
            const craterX = asteroid.x + Math.cos(angle) * distance;
            const craterY = asteroid.y + Math.sin(angle) * distance;
            
            ctx.beginPath();
            ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fill();
        }
    }
}

// Update power-up positions and check collisions
function updatePowerUps(deltaTime) {
    for (let i = gameState.powerUps.length - 1; i >= 0; i--) {
        const powerUp = gameState.powerUps[i];
        
        // Update position
        powerUp.y += powerUp.speed * deltaTime * 60;
        
        // Remove if off-screen
        if (powerUp.y > GAME_HEIGHT + powerUp.size) {
            gameState.powerUps.splice(i, 1);
            continue;
        }
        
        // Check collision with player
        if (checkCollision(gameState.player, powerUp)) {
            // Handle power-up collection
            powerUp.effect();
            
            // For power-ups with duration
            if (powerUp.duration > 0) {
                gameState.activePowerUp = powerUp;
                gameState.powerUpTimeRemaining = powerUp.duration;
            }
            
            // Remove collected power-up
            gameState.powerUps.splice(i, 1);
            continue;
        }
        
        // Draw power-up
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUp.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = powerUp.color;
        ctx.shadowColor = powerUp.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        
        // Add power-up icon (simplified)
        ctx.fillStyle = 'white';
        ctx.font = `${powerUp.size / 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let symbol = '?';
        if (powerUp.type === 'shield') symbol = 'S';
        else if (powerUp.type === 'slow') symbol = 'T';
        else if (powerUp.type === 'points') symbol = 'P';
        
        ctx.fillText(symbol, powerUp.x, powerUp.y);
    }
}

// Starfield background
const stars = [];
const NUM_STARS = 100;

// Initialize stars
for (let i = 0; i < NUM_STARS; i++) {
    stars.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 20 + 10
    });
}

// Draw moving starfield background
function drawStarfield() {
    ctx.fillStyle = 'white';
    
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        
        // Move star down
        star.y += star.speed / 60;
        
        // Reset star if it goes off-screen
        if (star.y > GAME_HEIGHT) {
            star.y = 0;
            star.x = Math.random() * GAME_WIDTH;
        }
        
        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
}
