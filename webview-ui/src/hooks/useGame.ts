import { useState, useCallback, useRef } from 'react';
import type { Direction, TileData } from '../types';

let tileCounter = 0;
function nextId() { return ++tileCounter; }

const SIZE = 5;

function emptyGrid(): number[][] {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function randomTile(grid: number[][]): { r: number; c: number; value: number } | null {
  const empty: { r: number; c: number }[] = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (grid[r][c] === 0) empty.push({ r, c });
  if (!empty.length) return null;
  const { r, c } = empty[Math.floor(Math.random() * empty.length)];
  // 75% gera 2, 25% gera 4 — encher o tabuleiro mais rápido aumenta a dificuldade.
  return { r, c, value: Math.random() < 0.15 ? 4 : 2 };
}

function slideRow(row: number[]): { result: number[]; score: number; changed: boolean } {
  const nonZero = row.filter(v => v !== 0);
  const result: number[] = [];
  let score = 0;
  let i = 0;
  while (i < nonZero.length) {
    if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
      const merged = nonZero[i] * 2;
      result.push(merged);
      score += merged;
      i += 2;
    } else {
      result.push(nonZero[i]);
      i++;
    }
  }
  while (result.length < SIZE) result.push(0);
  const changed = result.some((v, i) => v !== row[i]);
  return { result, score, changed };
}

function transpose<T>(m: T[][]): T[][] {
  return m[0].map((_, ci) => m.map(row => row[ci]));
}

interface GameState {
  tiles: TileData[];
  score: number;
  gameOver: boolean;
  won: boolean;
}

function buildInitialState(): GameState {
  const grid = emptyGrid();
  const tiles: TileData[] = [];

  for (let i = 0; i < 2; i++) {
    const t = randomTile(grid);
    if (t) {
      grid[t.r][t.c] = t.value;
      tiles.push({ id: nextId(), row: t.r, col: t.c, value: t.value, isNew: true, isMerging: false });
    }
  }

  return { tiles, score: 0, gameOver: false, won: false };
}

export function useGame() {
  const [state, setState] = useState<GameState>(buildInitialState);
  const animatingRef = useRef(false);

  const move = useCallback((direction: Direction) => {
    if (animatingRef.current) return;

    setState(prev => {
      if (prev.gameOver || prev.won) return prev;

      // Build grid and id-grid from current tiles
      const grid = emptyGrid();
      const idGrid: (number | null)[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
      for (const t of prev.tiles) {
        grid[t.row][t.col] = t.value;
        idGrid[t.row][t.col] = t.id;
      }

      let workGrid = grid.map(r => [...r]);
      let workIds = idGrid.map(r => [...r]) as (number | null)[][];

      // Rotate/flip so we always slide left
      if (direction === 'up') {
        workGrid = transpose(workGrid);
        workIds = transpose(workIds);
      } else if (direction === 'down') {
        workGrid = transpose(workGrid).map(r => [...r].reverse());
        workIds = transpose(workIds).map(r => [...r].reverse());
      } else if (direction === 'right') {
        workGrid = workGrid.map(r => [...r].reverse());
        workIds = workIds.map(r => [...r].reverse());
      }

      let totalScore = 0;
      let anyChanged = false;
      const survivorMergedIds = new Set<number>(); // ids that got their value doubled
      const removedIds = new Set<number>();         // ids consumed by merges

      const newWorkGrid: number[][] = [];
      const newWorkIds: (number | null)[][] = [];

      for (let r = 0; r < SIZE; r++) {
        const { result, score, changed } = slideRow(workGrid[r]);
        totalScore += score;
        if (changed) anyChanged = true;
        newWorkGrid.push(result);

        // Track id movement
        const srcVals = workGrid[r].filter(v => v !== 0);
        const srcIds = workIds[r].filter(id => id !== null) as number[];
        const destIds: (number | null)[] = Array(SIZE).fill(null);

        let di = 0, si = 0;
        while (si < srcIds.length) {
          if (si + 1 < srcIds.length && srcVals[si] === srcVals[si + 1]) {
            destIds[di] = srcIds[si];
            survivorMergedIds.add(srcIds[si]);
            removedIds.add(srcIds[si + 1]);
            si += 2;
          } else {
            destIds[di] = srcIds[si];
            si++;
          }
          di++;
        }
        newWorkIds.push(destIds);
      }

      if (!anyChanged) return prev;

      // Un-rotate
      let finalGrid: number[][];
      let finalIds: (number | null)[][];
      if (direction === 'up') {
        finalGrid = transpose(newWorkGrid);
        finalIds = transpose(newWorkIds);
      } else if (direction === 'down') {
        finalGrid = transpose(newWorkGrid.map(r => [...r].reverse()));
        finalIds = transpose(newWorkIds.map(r => [...r].reverse()));
      } else if (direction === 'right') {
        finalGrid = newWorkGrid.map(r => [...r].reverse());
        finalIds = newWorkIds.map(r => [...r].reverse());
      } else {
        finalGrid = newWorkGrid;
        finalIds = newWorkIds;
      }

      // Build new tiles list (excluding removed ones, updating positions)
      const tileById = new Map(prev.tiles.map(t => [t.id, t]));
      const updatedTiles: TileData[] = [];
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          const id = finalIds[r][c];
          if (id !== null) {
            const orig = tileById.get(id)!;
            updatedTiles.push({
              ...orig,
              row: r,
              col: c,
              value: finalGrid[r][c],
              isNew: false,
              isMerging: survivorMergedIds.has(id),
            });
          }
        }
      }

      // Add new random tile
      const newGrid = finalGrid.map(r => [...r]);
      const newTilePos = randomTile(newGrid);
      if (newTilePos) {
        updatedTiles.push({
          id: nextId(),
          row: newTilePos.r,
          col: newTilePos.c,
          value: newTilePos.value,
          isNew: true,
          isMerging: false,
        });
      }

      const newScore = prev.score + totalScore;

      // Check win
      const won = updatedTiles.some(t => t.value >= 4096);

      // Check game over
      const checkGrid = emptyGrid();
      for (const t of updatedTiles) checkGrid[t.row][t.col] = t.value;
      let gameOver = false;
      const hasEmpty = checkGrid.some(row => row.some(v => v === 0));
      if (!hasEmpty) {
        let canMerge = false;
        outer: for (let r = 0; r < SIZE; r++) {
          for (let c = 0; c < SIZE; c++) {
            const v = checkGrid[r][c];
            if (c + 1 < SIZE && checkGrid[r][c + 1] === v) { canMerge = true; break outer; }
            if (r + 1 < SIZE && checkGrid[r + 1][c] === v) { canMerge = true; break outer; }
          }
        }
        if (!canMerge) gameOver = true;
      }

      return { tiles: updatedTiles, score: newScore, gameOver, won };
    });
  }, []);

  const reset = useCallback(() => {
    tileCounter = 0;
    setState(buildInitialState());
  }, []);

  return { tiles: state.tiles, score: state.score, gameOver: state.gameOver, won: state.won, move, reset };
}
