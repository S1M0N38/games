/**
 * Space Dodger - A minimalist arcade game
 * Core mechanic: Mouse-based asteroid avoidance
 */

(function () {
    'use strict';

    // Game constants
    const GAME_STATE = {
        INTRO: 'intro',
        PLAYING: 'playing',
        RESETTING: 'resetting',
        ERROR: 'error'
    };

    // Game variables
    let canvas, ctx;
    let gameState = GAME_STATE.INTRO;
    let lastTime = 0;
    let delta = 0;
    let mouseX = 0;
    let mouseY = 0;
    let gameTime = 0;
    let difficultyProgress = 0;
    let hasPlayed = false;
    let highScore = 0;

    // Game entities
    let player;
    let asteroids = [];
    let particles = [];

    // Pooling for better performance
    const asteroidPool = [];
    const particlePool = [];

    // DOM elements
    let progressBar;

    // Audio elements
    let nearMissSound, collisionSound, ambientSound;

    // Initialization
    function init() {
        try {
            // Get canvas and context
            canvas = document.getElementById('game-canvas');
            ctx = canvas.getContext('2d');

            // Set canvas dimensions
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);

            // Get UI elements
            progressBar = document.getElementById('progress-bar');

            // Create audio elements
            createAudioElements();

            // Mouse tracking
            canvas.addEventListener('mousemove', handleMouseMove);

            // Check local storage
            loadGameState();

            // Initialize game objects
            initializePlayer();

            // Start the intro sequence
            startIntro();

            // Start the game loop
            requestAnimationFrame(gameLoop);
        } catch (error) {
            handleError(error);
        }
    }

    // Set canvas to full window size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Create minimal audio feedback
    function createAudioElements() {
        try {
            // Creating audio objects (would be linked to actual files in production)
            nearMissSound = new Audio();
            collisionSound = new Audio();
            ambientSound = new Audio();

            // Configure ambient sound
            ambientSound.volume = 0.1;
            ambientSound.loop = true;
        } catch (error) {
            console.error('Audio initialization error:', error);
            // Continue without sound
        }
    }

    // Load saved game state from localStorage
    function loadGameState() {
        try {
            hasPlayed = localStorage.getItem('space-dodger-played') === 'true';
            const savedScore = localStorage.getItem('space-dodger-high-score');
            if (savedScore) {
                highScore = parseInt(savedScore, 10);
            }
        } catch (error) {
            console.error('LocalStorage error:', error);
            // Continue without storage
        }
    }

    // Save game state to localStorage
    function saveGameState() {
        try {
            localStorage.setItem('space-dodger-played', 'true');
            localStorage.setItem('space-dodger-high-score', highScore.toString());
        } catch (error) {
            console.error('LocalStorage error:', error);
        }
    }

    // Track mouse position
    function handleMouseMove(event) {
        mouseX = event.clientX;
        mouseY = event.clientY;
    }

    // Create player ship
    function initializePlayer() {
        player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            size: 20,
            targetX: canvas.width / 2,
            targetY: canvas.height / 2,
            speed: 0.15,
            rotation: 0,
            active: true
        };
    }

    // Start intro animation
    function startIntro() {
        gameState = GAME_STATE.INTRO;
        asteroids = [];
        particles = [];
        gameTime = 0;

        // Create converging particles for intro effect
        for (let i = 0; i < 20; i++) {
            createParticle(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                canvas.width / 2,
                canvas.height / 2,
                1.5 + Math.random() * 1.5
            );
        }

        // Transition to playing state after animation
        setTimeout(() => {
            gameState = GAME_STATE.PLAYING;
            hasPlayed = true;
            saveGameState();

            try {
                ambientSound.play();
            } catch (e) {
                // Continue without sound
            }
        }, 1500);
    }

    // Reset game after collision
    function resetGame() {
        gameState = GAME_STATE.RESETTING;

        // Create explosion particles
        for (let i = 0; i < 30; i++) {
            createParticle(
                player.x,
                player.y,
                player.x + (Math.random() - 0.5) * 200,
                player.y + (Math.random() - 0.5) * 200,
                3 + Math.random() * 2
            );
        }

        // Reset player position
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        player.targetX = canvas.width / 2;
        player.targetY = canvas.height / 2;
        player.active = false;

        // Remove all asteroids
        asteroids.forEach(a => asteroidPool.push(a));
        asteroids = [];

        // Reset game parameters
        gameTime = 0;
        difficultyProgress = 0;
        updateProgressBar(0);

        // Restart intro sequence after a delay
        setTimeout(startIntro, 2000);
    }

    // Main game loop
    function gameLoop(timestamp) {
        // Calculate delta time for smooth animation
        if (!lastTime) lastTime = timestamp;
        delta = (timestamp - lastTime) / 1000; // Convert to seconds
        lastTime = timestamp;

        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and render based on game state
        switch (gameState) {
            case GAME_STATE.INTRO:
            case GAME_STATE.RESETTING:
                updateTransition(delta);
                renderTransition();
                break;
            case GAME_STATE.PLAYING:
                updateGame(delta);
                renderGame();
                break;
            case GAME_STATE.ERROR:
                showErrorOverlay();
                break;
        }

        // Continue game loop
        requestAnimationFrame(gameLoop);
    }

    // Update game state
    function updateGame(delta) {
        // Update player with smooth follow
        updatePlayer(delta);

        // Update game time and difficulty
        gameTime += delta;
        difficultyProgress = Math.min(1, gameTime / 180); // Max difficulty after 3 minutes
        updateProgressBar(difficultyProgress);

        // Update high score
        if (gameTime * 1000 > highScore) {
            highScore = Math.floor(gameTime * 1000);
            saveGameState();
        }

        // Spawn asteroids based on difficulty
        if (Math.random() < 0.05 + (difficultyProgress * 0.15)) {
            spawnAsteroid();
        }

        // Update all game entities
        updateAsteroids(delta);
        updateParticles(delta);

        // Check for collisions
        checkCollisions();
    }

    // Update player ship
    function updatePlayer(delta) {
        if (!player.active) return;

        // Smooth movement towards mouse position
        player.targetX = mouseX;
        player.targetY = mouseY;

        player.x += (player.targetX - player.x) * player.speed * (delta * 60);
        player.y += (player.targetY - player.y) * player.speed * (delta * 60);

        // Subtle rotation based on movement
        const dx = player.targetX - player.x;
        const dy = player.targetY - player.y;
        const targetRotation = Math.atan2(dy, dx) + Math.PI / 2;

        // Smooth rotation
        let rotDiff = targetRotation - player.rotation;

        // Normalize angle difference
        if (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        if (rotDiff < -Math.PI) rotDiff += Math.PI * 2;

        player.rotation += rotDiff * 0.1 * (delta * 60);

        // Create subtle trail particles during movement
        if (Math.random() < 0.2 && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
            const trailX = player.x - Math.cos(player.rotation - Math.PI / 2) * player.size;
            const trailY = player.y - Math.sin(player.rotation - Math.PI / 2) * player.size;

            createParticle(
                trailX,
                trailY,
                trailX + (Math.random() - 0.5) * 10,
                trailY + (Math.random() - 0.5) * 10,
                0.5 + Math.random()
            );
        }
    }

    // Spawn a new asteroid
    function spawnAsteroid() {
        // Get asteroid from pool or create new
        let asteroid = asteroidPool.length > 0 ? asteroidPool.pop() : {};

        // Position outside viewport
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left

        switch (side) {
            case 0: // top
                asteroid.x = Math.random() * canvas.width;
                asteroid.y = -50;
                asteroid.speedY = 1 + Math.random() * 3 * (1 + difficultyProgress);
                asteroid.speedX = (Math.random() - 0.5) * 2 * (1 + difficultyProgress);
                break;
            case 1: // right
                asteroid.x = canvas.width + 50;
                asteroid.y = Math.random() * canvas.height;
                asteroid.speedX = -(1 + Math.random() * 3 * (1 + difficultyProgress));
                asteroid.speedY = (Math.random() - 0.5) * 2 * (1 + difficultyProgress);
                break;
            case 2: // bottom
                asteroid.x = Math.random() * canvas.width;
                asteroid.y = canvas.height + 50;
                asteroid.speedY = -(1 + Math.random() * 3 * (1 + difficultyProgress));
                asteroid.speedX = (Math.random() - 0.5) * 2 * (1 + difficultyProgress);
                break;
            case 3: // left
                asteroid.x = -50;
                asteroid.y = Math.random() * canvas.height;
                asteroid.speedX = 1 + Math.random() * 3 * (1 + difficultyProgress);
                asteroid.speedY = (Math.random() - 0.5) * 2 * (1 + difficultyProgress);
                break;
        }

        // Common properties
        asteroid.size = 15 + Math.random() * 25;
        asteroid.rotation = Math.random() * Math.PI * 2;
        asteroid.rotationSpeed = (Math.random() - 0.5) * 0.1;
        asteroid.shape = Math.floor(Math.random() * 5); // 0: circle, 1: triangle, 2: square, 3: pentagon, 4: hexagon

        asteroids.push(asteroid);
    }

    // Update all asteroids
    function updateAsteroids(delta) {
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const asteroid = asteroids[i];

            // Update position
            asteroid.x += asteroid.speedX * delta * 60;
            asteroid.y += asteroid.speedY * delta * 60;

            // Update rotation
            asteroid.rotation += asteroid.rotationSpeed * delta * 60;

            // Remove if off screen with padding
            if (asteroid.x < -100 || asteroid.x > canvas.width + 100 ||
                asteroid.y < -100 || asteroid.y > canvas.height + 100) {
                asteroidPool.push(asteroids.splice(i, 1)[0]);
            }
        }
    }

    // Create particle effect
    function createParticle(x, y, targetX, targetY, duration) {
        // Get from pool or create new
        let particle = particlePool.length > 0 ? particlePool.pop() : {};

        particle.x = x;
        particle.y = y;
        particle.startX = x;
        particle.startY = y;
        particle.targetX = targetX;
        particle.targetY = targetY;
        particle.life = 1.0;
        particle.duration = duration;
        particle.size = 1 + Math.random() * 3;

        particles.push(particle);
        return particle;
    }

    // Update all particles
    function updateParticles(delta) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];

            // Update life
            particle.life -= delta / particle.duration;

            // Update position using easing
            const progress = 1 - particle.life;
            const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

            particle.x = particle.startX + (particle.targetX - particle.startX) * easedProgress;
            particle.y = particle.startY + (particle.targetY - particle.startY) * easedProgress;

            // Remove dead particles
            if (particle.life <= 0) {
                particlePool.push(particles.splice(i, 1)[0]);
            }
        }
    }

    // Check for collisions between player and asteroids
    function checkCollisions() {
        if (!player.active || gameState !== GAME_STATE.PLAYING) return;

        for (const asteroid of asteroids) {
            const dx = player.x - asteroid.x;
            const dy = player.y - asteroid.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Collision radii adjusted by shape
            const playerRadius = player.size * 0.7;
            let asteroidFactor = 0.8;

            // Adjust collision radius based on shape
            switch (asteroid.shape) {
                case 0: // Circle
                    asteroidFactor = 0.9;
                    break;
                case 1: // Triangle
                    asteroidFactor = 0.7;
                    break;
            }

            // Check for collision
            if (distance < playerRadius + asteroid.size * asteroidFactor) {
                handleCollision();
                return;
            }

            // Near miss detection
            const nearMissThreshold = playerRadius + asteroid.size * 1.8;
            if (distance < nearMissThreshold && Math.random() < 0.1) {
                try {
                    nearMissSound.play();
                } catch (e) {
                    // Continue without sound
                }

                // Create subtle particle trail for near miss
                for (let i = 0; i < 3; i++) {
                    createParticle(
                        asteroid.x + (Math.random() - 0.5) * asteroid.size,
                        asteroid.y + (Math.random() - 0.5) * asteroid.size,
                        asteroid.x + asteroid.speedX * 20,
                        asteroid.y + asteroid.speedY * 20,
                        0.5 + Math.random() * 0.5
                    );
                }
            }
        }
    }

    // Handle collision
    function handleCollision() {
        try {
            collisionSound.play();
        } catch (e) {
            // Continue without sound
        }

        resetGame();
    }

    // Update transitioning state (intro/resetting)
    function updateTransition(delta) {
        updateParticles(delta);

        if (gameState === GAME_STATE.INTRO && player) {
            // Gradually activate player during intro
            player.active = true;
        }
    }

    // Update progress bar
    function updateProgressBar(progress) {
        if (!progressBar) return;

        progressBar.style.width = `${progress * 100}%`;

        // Pulse effect when nearing difficulty increase
        if (progress > 0 && progress % 0.1 < 0.02) {
            progressBar.style.opacity = 0.5 + Math.sin(gameTime * 5) * 0.5;
        } else {
            progressBar.style.opacity = 1;
        }
    }

    // Render the game
    function renderGame() {
        // Render game entities
        renderAsteroids();
        renderPlayer();
        renderParticles();
        renderScore();
    }

    // Render transition states
    function renderTransition() {
        renderParticles();

        if (player && player.active) {
            renderPlayer();
        }
    }

    // Render player ship
    function renderPlayer() {
        if (!player) return;

        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.rotation);

        // Draw player ship (triangle)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(0, -player.size);
        ctx.lineTo(-player.size * 0.6, player.size * 0.5);
        ctx.lineTo(0, player.size * 0.3);
        ctx.lineTo(player.size * 0.6, player.size * 0.5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // Render all asteroids
    function renderAsteroids() {
        ctx.fillStyle = '#FFFFFF';

        for (const asteroid of asteroids) {
            ctx.save();
            ctx.translate(asteroid.x, asteroid.y);
            ctx.rotate(asteroid.rotation);

            // Draw different shapes based on asteroid type
            ctx.beginPath();

            switch (asteroid.shape) {
                case 0: // Circle
                    ctx.arc(0, 0, asteroid.size, 0, Math.PI * 2);
                    break;

                case 1: // Triangle
                    drawPolygon(asteroid.size, 3);
                    break;

                case 2: // Square
                    const squareSize = asteroid.size * 0.9;
                    ctx.rect(-squareSize, -squareSize, squareSize * 2, squareSize * 2);
                    break;

                case 3: // Pentagon
                    drawPolygon(asteroid.size, 5);
                    break;

                case 4: // Hexagon
                    drawPolygon(asteroid.size, 6);
                    break;
            }

            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    // Helper function to draw regular polygons
    function drawPolygon(radius, sides) {
        const angleStep = (Math.PI * 2) / sides;

        for (let i = 0; i < sides; i++) {
            const angle = i * angleStep;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
    }

    // Render all particles
    function renderParticles() {
        ctx.fillStyle = '#FFFFFF';

        for (const particle of particles) {
            const opacity = particle.life;
            ctx.globalAlpha = opacity;

            const size = particle.size * (1 + (1 - particle.life) * 0.5);

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }

    // Render minimalist stopwatch-style score
    function renderScore() {
        const x = canvas.width - 40; // Position in top right corner
        const y = 40;

        ctx.save();

        // Draw milliseconds as simple number
        const ms = Math.floor(gameTime * 1000);

        // Draw the number
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '28px monospace'; // Bigger font
        ctx.fillText(ms, x, y);

        ctx.restore();
    }

    // Show error overlay
    function showErrorOverlay() {
        const errorOverlay = document.getElementById('error-overlay');
        if (errorOverlay) {
            errorOverlay.style.display = 'flex';
        }
    }

    // Handle errors
    function handleError(error) {
        console.error('Game error:', error);
        gameState = GAME_STATE.ERROR;
        showErrorOverlay();
    }

    // Initialize on load
    window.addEventListener('load', init);

    // Global error handler
    window.addEventListener('error', function (event) {
        handleError(event.error);
    });
})();
