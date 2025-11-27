# Wordle Challenge

## Problem Description

Build a clone of the popular word game **Wordle**, where players have six attempts to guess a five-letter word. Feedback is given for each guess in the form of colored tiles indicating when letters match or occupy the correct position.

## Requirements

- A random five-letter word is chosen every time the app launches.
- Players have six attempts to guess the word.
- After each guess, the game provides feedback:
  - **Correct (Green)**: The letter is in the correct position.
  - **Present (Yellow)**: The letter is in the word but in the wrong position.
  - **Absent (Dark Gray)**: The letter is not in the word at all.
- After the game ends, display a "Reset" button so the player can play again with a new randomly-chosen word.
- No need to validate if a guess is a valid English word.

## Colors

- **Default (Light Gray)**: `#121214`
- **Correct (Green)**: `#6aaa64`
- **Present (Yellow)**: `#c9b458`
- **Absent (Dark Gray)**: `#787c7e`