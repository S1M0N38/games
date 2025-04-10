# Breakout Blocks

A minimal brick-breaking game where players control a paddle to bounce a ball and break bricks.

## Game Design Document

### Game Overview
**Title**: Breakout Blocks

**Genre**: Arcade

**Target Audience**: All ages, casual players

**Summary**: A minimal brick-breaking game where players control a paddle to bounce a ball, aiming to break all the bricks at the top of the screen. The game focuses purely on the core mechanic of angled bouncing with minimal visual elements.

### Core Mechanic
The player controls a horizontal paddle at the bottom of the screen using left and right arrow keys. A ball bounces around the screen, and the player must prevent it from falling off the bottom edge by bouncing it with the paddle. When the ball hits a brick, the brick disappears. The goal is to clear all bricks. The ball bounces at different angles based on where it hits the paddle, allowing for strategic aiming.

### Controls
- Left Arrow Key: Move paddle left
- Right Arrow Key: Move paddle right

### Visual Design
- Color Palette:
  - Background: Dark blue (#1a1a2e)
  - Paddle: Light blue (#4d80e4)
  - Ball: White (#ffffff)
  - Bricks: Various shades of orange/red (#e76f51, #f4a261, #e9c46a)
  - UI Text: White (#ffffff)

### Win/Loss Conditions
- Win: Break all bricks in the level
- Loss: Ball falls below the paddle and player loses all lives

### Technical Approach
- Canvas-based rendering for smooth animations and simple collision detection
- requestAnimationFrame for the game loop
- Simple physics for ball movement and collision

## How to Play
1. Use the left and right arrow keys to move the paddle
2. Keep the ball from falling off the bottom of the screen
3. Aim the ball to hit and break all the bricks
4. You have 3 lives - game ends when all lives are lost
5. Try to clear all bricks to win!
