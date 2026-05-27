import { useRef, useEffect, useState } from 'react';
import { Tile } from './Tile';
import type { TileData } from '../types';

interface BoardProps {
  tiles: TileData[];
}

const SIZE = 5;
const GAP = 10;
const BORDER = 2;

export function Board({ tiles }: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(80);

  useEffect(() => {
    function update() {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        // Subtract border (2 sides) + padding (2 sides) + gaps between cells
        setCellSize((w - BORDER * 2 - GAP * (SIZE + 1)) / SIZE);
      }
    }
    update();
    const observer = new ResizeObserver(update);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const boardSize = cellSize * SIZE + GAP * (SIZE - 1);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 460,
      }}
    >
      {/* Background grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
          gap: GAP,
          background: '#2a2a2a',
          borderRadius: 10,
          padding: GAP,
          border: '2px solid #3a3a3a',
        }}
      >
        {Array.from({ length: SIZE * SIZE }).map((_, i) => (
          <div
            key={i}
            style={{ background: '#1a1a1a', borderRadius: 6, aspectRatio: '1', minHeight: 80 }}
          />
        ))}
      </div>

      {/* Tiles layer */}
      <div
        style={{
          position: 'absolute',
          top: GAP + BORDER,
          left: GAP + BORDER,
          width: boardSize,
          height: boardSize,
        }}
      >
        {tiles.map(tile => (
          <Tile key={tile.id} tile={tile} cellSize={cellSize} />
        ))}
      </div>
    </div>
  );
}
