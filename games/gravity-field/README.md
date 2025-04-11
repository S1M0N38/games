# Gravity Field - Game Design Document

## Title, Genre, and Target Audience
**Title:** Gravity Field  
**Genre:** Physics-Based Puzzle/Arcade  
**Target Audience:** Desktop users seeking a challenging, physics-based game with intuitive mouse controls

## Gameplay Description
Gravity Field focuses on a single core mechanic: manipulating gravity to influence objects in space. The player controls a gravity well that can attract or repel various celestial objects represented by white geometric shapes.

When the player clicks and holds, they create a gravity field at that location. Objects are drawn toward this field with a strength proportional to their distance (following an inverse square law similar to real gravity). The goal is to capture specific "target" objects by drawing them into a collection zone at the center of the screen while avoiding harmful objects.

The game progresses in difficulty with:
1. Increasing numbers of objects appearing simultaneously
2. Faster moving objects requiring quicker reactions
3. Introduction of objects with different mass properties (requiring different gravity strength)
4. Special objects that repel rather than attract to gravity

The player starts with three lives and loses one each time a harmful object enters the collection zone or a target object exits the play area. The game continues indefinitely with increasing difficulty until all lives are lost.

## Visual Style
- **Color Palette:** Strictly black (`#000000`) background with white (`#FFFFFF`) and grayscale elements. Red (`#FF0000`) appears only for error feedback.
- **Graphics Approach:** All visual elements are created through code using simple geometric shapes:
  - Target objects: White circles of varying sizes
  - Harmful objects: Gray polygons (triangles, squares)
  - Collection zone: Pulsing circle at the center
  - Gravity field: Concentric circles radiating outward from click point
- **UI Elements:**
  - Score counter: Top-right corner (numerical display only)
  - Lives indicator: Top-left corner (represented by white dots/circles)
  - Help button ("?"): Bottom-right corner
- **Help Panel:** Toggles on "?" button click, containing minimal text explaining the goal and commands (Click to create gravity field, ESC to pause, Q to quit)

## Controls
- **Input Mode:** Mouse-only
- **Interactions:**
  - Click and hold: Create gravity field at cursor position
  - Release: Deactivate gravity field
  - ESC key: Pause/resume gameplay
  - Q key: Exit to landing page

## Technical Approach
- **Rendering Method:** Canvas-based implementation for optimal physics simulation
- **Animation Techniques:**
  - requestAnimationFrame for smooth 60 FPS gameplay
  - Smooth particle effects for gravity fields with ease-in-out transitions
  - Subtle pulsing animations for the collection zone
  - Gentle rotations for objects in motion to provide visual feedback on velocity
- **State Management:** Functional approach tracking:
  - Game state (playing, paused, game over)
  - Score
  - Lives remaining
  - Object positions, velocities, and properties
  - Gravity field status and strength
- **Physics Implementation:**
  - Accurate vector-based gravity calculations
  - Velocity and acceleration physics for natural movement
  - Mass-based influence calculations for different object types
- **Data Persistence:** Local storage for high score only

## Visual Feedback Guidelines
- **Gravity Field Animation:**
  - Concentric circles expanding outward from click point
  - Opacity gradient to show field strength (stronger near the center)
  - Smooth fade-in when activated, fade-out when released
- **Object Interactions:**
  - Subtle trails following objects when affected by gravity
  - Gentle pulse effect when objects enter collection zone
  - Brief flash when harmful objects are avoided successfully
- **Life Loss:** Visual feedback through life indicator reduction and screen shake effect
- **Game Over:** Elegant implosion animation of all objects toward the center
- **Error Handling:** Red full-screen overlay with warning icon (no text) and trembling border if a critical error occurs

## Performance Considerations
- Optimized physics calculations using distance-squared to avoid square root operations
- Object pooling for efficient reuse of elements
- Limit on maximum simultaneous objects to maintain performance
- Adaptive physics complexity based on frame rate monitoring