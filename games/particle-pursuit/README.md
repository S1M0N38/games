# Particle Pursuit

## Game Design Document

### Concept
Particle Pursuit is a minimalist endless game where players control a white particle that must absorb smaller gray particles to grow while avoiding larger, faster ones that cause damage. The environment is intentionally hostile, with most particles being larger than the player.

### Core Mechanic
The game revolves around a single core mechanic: strategic movement. Players must position their particle to absorb the scarce smaller particles while maneuvering away from the abundant larger, dangerous ones. The game actively tries to maintain a visible ratio of approximately 20% safe (smaller) and 80% dangerous (larger) particles relative to the player's current size.

### Visual Style
Following the minimalist guidelines, the game uses only black, white, and grayscale:
- Black background representing the void
- White player particle
- Gray particles of various sizes (smaller ones are food, larger ones are threats)
- Red used only for collision feedback

### Controls
- **Mouse only**: The player's particle follows the mouse cursor position
- **ESC**: Pause/Resume game
- **Q**: Return to games hub

### Technical Approach
- Canvas-based rendering for smooth particle animation
- Physics-based movement with subtle acceleration/deceleration
- Particle system that continuously spawns new particles, aiming to maintain a target number of visible particles (around 20-30) on screen. The system monitors the ratio of visible safe vs. dangerous particles (relative to the player's size) and biases spawning to maintain an approximate 20/80 safe/dangerous ratio. Dangerous particle sizes scale significantly relative to the player's current size to ensure they remain a threat as the player grows.
- Collision detection based on circular distance calculations using defined safe/danger margins relative to player size.
- Progressive difficulty through increased spawning rates, overall size potential, and speeds.

### Progression System
The game difficulty increases relatively quickly over time through:
- Increasing number and potential maximum size of particles (especially dangerous ones).
- Significantly increasing speed of all particles.
- Faster shrinking of player particle (requiring more frequent absorption of the relatively scarce smaller particles).
- More frequent difficulty level increases.

### Scoring
Score increases based on particles absorbed, with points proportional to the size of absorbed particles. The high score is stored locally.
