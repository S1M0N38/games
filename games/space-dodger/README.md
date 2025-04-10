# Space Dodger

A fast-paced arcade game where you control a spaceship navigating through an asteroid field. Dodge obstacles, collect power-ups, and survive as long as possible!

## Game Overview

**Genre:** Arcade / Space Shooter  
**Target Audience:** All ages, casual gamers  

Space Dodger is a classic arcade-style game where players control a spaceship to navigate through a dangerous asteroid field. The goal is to survive as long as possible while dodging incoming asteroids and collecting helpful power-ups. The game features increasing difficulty, power-ups with various effects, and a satisfying laser shooting mechanic to destroy asteroids.

## How to Play

1. **Controls:**
   - **Mouse movement:** Control ship position
   - **Arrow keys / WASD:** Alternative ship movement
   - **Space / Mouse click:** Fire laser
   - **P / ESC:** Pause game
   - **Alt+A:** Toggle accessibility mode
   - **Alt+M:** Toggle sound

2. **Power-ups:**
   - **Shield (S):** Protects from one asteroid hit
   - **Time Slow (T):** Temporarily slows all asteroids
   - **Points (P):** Gives bonus points

3. **Objective:**
   Survive as long as possible by avoiding asteroids. Your score increases over time and when destroying asteroids with your laser. The game gets progressively more difficult as your score increases.

## Technical Implementation

### Core Technologies
- **HTML5** for structure
- **CSS3** for styling
- **Vanilla JavaScript** for game logic

### Technical Highlights
- Canvas-based rendering for smooth animations
- Particle systems for explosions and engine effects
- Collision detection using distance-based calculations
- Delta-time based movement for consistent speed across different devices
- State management system for game progression
- Sound system with fallbacks for browser compatibility
- Local storage for high score persistence

### Code Structure
- Event-driven architecture for user interactions
- Object-oriented approach for game entities
- Modular functions with clear responsibilities
- Performance optimization with requestAnimationFrame

## Accessibility Features

Space Dodger includes several accessibility considerations:
- High-contrast mode (Alt+A)
- Audio toggle (Alt+M)
- Multiple control options (mouse or keyboard)
- Visual feedback for all game events
- Scalable UI elements

## Future Improvements

- Additional power-up types
- Enemy ships with different movement patterns
- Multiple player ships with unique abilities
- Level progression with boss encounters
- Mobile touch support
