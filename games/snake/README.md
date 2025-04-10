# Snake Game Design Document

## Game Title
Snake

## Genre
Arcade

## Target Audience
Casual gamers of all ages, especially those who enjoy simple, quick-to-learn games with challenging gameplay.

## Game Description
Snake is a classic arcade game where players control a snake that grows longer as it eats food. The goal is to eat as much food as possible without colliding with the walls or the snake's own body.

## Gameplay Mechanics
- The snake constantly moves in the direction it's facing
- The player can change the direction of the snake (up, down, left, right)
- Food items appear at random locations on the game board
- When the snake eats food, it grows longer
- The game ends if the snake collides with the walls or its own body
- Score increases with each food item eaten
- Game speed gradually increases as the score gets higher

## Visual Style and Design
- Minimalist, clean design with high contrast colors
- Grid-based layout
- Simple animations for movement and eating
- Clear visual feedback for game over states

## Controls and User Input
- Arrow keys for movement (up, down, left, right)
- Spacebar to pause/resume the game
- Enter/Return key to restart after game over

## Win/Loss Conditions
- **Loss Condition**: Game ends when the snake collides with the wall or its own body
- **Win Condition**: No definitive win condition; the goal is to achieve the highest possible score

## Known Limitations
- No mobile touch controls in this version
- Simple graphics without advanced visual effects
- No save game functionality
- No difficulty settings (though game speed increases with score)

## Future Enhancements (Post-MVP)
- Add mobile touch controls
- Add difficulty levels
- Add power-ups (speed boost, invincibility, etc.)
- Add obstacles on the board
- Add multiplayer mode
