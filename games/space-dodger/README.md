# Space Dodger - Game Design Document

## Game Overview
Space Dodger is a minimalist arcade game where players control a small spacecraft navigating through an endless field of incoming asteroids. The game focuses on precision movement and spatial awareness, creating an engaging and meditative gameplay experience in a stark black and white aesthetic.

## Core Mechanic
The game revolves around a single core mechanic: **mouse-based avoidance**. Players control a white triangular spacecraft that follows mouse movements within the game area. The goal is to dodge incoming asteroids (represented by white geometric shapes) that appear from the edges of the screen and travel across at varying speeds and trajectories. The game continues indefinitely, with the challenge progressively increasing as the player survives longer.

## Technical Approach
- **Rendering**: Canvas-based for smooth animations
- **Input**: Mouse-only control scheme
- **Animation**: Smooth ease-in-out transitions for all movements
- **Scoring**: Minimalist stopwatch-style indicator showing elapsed time

## Visual Design
- **Color Palette**: Strict black (#000000) background with white (#FFFFFF) game elements and subtle grayscale accents
- **Player Ship**: Minimalist white triangular spacecraft with particle trail effects
- **Asteroids**: Varied white geometric shapes (circles, polygons) with different rotation patterns
- **Feedback**: No text UI, only visual feedback through animations and icons
- **Screen Layout**: Full-screen canvas with minimal visual indicators for game state
- **Progress Indicator**: Subtle progress bar showing difficulty progression

## Animation Plan
- **Player Movement**: Smooth following of mouse with slight easing for natural feel
- **Player Trail**: Subtle particle effects behind the ship during movement
- **Asteroid Movement**: Each asteroid has unique rotation and movement patterns
- **Game Start**: Converging particles animation leading into gameplay
- **Collision**: Explosion of particles when player collides with an asteroid
- **Near Misses**: Subtle particle effects when asteroids pass close to the player

## Audio Approach
- Minimal, pleasing audio feedback for:
  - Near misses (soft whoosh sound)
  - Collisions (subtle impact sound)
  - Background ambiance (very low, ambient tone)

## Technical Implementation Details
1. **Game Loop**: Uses requestAnimationFrame for smooth 60FPS gameplay
2. **Collision Detection**: Shape-aware collision detection for different asteroid types
3. **State Management**: Distinct states (intro, playing, resetting, error)
4. **Performance Optimization**: Object pooling for asteroids and particles

## Error Handling
If a critical JavaScript error occurs, a full-screen red error overlay with trembling border will appear, conforming to the error state visual specification.

## Local Storage Usage
Minimal data storage for:
- Recording if the game has been played before
- Storing the player's longest survival time
