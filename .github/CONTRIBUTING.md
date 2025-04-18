# Contributing to Games

Thank you for your interest in contributing a new game! Please follow these steps:

1.  **Fork the Repository:**
    Start by forking this repository to your own GitHub account.

2.  **Clone Your Fork:**
    Clone your forked repository to your local machine.

3.  **Create a Branch (Optional):**
    You can either create a new branch for your game (e.g., `git checkout -b cool-game`) or work directly on your fork's `main` branch.

You can now start "vibe coding" your game!

---

**Pull Request Requirements:**

Your Pull Request (PR) should meet the following criteria:

- **Game Directory:**
  - A new directory for your game must be created inside the `games/` directory.
  - The directory name must consist of exactly **two lowercase words** separated by a single hyphen (e.g., `games/cool-game/`).

- **Required Files:**
  - The new game directory must contain the following five files:
    - `README.md`: Describes the game, how to play, full GDD etc.
    - `style.css`: Contains all CSS styles for the game.
    - `index.html`: The main HTML structure.
    - `game.js`: JavaScript logic for the game.
    - `game.json`: Game metadata.

> [!IMPORTANT]
> The PR must include *only* the new game directory with all its five files.