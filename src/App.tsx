import React, { useState, useEffect } from "react";
import { BehaviorSubject, combineLatest, interval, Subject } from "rxjs";
import { map, takeUntil, finalize } from "rxjs/operators";
import "./App.css";

const symbols = ["🍒", "🍋", "🍇", "🔔", "⭐", "💎"];
const maxPaylines = 25;

const betAmount$ = new BehaviorSubject<number>(1);
const paylines$ = new BehaviorSubject<number>(1);
const spin$ = new Subject<void>();

const gameHistory$ = new BehaviorSubject<GameHistoryEntry[]>([]);
const leaderboard$ = new BehaviorSubject<LeaderboardEntry[]>([
  { name: "Player1", score: 100 },
  { name: "Player2", score: 150 },
  { name: "Player3", score: 200 },
]);

interface GameHistoryEntry {
  reels: string[][];
  win: boolean;
  winningLines: number[];
  payout: number;
}

interface LeaderboardEntry {
  name: string;
  score: number;
}

const App: React.FC = () => {
  const [reels, setReels] = useState<string[][]>(
    Array(5).fill(Array(3).fill("🍒"))
  );
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [betAmount, setBetAmount] = useState<number>(1);
  const [paylines, setPaylines] = useState<number>(1);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [payout, setPayout] = useState<number>(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const storedHistory = JSON.parse(
      localStorage.getItem("gameHistory") || "[]"
    );
    gameHistory$.next(storedHistory);
    gameHistory$.subscribe((history) => setGameHistory(history));

    leaderboard$.subscribe((leaderboard) => setLeaderboard(leaderboard));

    combineLatest([betAmount$, paylines$]).subscribe(([bet, lines]) => {
      setBetAmount(bet);
      setPaylines(lines);
    });
  }, []);

  const spinReels = () => {
    setSpinning(true);
    spin$.next();
    setWinningLines([]);
    setPayout(0);

    const reelSpin$ = interval(100).pipe(
      takeUntil(interval(2000)),
      map(() =>
        Array.from({ length: 5 }, () =>
          Array.from(
            { length: 3 },
            () => symbols[Math.floor(Math.random() * symbols.length)]
          )
        )
      ),
      finalize(() => {
        setSpinning(false);
        checkForWin();
      })
    );
    reelSpin$.subscribe((result) => setReels(result));
  };

  const checkForWin = () => {
    const winningLines: number[] = [];
    let totalPayout = 0;

    for (let i = 0; i < paylines; i++) {
      const line = getPayline(i);
      const symbols = line.map(([row, col]) => reels[col][row]);

      if (symbols.every((s) => s === symbols[0])) {
        winningLines.push(i);
        totalPayout += calculatePayout(symbols[0]);
      }
    }

    setWinningLines(winningLines);
    setPayout(totalPayout);

    const result: GameHistoryEntry = {
      reels,
      win: winningLines.length > 0,
      winningLines,
      payout: totalPayout,
    };
    gameHistory$.next([...gameHistory$.value, result]);
    localStorage.setItem("gameHistory", JSON.stringify(gameHistory$.value));

    if (totalPayout > 0) {
      updateLeaderboard(totalPayout);
    }
  };

  const getPayline = (index: number): [number, number][] => {
    const patterns: [number, number][][] = [
      [[0,0], [0,1], [0,2], [0,3], [0,4]], // Top row
      [[1,0], [1,1], [1,2], [1,3], [1,4]], // Middle row
      [[2,0], [2,1], [2,2], [2,3], [2,4]], // Bottom row
      [[0,0], [1,1], [2,2], [1,3], [0,4]], // V shape
      [[2,0], [1,1], [0,2], [1,3], [2,4]], // Inverted V shape
      [[0,0], [0,1], [1,2], [2,3], [2,4]], // Zigzag top-left to bottom-right
      [[2,0], [2,1], [1,2], [0,3], [0,4]], // Zigzag bottom-left to top-right
      [[1,0], [2,1], [1,2], [0,3], [1,4]], // W shape
      [[1,0], [0,1], [1,2], [2,3], [1,4]], // M shape
      [[0,0], [2,1], [0,2], [2,3], [0,4]], // Alternate top and bottom
      [[2,0], [0,1], [2,2], [0,3], [2,4]], // Alternate bottom and top
      [[1,0], [0,1], [0,2], [0,3], [1,4]], // U shape
      [[1,0], [2,1], [2,2], [2,3], [1,4]], // Inverted U shape
      [[0,0], [1,0], [2,0], [1,1], [0,2]], // Left arrow
      [[0,4], [1,4], [2,4], [1,3], [0,2]], // Right arrow
      [[2,0], [1,1], [1,2], [1,3], [2,4]], // Bottom corners
      [[0,0], [1,1], [1,2], [1,3], [0,4]], // Top corners
      [[1,0], [1,1], [0,2], [1,3], [1,4]], // Top center dip
      [[1,0], [1,1], [2,2], [1,3], [1,4]], // Bottom center dip
      [[0,0], [2,1], [1,2], [2,3], [0,4]], // X shape
      [[1,0], [0,1], [1,2], [0,3], [1,4]], // Alternating top-middle
      [[1,0], [2,1], [1,2], [2,3], [1,4]], // Alternating bottom-middle
      [[2,0], [1,1], [2,2], [1,3], [2,4]], // Bottom zigzag
      [[0,0], [1,1], [0,2], [1,3], [0,4]], // Top zigzag
      [[1,0], [1,1], [1,2], [1,3], [1,4]]  // Middle straight (fallback)
    ];
    return patterns[index % patterns.length];
  };

  const calculatePayout = (symbol: string): number => {
    const payouts: { [key: string]: number } = {
      "💎": 50,
      "⭐": 40,
      "🔔": 30,
      "🍇": 20,
      "🍋": 10,
      "🍒": 5,
    };
    return (payouts[symbol] || 0) * betAmount;
  };

  const updateLeaderboard = (newScore: number) => {
    const playerName = `Player${Math.floor(Math.random() * 1000)}`;
    leaderboard$.next(
      [...leaderboard$.value, { name: playerName, score: newScore }]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10) // Keep only top 10
    );
  };

  const clearHistory = () => {
    gameHistory$.next([]);
    localStorage.removeItem('gameHistory');
  }

  return (
    <div className="App">
      <h1>Slot Game</h1>
      <div className="game-container">
        <div className="reels">
          {reels.map((reel, colIndex) => (
            <div key={colIndex} className="reel">
              {reel.map((symbol, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`symbol ${
                    winningLines.some((line) =>
                      getPayline(line).some(
                        ([r, c]) => r === rowIndex && c === colIndex
                      )
                    )
                      ? "winning"
                      : ""
                  }`}
                >
                  {symbol}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="controls">
          <button onClick={spinReels} disabled={spinning}>
            {spinning ? "Spinning..." : "Spin"}
          </button>
          <div>
            Bet Amount:
            <input
              type="number"
              value={betAmount}
              onChange={(e) =>
                betAmount$.next(Math.max(1, parseInt(e.target.value)))
              }
              min={1}
            />
          </div>
          <div>
            Paylines:
            <input
              type="number"
              value={paylines}
              onChange={(e) =>
                paylines$.next(
                  Math.min(maxPaylines, Math.max(1, parseInt(e.target.value)))
                )
              }
              min={1}
              max={maxPaylines}
            />
          </div>
        </div>
        {payout > 0 && <div className="payout">You won: {payout}</div>}
        <div className="game-history">
          <h3>Game History</h3>
          <button onClick={() => setShowAll(!showAll)} className="show-button">
            {showAll ? "Show Latest 5" : "Show All"}
          </button>
          <button onClick={clearHistory} className="clear-button">
            Clear History
          </button>
          {gameHistory.length === 0 ? (
            <p>No game history available.</p>
          ) : (
            <ul>
              {(showAll ? gameHistory : gameHistory.slice(-5)).map(
                (entry, index) => (
                  <li key={index}>
                    {entry.win ? `Win (${entry.payout})` : "Lose"} - Lines:{" "}
                    {entry.winningLines.length > 0
                      ? entry.winningLines.join(", ")
                      : "None"}
                  </li>
                )
              )}
            </ul>
          )}
        </div>
        <div className="leaderboard">
          <h3>Leaderboard</h3>
          <ul>
            {leaderboard.map((player, index) => (
              <li key={index}>
                {player.name}: {player.score} points
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
