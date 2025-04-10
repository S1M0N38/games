# Breakout Blocks

A retro-styled brick-breaking game where players control a paddle to bounce a ball and break colorful bricks.

## Game Design Document

### Game Overview
**Title**: Breakout Blocks

**Genre**: Arcade

**Target Audience**: All ages, casual players

**Summary**: A neon-infused brick-breaking game with retro arcade styling. Players control a paddle to bounce a fast-paced ball, aiming to break all the colorful bricks at the top of the screen. The game focuses on the core mechanic of angled bouncing with vibrant visuals inspired by 80s arcade games.

### Core Mechanic
The player controls a horizontal paddle at the bottom of the screen using left and right arrow keys. A ball bounces around the screen, and the player must prevent it from falling off the bottom edge by bouncing it with the paddle. When the ball hits a brick, the brick disappears. The goal is to clear all bricks. The ball bounces at different angles based on where it hits the paddle, allowing for strategic aiming.

### Controls
- Left Arrow Key: Move paddle left
- Right Arrow Key: Move paddle right

### Visual Design
- Retro Arcade Style with neon glow effects
- Color Palette:
  - Background: Deep blue (#0c0c2a)
  - Paddle: Cyan (#0ff7ff)
  - Ball: Hot pink (#ff3cac)
  - Bricks: Gradient of neon colors (pink, orange, yellow, green)
  - UI Text: White with glow effects
- Glowing elements with subtle shadow effects for authentic arcade feel

### Game Features
- Progressive difficulty with increasing ball speed
- Row-based scoring system (higher rows worth more points)
- Paddle angle physics for strategic shot placement
- Retro glow effects on all game elements

### Win/Loss Conditions
- Win: Break all bricks in the level
- Loss: Ball falls below the paddle and player loses all lives

### Technical Approach
- Canvas-based rendering with shadow effects for glow
- requestAnimationFrame for smooth animation
- Physics-based ball movement with normalized vectors
- Angle-based paddle reflection

## How to Play
1. Use the left and right arrow keys to move the paddle
2. Keep the ball from falling off the bottom of the screen
3. Aim the ball to hit and break all the bricks
4. You have 3 lives - game ends when all lives are lost
5. Higher bricks are worth more points!
6. The ball gradually speeds up - be prepared for increasing challenge!
