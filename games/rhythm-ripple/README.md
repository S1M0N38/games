# Rhythm Ripple - Game Design Document

## Title, Genre, and Target Audience
**Title:** Rhythm Ripple  
**Genre:** Minimalist Rhythm/Timing Game  
**Target Audience:** Desktop users seeking a challenging, precision-based rhythm game with clean aesthetics

## Gameplay Description
Rhythm Ripple focuses on a single core mechanic: timing the expansion of circular ripples to intersect with target rings. The player uses keyboard keys to initiate ripples from fixed source points on the screen. Once triggered, these ripples expand outward at a constant rate. The goal is to time the ripple creation so that the expanding circle perfectly aligns with one or more target rings when they reach them.

The game creates challenge through:
1. **Multiple Origins**: Different keys (A, S, D, F) trigger ripples from different source points
2. **Multiple Targets**: Several target rings appear simultaneously, requiring strategic planning
3. **Varying Speeds**: Target rings move toward or away from ripple sources at different rates
4. **Chain Reactions**: Successfully hitting targets in sequence builds a combo multiplier
5. **Progressive Difficulty**: As score increases, the timing windows become more precise and patterns more complex

The player starts with three lives and loses one each time a target ring is missed (no ripple intersects it at the right moment) or when a ripple expands without hitting any targets. The game continues until all lives are depleted, with the score based on accuracy, timing precision, and combo chains.

## Visual Style
- **Color Palette:** Strictly black (`#000000`) background with white (`#FFFFFF`) and grayscale elements. Red (`#FF0000`) appears only for error feedback.
- **Graphics Approach:** All visual elements are created through code using simple geometric shapes:
  - Ripple sources: Small fixed circles at the bottom of the screen
  - Ripples: Expanding circles emanating from source points
  - Target rings: Thin circular outlines that appear and move across the screen
  - Perfect hit: Brief flash and particle effect at intersection points
- **UI Elements:**
  - Score counter: Top-right corner (numerical display only)
  - Lives indicator: Top-left corner (represented by white dots/circles)
  - Help button ("?"): Bottom-right corner
  - Combo counter: Center-top (numerical display that appears only during active combos)
- **Help Panel:** Toggles on "?" button click, containing minimal text explaining the goal (time ripples to hit targets) and commands (A,S,D,F keys to create ripples, ESC to pause, Q to quit)

## Controls
- **Input Mode:** Keyboard-only
- **Interactions:**
  - A key: Create ripple from leftmost source
  - S key: Create ripple from left-center source
  - D key: Create ripple from right-center source
  - F key: Create ripple from rightmost source
  - ESC key: Pause/resume gameplay
  - Q key: Exit to landing page
- **No mouse controls** for actual gameplay mechanics

## Technical Approach
- **Rendering Method:** Canvas-based implementation for smooth animations
- **Animation Techniques:**
  - requestAnimationFrame for continuous animation loop
  - Smooth expanding circles with ease-out transition
  - Subtle pulse animations for target rings
  - Particle effects for successful hits with varying intensity based on timing accuracy
  - Fade in/out transitions for UI elements
- **State Management:** Functional approach with clear state object tracking:
  - Game state (playing, paused, game over)
  - Score and combo multiplier
  - Lives remaining
  - Active ripples (position, radius, expansion rate)
  - Target rings (position, radius, movement pattern)
  - Timing windows and accuracy metrics
- **Data Persistence:** Local storage for high score only

## Visual Feedback Guidelines
- **Ripple Animation:**
  - Clean, expanding circles with slight fade at edges
  - Subtle trail effect showing expansion
  - Varying brightness based on expansion phase
- **Target Rings:**
  - Pulsing animation to indicate optimal timing window
  - Brightness increase as ripple approaches intersection
  - Brief flash effect on perfect timing hit
- **Combo Feedback:**
  - Increasing particle effect intensity with higher combos
  - Subtle screen shake on high-precision hits
  - Visual pulse through all active elements when combo threshold increases
- **Life Loss:** Visual ripple contraction animation and life indicator reduction
- **Game Over:** Elegant fadeout with final expanding ripple showing score
- **Error Handling:** Red full-screen overlay with warning icon (no text) and trembling border if a critical error occurs

## Performance Considerations
- Optimized collision detection between ripples and targets
- Efficient particle system with object pooling
- Dynamic complexity adjustment based on device performance
- Targeted 60 FPS with fallback animations for lower-end devices