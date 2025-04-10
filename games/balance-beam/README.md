# Balance Beam

A precision-based game where players must balance a ball on a tilting beam for as long as possible.

## Game Design Document

### Game Overview
**Title**: Balance Beam

**Genre**: Arcade/Skill

**Target Audience**: All ages, casual players

**Summary**: Balance Beam is a test of precision and control. Players must balance a ball on a tilting beam for as long as possible. The beam tilts in response to key presses or mouse position, creating a constantly shifting challenge as players fight gravity to keep the ball from falling off.

### Core Mechanic
The player controls the tilt of a horizontal beam at the center of the screen. A ball sits on this beam and will roll according to the beam's tilt angle and gravity. The goal is to keep the ball balanced on the beam for as long as possible. The challenge increases over time as the ball moves more erratically.

### Controls
- Left Arrow Key: Tilt beam left
- Right Arrow Key: Tilt beam right
- Mouse movement: Move cursor horizontally to control tilt

### Visual Design
- Minimalist geometric style
- Color Palette:
  - Background: Dark gray (#222222)
  - Beam: White (#ffffff)
  - Ball: Coral (#ff6f61)
  - UI Text: White (#ffffff)

### Win/Loss Conditions
- No win condition (endless arcade style)
- Loss: Ball falls off either end of the beam

### Technical Approach
- Canvas-based rendering
- Simple physics simulation for ball movement
- Time-based scoring

## How to Play
1. Use the left and right arrow keys or move your mouse to tilt the beam
2. Try to keep the ball balanced on the beam for as long as possible
3. Your score increases the longer you keep the ball from falling
4. The game becomes progressively more challenging as time passes
