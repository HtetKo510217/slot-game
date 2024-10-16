# Slot Game with Leaderboard and Game History

This project is a simple slot game implemented using **React** and **RxJS**. Players can spin the reels, select paylines, adjust their bet, and view game history and leaderboard. The game also features winning line animations and the ability to track player performance over time.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Gameplay](#gameplay)
- [Leaderboard](#leaderboard)
- [Game History](#game-history)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Randomized Reel Spin**: Utilizes RxJS for randomizing symbols in the reels.
- **Adjustable Bet and Paylines**: Players can adjust the bet amount and select up to 25 paylines to play.
- **Winning Line Animation**: Winning paylines are highlighted dynamically to show the win.
- **Leaderboard**: A leaderboard tracks and displays the top 10 players based on their total winnings.
- **Game History**: Local storage is used to persist the player's game history, showing all recent results.
- **Responsive Design**: Designed to work seamlessly on both desktop and mobile devices.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/htetko510217/slot-game.git
    ```

2. Navigate to the project directory:

    ```bash
    cd slot-game
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Start the development server:

    ```bash
    npm run dev
    ```

5. Open your browser and navigate to `http://localhost:5173/`.

## Usage

1. Adjust your **bet amount** using the provided input.
2. Select the **number of paylines** to activate.
3. Click the **Spin** button to play.
4. If you win, the winning lines will be highlighted, and your balance will be updated accordingly.
5. View your results in the **Game History** and check your rank in the **Leaderboard**.

## Gameplay

- **Spinning the Reels**: Click the "Spin" button to randomize the symbols on each reel. The result is determined based on the active paylines.
- **Winning**: If a winning combination appears on one of your selected paylines, it will be highlighted, and your winnings will be calculated based on your bet amount.
- **Paylines**: You can play with 1 to 5 paylines. Winning combinations are checked against active paylines.

## Leaderboard

The leaderboard displays the top 10 players based on their cumulative winnings. It updates dynamically whenever a new winning result is registered. The leaderboard is stored locally, so it persists even after refreshing the browser.

## Game History

The game history section shows all your recent spins, including:
- Bet amount
- Number of active paylines
- Total winnings
- The result of the spin

This data is stored in the browser's local storage and can be viewed at any time.

## Technologies Used

- **React**: Frontend framework for building the UI components.
- **RxJS**: Used for handling the asynchronous reel spinning and randomization logic.
- **Local Storage**: For storing game history and leaderboard data.
- **CSS**: For the reel animations and responsive design.


## License

Distributed under the MIT License. See `LICENSE` for more information.
