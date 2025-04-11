# Particle Pursuit

## Game Design Document

### Concept
Particle Pursuit is a minimalist endless game where players control a white particle that must absorb smaller gray particles to grow while avoiding larger ones that cause damage.

### Core Mechanic
The game revolves around a single core mechanic: strategic movement. Players must position their particle to absorb smaller particles while maneuvering away from larger, dangerous ones. As the player's particle grows, the challenge of avoiding dangerous particles increases.

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
- Particle system that continuously spawns new particles
- Collision detection based on circular distance calculations
- Progressive difficulty through increased spawning rates and sizes

### Progression System
The game difficulty increases over time through:
- Increasing number of dangerous particles
- Increasing speed of all particles
- Larger size difference between food and dangerous particles
- Faster shrinking of player particle (requiring more frequent absorption)

### Scoring
Score increases based on particles absorbed, with points proportional to the size of absorbed particles. The high score is stored locally.
