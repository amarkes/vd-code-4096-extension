import { useState, useEffect, useCallback, useRef } from 'react';
import { vscode } from './vscode';
import { Board } from './components/Board';
import { useGame } from './hooks/useGame';
import type { Direction } from './types';

export function App() {
  const { tiles, score, gameOver, won, move, reset } = useGame();
  const [bestScore, setBestScore] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const countedRef = useRef(false);

  useEffect(() => {
    vscode.postMessage({ command: 'getBestScore' });
    vscode.postMessage({ command: 'getStats' });
    const handler = (event: MessageEvent) => {
      const msg = event.data;
      if (msg.command === 'bestScore') setBestScore(msg.score as number);
      if (msg.command === 'stats') {
        setWins(msg.wins as number);
        setLosses(msg.losses as number);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      vscode.postMessage({ command: 'saveScore', score });
    }
  }, [score, bestScore]);

  useEffect(() => {
    if (won && !countedRef.current) {
      countedRef.current = true;
      setWins(prev => {
        const next = prev + 1;
        vscode.postMessage({ command: 'saveWins', wins: next });
        return next;
      });
    }
  }, [won]);

  useEffect(() => {
    if (gameOver && !countedRef.current) {
      countedRef.current = true;
      setLosses(prev => {
        const next = prev + 1;
        vscode.postMessage({ command: 'saveLosses', losses: next });
        return next;
      });
    }
  }, [gameOver]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    const map: Record<string, Direction> = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    };
    const dir = map[e.key];
    if (dir) {
      e.preventDefault();
      if (!gameOver && (!won || keepPlaying)) move(dir);
    }
  }, [move, gameOver, won, keepPlaying]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  function handleNewGame() {
    reset();
    setKeepPlaying(false);
    countedRef.current = false;
  }

  const showWinOverlay = won && !keepPlaying;

  return (
    <div className="app">
      <h1 className="title">4096</h1>
      <p className="subtitle">Reach the <strong>4096</strong> tile!</p>

      <div className="header">
        <div className="score-group">
          <div className="score-box">
            <div className="score-label">Score</div>
            <div className="score-value score-current">{score}</div>
          </div>
          <div className="score-box">
            <div className="score-label">Best</div>
            <div className="score-value score-best">{bestScore}</div>
          </div>
          <div className="score-box">
            <div className="score-label">Wins</div>
            <div className="score-value score-wins">{wins}</div>
          </div>
          <div className="score-box">
            <div className="score-label">Losses</div>
            <div className="score-value score-losses">{losses}</div>
          </div>
        </div>
        <button className="btn-new" onClick={handleNewGame}>New Game</button>
      </div>

      <div className="grid-wrapper">
        <Board tiles={tiles} />
        {showWinOverlay && (
          <div className="overlay overlay-win">
            <div className="overlay-title">You Win!</div>
            <div className="overlay-sub">You reached 4096!</div>
            <div className="overlay-buttons">
              <button className="overlay-btn overlay-btn-secondary" onClick={() => setKeepPlaying(true)}>Keep Playing</button>
              <button className="overlay-btn" onClick={handleNewGame}>New Game</button>
            </div>
          </div>
        )}
        {gameOver && (
          <div className="overlay overlay-over">
            <div className="overlay-title">Game Over</div>
            <div className="overlay-sub">No more moves. Try again!</div>
            <button className="overlay-btn" onClick={handleNewGame}>New Game</button>
          </div>
        )}
      </div>

      <p className="hint">Use arrow keys · Reach 4096 to win</p>
    </div>
  );
}
