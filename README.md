# 4096 Game

A 5×5 sliding puzzle game playable directly inside VS Code — no browser needed.

## How to play

Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`), type **Open 4096 Game** and press Enter. You can also click the **4096** button in the status bar.

Use the **arrow keys** to slide all tiles in a direction. Tiles with the same value merge into one. Keep merging until you reach the **4096** tile to win.

- Every move spawns a new **2** tile in a random empty cell
- The game ends when the board is full and no merges are possible
- After winning you can keep playing to chase a higher score
- Your best score is saved across sessions

## Features

- 5×5 grid for extra challenge
- Smooth tile slide animations
- Score and best score tracking (persisted globally)
- Status bar shortcut for quick access
- Fully keyboard-driven

## Requirements

VS Code 1.85 or later.

## Extension settings

This extension has no configurable settings.

## Release notes

### 0.0.1

Initial release.
