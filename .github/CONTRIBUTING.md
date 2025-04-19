# Contributing to Games

Thanks for you interest in contributing to our games repository! There are two main ways you can contribute:
1.  **Add a New Game:**
    If you want try your hand at vibe coding a new game. Don't read the code, accept the diff, embrace the exponential.
    You don't need to write all the prompt yourself, a couple of them are already in the repository.

2. **Improve the repository:**
   If you want to improve the rest of the repository (e.g. fixing typos, improving the README, improve the game guidelines, etc.). This is pretty much like any other open source project.

---

## Add a New Game

Thank you for your interest in contributing a new game! Please follow these steps:

1.  **Fork the Repository:**
    Start by forking this repository to your own GitHub account.

2.  **Clone Your Fork:**
    Clone your forked repository to your local machine.

3.  **Create a Branch (Optional):**
    You can either create a new branch for your game (e.g., `git checkout -b cool-game`) or work directly on your fork's `main` branch.

You can now start "vibe coding" your game!

<div align="center">
  <video alt="add-new-game" src="https://github.com/user-attachments/assets/754dd0c0-9493-46c3-9675-7420d8691991"></video>
</div>

#### Prompts

<details>
<summary>Roo code format</summary>

````
Create a game following the @/.github/game-guidelines-instructions.md 
Do not create games similar to the ones in @/games/manifest.json 

### Example Game Template

Here is an example template for a game folder:

- @/games/_example/index.html 
- @/games/_example/style.css 
- @/games/_example/game.js 
- @/games/_example/game.json 

If you want to use code from _example template, you must copy the files to your game folder and modify them as needed.

---

It's **really** important to follow the steps described in the @/.github/development-process-instructions.md 

Remember to follow the development process in order:
1. Brainstorm about game ideas (**idea generation**).
2. Write the **game design document** in the `README.md`.
3. Implement the game (**development**).
````

</details>

<details>
<summary><em>Other prompts format ...</em></summary>

````
````

</details>


---

Your Pull Request (PR) for adding a new game **MUST** meet the following criteria:

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
