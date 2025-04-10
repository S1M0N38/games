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
const LASER_SPEED = 10;
const LASER_COOLDOWN = 500; // milliseconds

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
    highScore: localStorage.getItem('spaceDodgerHighScore') || 0,
    // Game statistics
    statistics: {
        startTime: 0,
        asteroidsDestroyed: 0,
        powerupsCollected: 0
    }
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
const audioToggleButton = document.getElementById('audio-toggle');
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
audioToggleButton.addEventListener('click', handleAudioToggle);

// Add mouse click handler to fire lasers
canvas.addEventListener('click', () => {
    if (gameState.isActive && !gameState.isPaused) {
        fireLaser();
    }
});

// Audio toggle handler
function handleAudioToggle() {
    const isEnabled = toggleAudio();
    audioToggleButton.textContent = isEnabled ? '🔊' : '🔇';
    audioToggleButton.setAttribute('aria-label', isEnabled ? 'Sound On' : 'Sound Off');
}

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
    
    // Fire laser with Space key
    if (event.key === ' ' && gameState.isActive && !gameState.isPaused) {
        fireLaser();
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
    // Initialize sounds if not already done
    if (!sounds.explosion) {
        initSounds();
    }
    
    // Get difficulty settings
    const settings = difficultySettings[currentDifficulty];
    
    // Reset game state
    gameState.isActive = true;
    gameState.isPaused = false;
    gameState.score = 0;
    gameState.lives = settings.lives;
    gameState.difficulty = 1;
    gameState.asteroids = [];
    gameState.powerUps = [];
    gameState.activePowerUp = null;
    gameState.powerUpTimeRemaining = 0;
    gameState.lastAsteroidSpawn = 0;
    gameState.lastDifficultyIncrease = 0;
    
    // Reset statistics
    gameState.statistics.startTime = Date.now();
    gameState.statistics.asteroidsDestroyed = 0;
    gameState.statistics.powerupsCollected = 0;
    
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
    
    // Play start sound and background music
    playSound('backgroundMusic');
    
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
    
    // Calculate survival time
    const survivalTimeMs = Date.now() - gameState.statistics.startTime;
    const minutes = Math.floor(survivalTimeMs / 60000);
    const seconds = ((survivalTimeMs % 60000) / 1000).toFixed(0);
    const formattedTime = `${minutes}:${seconds.padStart(2, '0')}`;
    
    // Update final statistics displays
    finalScoreDisplay.textContent = gameState.score;
    highScoreDisplay.textContent = gameState.highScore;
    document.getElementById('final-difficulty').textContent = gameState.difficulty.toFixed(1);
    document.getElementById('survival-time').textContent = formattedTime;
    document.getElementById('asteroids-destroyed').textContent = gameState.statistics.asteroidsDestroyed;
    document.getElementById('powerups-collected').textContent = gameState.statistics.powerupsCollected;
    
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
        // Play shield hit sound
        playSound('laserShot');
        return false; // No life lost if shielded
    } else {
        gameState.lives--;
        updateDisplays();
        
        // Play explosion sound
        playSound('explosion');
        
        // Create explosion effect
        createExplosion(gameState.player.x, gameState.player.y);
        
        if (gameState.lives <= 0) {
            // Play game over sound
            stopSound('backgroundMusic');
            playSound('gameOver');
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

// Engine trail particles
const engineParticles = [];
const MAX_ENGINE_PARTICLES = 40;

// Create engine trail particle
function createEngineParticle() {
    // Calculate position at the bottom of the ship
    const x = gameState.player.x;
    const y = gameState.player.y + gameState.player.size / 2;
    
    // Random spread
    const spreadX = (Math.random() - 0.5) * gameState.player.size / 3;
    
    engineParticles.push({
        x: x + spreadX,
        y: y,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 2 + 1,
        color: Math.random() > 0.3 ? '#ff6600' : '#ffcc00',
        life: Math.random() * 20 + 10
    });
    
    // Limit the number of particles
    if (engineParticles.length > MAX_ENGINE_PARTICLES) {
        engineParticles.shift();
    }
}

// Update and draw engine trail
function updateEngineTrail() {
    // Create new particles
    if (gameState.isActive && !gameState.isPaused) {
        createEngineParticle();
    }
    
    // Update and draw particles
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    for (let i = engineParticles.length - 1; i >= 0; i--) {
        const p = engineParticles[i];
        
        // Update position
        p.y += p.speed;
        p.life--;
        
        // Remove dead particles
        if (p.life <= 0) {
            engineParticles.splice(i, 1);
            continue;
        }
        
        // Calculate alpha based on life
        const alpha = p.life / 30;
        
        // Draw particle
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
    }
    
    ctx.restore();
}

// Main game loop
let lastTimestamp = 0;
function gameLoop(timestamp = 0) {
    // Calculate delta time in seconds
    const deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    
    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    if (gameState.isActive && !gameState.isPaused) {
        // Process keyboard input
        processKeyboardInput(deltaTime);
        
        // Increase score based on time survived
        gameState.score += Math.floor(deltaTime * 10);
        updateDisplays();
        
        // Spawn asteroids at intervals
        const currentTime = performance.now();
        const settings = difficultySettings[currentDifficulty];
        if (currentTime - gameState.lastAsteroidSpawn > settings.asteroidSpawnInterval / gameState.difficulty) {
            spawnAsteroid();
            gameState.lastAsteroidSpawn = currentTime;
        }
        
        // Increase difficulty over time
        if (currentTime - gameState.lastDifficultyIncrease > settings.difficultyIncreaseInterval) {
            gameState.difficulty += settings.difficultyMultiplier; // Gradual difficulty increase
            gameState.lastDifficultyIncrease = currentTime;
        }
        if (gameState.activePowerUp && gameState.powerUpTimeRemaining > 0) {
            gameState.powerUpTimeRemaining -= deltaTime * 1000;
            
            // Update timer bar width to show remaining time
            const timerBar = document.getElementById('power-up-timer-bar');
            const percentRemaining = (gameState.powerUpTimeRemaining / gameState.activePowerUp.duration) * 100;
            timerBar.style.width = `${percentRemaining}%`;
            
            // Set color based on power-up type
            timerBar.style.backgroundColor = gameState.activePowerUp.color;
            
            // Power-up expired
            if (gameState.powerUpTimeRemaining <= 0) {
                if (gameState.activePowerUp.type === 'shield') {
                    gameState.player.isShielded = false;
                }
                gameState.activePowerUp = null;
                powerUpIndicator.classList.add('hidden');
            }
        }
        
        // Draw starfield background
        drawStarfield();
        
        // Update and draw engine trail (before player so it appears behind)
        updateEngineTrail();
        
        // Update and draw player
        drawPlayer();
        
        // Update and draw asteroids
        updateAsteroids(deltaTime);
        
        // Update and draw power-ups
        updatePowerUps(deltaTime);
        
        // Update and draw lasers
        updateLasers(deltaTime);
    } else {
        // Even when paused, continue to draw the game state
        drawStarfield();
        updateEngineTrail(); // With reduced particle generation
        drawPlayer();
        
        // Draw all asteroids in their current position
        gameState.asteroids.forEach(asteroid => {
            ctx.beginPath();
            ctx.arc(asteroid.x, asteroid.y, asteroid.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = asteroid.color;
            ctx.fill();
        });
        
        // Draw all power-ups in their current position
        gameState.powerUps.forEach(powerUp => {
            ctx.beginPath();
            ctx.arc(powerUp.x, powerUp.y, powerUp.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = powerUp.color;
            ctx.shadowColor = powerUp.color;
            ctx.shadowBlur = 10;
            ctx.fill();
        });
        
        // Draw all lasers in their current position
        lasers.forEach(laser => {
            ctx.fillStyle = laser.color;
            ctx.shadowColor = laser.color;
            ctx.shadowBlur = 10;
            ctx.fillRect(laser.x - laser.width / 2, laser.y, laser.width, laser.height);
        });
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
            // Play power-up collection sound
            playSound('powerUp');
            
            // Track power-up collection in statistics
            gameState.statistics.powerupsCollected++;
            
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

// Laser system
const lasers = [];
let lastLaserTime = 0;

// Fire a laser from the player's ship
function fireLaser() {
    const currentTime = performance.now();
    
    // Check cooldown
    if (currentTime - lastLaserTime < LASER_COOLDOWN) {
        return;
    }
    
    // Create a new laser
    lasers.push({
        x: gameState.player.x,
        y: gameState.player.y - gameState.player.size / 2,
        width: 3,
        height: 15,
        speed: LASER_SPEED,
        color: '#00ffff'
    });
    
    // Play laser sound
    playSound('laserShot');
    
    // Update cooldown timer
    lastLaserTime = currentTime;
}

// Update and draw lasers
function updateLasers(deltaTime) {
    for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        
        // Move laser up
        laser.y -= laser.speed * deltaTime * 60;
        
        // Remove if off-screen
        if (laser.y + laser.height < 0) {
            lasers.splice(i, 1);
            continue;
        }
        
        // Check collision with asteroids
        for (let j = gameState.asteroids.length - 1; j >= 0; j--) {
            const asteroid = gameState.asteroids[j];
            
            // Simple collision check
            if (laser.x > asteroid.x - asteroid.size / 2 &&
                laser.x < asteroid.x + asteroid.size / 2 &&
                laser.y < asteroid.y + asteroid.size / 2 &&
                laser.y + laser.height > asteroid.y - asteroid.size / 2) {
                
                // Remove laser
                lasers.splice(i, 1);
                
                // Create explosion at asteroid position
                createExplosion(asteroid.x, asteroid.y);
                
                // Track asteroid destruction in statistics
                gameState.statistics.asteroidsDestroyed++;
                
                // Add points based on asteroid size (smaller = more points)
                const points = Math.floor((ASTEROID_MAX_SIZE - asteroid.size + 10) * gameState.difficulty);
                gameState.score += points;
                updateDisplays();
                
                // Show points indicator
                showPointsIndicator(points, asteroid.x, asteroid.y);
                
                // Play explosion sound
                playSound('explosion');
                
                // Remove asteroid
                gameState.asteroids.splice(j, 1);
                
                // Break out of asteroid loop since laser is removed
                break;
            }
        }
        
        // Draw laser
        if (i < lasers.length) { // Check if laser still exists
            ctx.fillStyle = laser.color;
            ctx.shadowColor = laser.color;
            ctx.shadowBlur = 10;
            ctx.fillRect(laser.x - laser.width / 2, laser.y, laser.width, laser.height);
        }
    }
}

// Show points indicator when destroying an asteroid
function showPointsIndicator(points, x, y) {
    const indicator = document.createElement('div');
    indicator.textContent = `+${points}`;
    indicator.style.position = 'absolute';
    indicator.style.left = `${x}px`;
    indicator.style.top = `${y}px`;
    indicator.style.color = '#00ffff';
    indicator.style.fontSize = '18px';
    indicator.style.fontWeight = 'bold';
    indicator.style.zIndex = '15';
    indicator.style.transform = 'translate(-50%, -50%)';
    indicator.style.textShadow = '0 0 10px #00ffff';
    indicator.style.transition = 'transform 1s, opacity 1s';
    
    gameScreen.appendChild(indicator);
    
    // Animate and remove
    setTimeout(() => {
        indicator.style.transform = 'translate(-50%, -80px)';
        indicator.style.opacity = '0';
        setTimeout(() => {
            if (indicator.parentNode) {
                gameScreen.removeChild(indicator);
            }
        }, 500);
    }, 2000);
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

// Sound effects management
const sounds = {
    explosion: null,
    powerUp: null,
    gameOver: null,
    backgroundMusic: null,
    laserShot: null
};

// Audio settings
let audioEnabled = true;

// Preload and initialize sounds
function initSounds() {
    // Create audio elements
    sounds.explosion = new Audio();
    sounds.powerUp = new Audio();
    sounds.gameOver = new Audio();
    sounds.backgroundMusic = new Audio();
    sounds.laserShot = new Audio();
    
    // Set sources - these would be actual file paths when available
    sounds.explosion.src = 'assets/explosion.mp3';
    sounds.powerUp.src = 'assets/powerup.mp3';
    sounds.gameOver.src = 'assets/gameover.mp3';
    sounds.backgroundMusic.src = 'assets/background-music.mp3';
    sounds.laserShot.src = 'assets/laser.mp3';
    
    // Configure background music to loop
    sounds.backgroundMusic.loop = true;
    sounds.backgroundMusic.volume = 0.5;
    
    // Add error handling for missing audio files
    Object.values(sounds).forEach(sound => {
        sound.addEventListener('error', () => {
            console.warn(`Failed to load sound: ${sound.src}`);
        });
    });
}

// Play sound utility function with error handling
function playSound(soundName) {
    if (!audioEnabled) return;
    
    const sound = sounds[soundName];
    if (!sound) return;
    
    // For short sound effects, reset to beginning if already playing
    if (soundName !== 'backgroundMusic') {
        sound.currentTime = 0;
    }
    
    // Use catch to handle autoplay restrictions in browsers
    sound.play().catch(err => {
        console.warn(`Could not play sound: ${err.message}`);
    });
}

// Stop a specific sound
function stopSound(soundName) {
    const sound = sounds[soundName];
    if (!sound) return;
    
    sound.pause();
    if (soundName !== 'backgroundMusic') {
        sound.currentTime = 0;
    }
}

// Toggle audio on/off
function toggleAudio() {
    audioEnabled = !audioEnabled;
    
    if (!audioEnabled) {
        // Pause all sounds when audio is disabled
        Object.values(sounds).forEach(sound => {
            sound.pause();
        });
    } else if (gameState.isActive && !gameState.isPaused) {
        // Resume background music if game is active and not paused
        playSound('backgroundMusic');
    }
    
    return audioEnabled;
}

// Accessibility features
let accessibilityMode = false;

// Toggle high-contrast mode for better visibility
function toggleAccessibilityMode() {
    accessibilityMode = !accessibilityMode;
    
    if (accessibilityMode) {
        // Increase visibility of game elements
        document.documentElement.style.setProperty('--accent-primary', '#00ffcc'); // Brighter cyan
        document.documentElement.style.setProperty('--accent-secondary', '#ff00cc'); // Brighter magenta
    } else {
        // Restore default colors
        document.documentElement.style.setProperty('--accent-primary', '#00ffff');
        document.documentElement.style.setProperty('--accent-secondary', '#ff00ff');
    }
    
    return accessibilityMode;
}

// Add keyboard shortcuts for accessibility
window.addEventListener('keydown', function(event) {
    // Alt+A to toggle accessibility mode
    if (event.altKey && (event.key === 'a' || event.key === 'A')) {
        const isEnabled = toggleAccessibilityMode();
        
        // Show temporary notification
        const notification = document.createElement('div');
        notification.textContent = `Accessibility mode: ${isEnabled ? 'ON' : 'OFF'}`;
        notification.className = 'accessibility-notification';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 2000);
        
        event.preventDefault();
    }
    
    // Alt+M to toggle audio
    if (event.altKey && (event.key === 'm' || event.key === 'M')) {
        handleAudioToggle();
        event.preventDefault();
    }
});

// DOM Elements for difficulty buttons
const easyButton = document.getElementById('easy-button');
const mediumButton = document.getElementById('medium-button');
const hardButton = document.getElementById('hard-button');

// Difficulty settings
const difficultySettings = {
    easy: {
        asteroidSpawnInterval: 1200,
        difficultyIncreaseInterval: 15000,
        difficultyMultiplier: 0.15,
        lives: 5
    },
    medium: {
        asteroidSpawnInterval: 1000,
        difficultyIncreaseInterval: 10000,
        difficultyMultiplier: 0.2,
        lives: 3
    },
    hard: {
        asteroidSpawnInterval: 700,
        difficultyIncreaseInterval: 8000,
        difficultyMultiplier: 0.3,
        lives: 1
    }
};

// Current difficulty
let currentDifficulty = 'easy';

// Event Listeners for difficulty buttons
easyButton.addEventListener('click', () => setDifficulty('easy'));
mediumButton.addEventListener('click', () => setDifficulty('medium'));
hardButton.addEventListener('click', () => setDifficulty('hard'));

// Set difficulty
function setDifficulty(difficulty) {
    // Update current difficulty
    currentDifficulty = difficulty;
    
    // Update button styling
    easyButton.classList.remove('selected');
    mediumButton.classList.remove('selected');
    hardButton.classList.remove('selected');
    
    // Add selected class to chosen difficulty button
    if (difficulty === 'easy') easyButton.classList.add('selected');
    else if (difficulty === 'medium') mediumButton.classList.add('selected');
    else if (difficulty === 'hard') hardButton.classList.add('selected');
}

// DOM Elements for controls overlay
const helpButton = document.getElementById('help-button');
const controlsOverlay = document.getElementById('controls-overlay');
const closeControlsButton = document.getElementById('close-controls');

// Event listeners for controls overlay
helpButton.addEventListener('click', showControlsOverlay);
closeControlsButton.addEventListener('click', hideControlsOverlay);

// Show controls overlay
function showControlsOverlay() {
    controlsOverlay.classList.remove('hidden');
    
    // Pause the game when showing controls
    if (gameState.isActive && !gameState.isPaused) {
        togglePause();
    }
}

// Hide controls overlay
function hideControlsOverlay() {
    controlsOverlay.classList.add('hidden');
}
