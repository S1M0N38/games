# Reaction Dots - Game Design Document

## Title, Genre, and Target Audience
**Title:** Reaction Dots  
**Genre:** Minimal Reflex/Reaction Arcade Game  
**Target Audience:** Desktop users seeking a challenging, reflex-based game with simple mechanics

## Gameplay Description
Reaction Dots focuses on a single core mechanic: testing players' reaction time. A grid of dots appears on a black background. Dots randomly illuminate (change to white) for a brief moment, and the player must click them during this window to score points. As the score increases, the illumination period becomes shorter and dots appear more frequently, creating an escalating challenge.

The game loop is endless, with players striving to achieve the highest possible score before running out of lives. Players lose a life when missing an illuminated dot (failing to click before it disappears) or clicking a non-illuminated one. The game ends when all lives are depleted.

## Visual Style
- **Color Palette:** Strictly black (`#000000`) background with white (`#FFFFFF`) and grayscale elements. Red (`#FF0000`) appears only for error feedback.
- **Graphics Approach:** All visual elements are created through code using simple geometric shapes (primarily circles).
- **UI Elements:**
  - Score counter: Top-right corner (numerical display only)
  - Lives indicator: Top-left corner (represented by white dots/circles)
  - Help button ("?"): Bottom-right corner
  - Game grid: Center of screen with evenly spaced dots
- **Help Panel:** Toggles on "?" button click, containing minimal text explaining the goal (click illuminated dots) and command (ESC to pause, Q to quit)

## Controls
- **Input Mode:** Mouse-only
- **Interactions:**
  - Left-click: Select illuminated dots
  - ESC key: Pause/resume gameplay
  - Q key: Exit to landing page
- **No keyboard controls** for actual gameplay mechanics

## Technical Approach
- **Rendering Method:** DOM-based implementation using HTML elements for dots and UI
- **Animation Techniques:**
  - CSS transitions with ease-in-out timing for all dot illumination effects
  - Simple scale and opacity animations for feedback (successful/failed clicks)
  - requestAnimationFrame for timing-critical animations
- **State Management:** Functional approach with clear state object tracking:
  - Game state (playing, paused, game over)
  - Score
  - Lives remaining
  - Active dots
- **Data Persistence:** Local storage for high score only

## Visual Feedback Guidelines
- **Dot Animations:**
  - Normal state: Dark gray circles
  - Illuminated (target) state: White circles with subtle glow effect
  - Successful click: Brief scaling animation with fade
  - Failed click: Subtle shake animation
- **Life Loss:** Visual feedback through life indicator reduction
- **Game Over:** Fade-to-gray animation of the play field
- **Error Handling:** Red full-screen overlay with warning icon (no text) and trembling border if a critical error occurs

## Performance Considerations
- Target 60 FPS with optimized DOM manipulation
- Efficient event handling with proper cleanup to prevent memory leaks
- Responsive to window sizing while maintaining gameplay integrity
