# Pendulum Pulse

## Game Overview
Pendulum Pulse is a minimalist reaction game where players interact with a hypnotic swinging pendulum. The objective is to click or tap at the exact moment the pendulum passes through the center line, creating visual and rhythmic satisfaction through precise timing.

## How to Play
1. Click the "Start" button to begin the game
2. Watch the pendulum as it swings back and forth
3. Click/tap precisely when the pendulum crosses the center line
4. Perfect timing rewards you with points and visual effects
5. Mistimed clicks cost you a life (you have 3 lives)
6. As you succeed, the pendulum speeds up for increased challenge
7. Game ends when you run out of lives

## Core Mechanic
A pendulum swings across the screen in a smooth, mesmerizing arc. The player must click or tap when the pendulum crosses the center line. Success creates a visual pulse effect and adds to the score. Precision is rewarded with more dramatic visual feedback. Mistimed clicks result in subtle negative feedback.

## Controls
- **Mouse/Touch**: Click or tap anywhere on the screen when the pendulum crosses the center line

## Visual Design
- **Color Palette**: Strictly black and white with various shades of gray for subtle depth
- **Aesthetic**: Minimalist, elegant, with smooth animations
- **Elements**:
  - Pendulum (white)
  - Center line (white)
  - Background (black)
  - Pulse effects (white expanding circles with fade-out)

## Technical Approach
- Canvas-based rendering for smooth animations
- Physics-based pendulum simulation with realistic motion
- Particle effects for visual feedback
- Responsive design that fills the entire screen
- No external libraries or dependencies

## MVP Features
- Accurate pendulum physics with natural motion
- Click/tap detection with timing precision
- Visual feedback through expanding ripple animations
- Simple scoring system based on timing accuracy
- Progressive difficulty with pendulum speed changes
- Life system with three attempts

## Implementation Details
- HTML5 Canvas for rendering all game elements
- Requestanimationframe for smooth 60fps animations
- Object-oriented approach for game state management
- Physics calculations for natural pendulum movement
- Particle system for engaging visual feedback

## Game Feel
The game focuses on creating a meditative, almost hypnotic experience through the combination of visual rhythm and player interaction. The stark black and white aesthetic emphasizes the pure timing mechanic without distraction.