# VOID SERPENT - Game Design Document

## Game Title
Void Serpent

## Genre
Minimalist Arcade

## Target Audience
Casual gamers of all ages who appreciate minimalist aesthetics and challenging gameplay.

## Game Description
A modern reimagining of the classic Snake game with a minimalist black and white aesthetic. Players control a serpent that grows longer as it consumes light fragments in the void. The goal is to survive as long as possible without colliding with the boundaries of the void or the serpent's own trail.

## Core Gameplay Mechanic
The game features a single, refined mechanic: navigating a constantly moving serpent through an increasingly challenging space. The serpent grows longer with each consumed light fragment, making it progressively more difficult to avoid self-collision. The game speed gradually increases over time, creating an escalating challenge that tests the player's reflexes and spatial awareness.

## Visual Style Specifications
- **Color Palette**: Strict black (#000000) background with white (#FFFFFF) serpent and light fragments. Subtle grayscale accents for depth and visual hierarchy.
- **Error State**: Red (#FF0000) used exclusively for the error overlay when a game crash occurs.
- **Aesthetic**: Geometric, minimalist design with sharp contrast between the void (black background) and entities (white).
- **Animations**: Smooth, subtle animations with ease-in-out transitions for movement, collisions, and state changes.

## Controls
- **Input Method**: Keyboard only
- **Movement**: Arrow keys for directional control (Up, Down, Left, Right)
- **Boost Speed**: Spacebar (hold to move faster)
- **Pause/Resume**: Escape key
- **Exit Game**: Q key returns to landing page

## Technical Approach
- **Rendering**: Canvas-based rendering for optimal performance and visual consistency
- **Animation**: requestAnimationFrame for smooth 60 FPS gameplay
- **State Management**: Simple state machine pattern for game states (title screen, playing, paused, game over)
- **Code Structure**: Modular approach with clear separation of rendering, game logic, and input handling

## Visual Feedback Guidelines
- **Movement**: Subtle motion trails following the serpent
- **Consumption**: Brief pulse animation when light fragments are consumed
- **Collision**: Screen shake and serpent dissolution animation on collision
- **Score Milestone**: Subtle flash effect when reaching score milestones
- **Game Over**: Elegant fadeout and dissolution of the serpent

## Game Elements
1. **Serpent**: A white line that grows in length, rendered as connected segments
2. **Light Fragments**: Small white geometric shapes (circles, squares, triangles) that appear randomly
3. **Score Counter**: Minimalist number display in the top right corner
4. **Void Boundaries**: The edges of the playing field, invisible but deadly on contact

## Game Flow
1. Initial state shows a pulsing serpent and a single light fragment
2. Game begins with first directional input
3. Serpent moves continuously in the current direction
4. Player must navigate to consume light fragments while avoiding collisions
5. Each consumption increases score and serpent length
6. Game gradually increases in speed as score rises
7. Game ends when collision occurs
8. High score is recorded and displayed

## Data Persistence
- High score stored in localStorage
- Reset functionality available from the landing page

## Error Handling
- Red error overlay with trembling border and warning icon if game crashes
