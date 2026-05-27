import type { TileData } from '../types';

const TILE_COLORS: Record<number, { bg: string; fg: string }> = {
  2:    { bg: '#3d3d3d', fg: '#f0f0f0' },
  4:    { bg: '#4a4020', fg: '#f0e68c' },
  8:    { bg: '#8b4513', fg: '#fff' },
  16:   { bg: '#a0522d', fg: '#fff' },
  32:   { bg: '#b5651d', fg: '#fff' },
  64:   { bg: '#cc4400', fg: '#fff' },
  128:  { bg: '#3a6186', fg: '#fff' },
  256:  { bg: '#2e86ab', fg: '#fff' },
  512:  { bg: '#1a6b4a', fg: '#fff' },
  1024: { bg: '#4b0082', fg: '#f0c0ff' },
  2048: { bg: '#6a0dad', fg: '#f0e0ff' },
  4096: { bg: '#f0c000', fg: '#1e1e1e' },
};

const GAP = 10; // px between cells

function fontSize(value: number): string {
  if (value >= 1024) return '1.1rem';
  if (value >= 128)  return '1.4rem';
  return '1.8rem';
}

interface TileProps {
  tile: TileData;
  cellSize: number;
}

export function Tile({ tile, cellSize }: TileProps) {
  const { row, col, value, isNew, isMerging } = tile;
  const colors = TILE_COLORS[value] ?? { bg: '#f0c000', fg: '#1e1e1e' };

  const x = col * (cellSize + GAP);
  const y = row * (cellSize + GAP);

  return (
    // Outer div: only handles position sliding (transform transition)
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: cellSize,
        height: cellSize,
        transform: `translate(${x}px, ${y}px)`,
        transition: 'transform 0.15s ease-out',
        willChange: 'transform',
        zIndex: isMerging ? 2 : 1,
      }}
    >
      {/* Inner div: only handles appear/merge animations (scale/opacity) */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: colors.bg,
          color: colors.fg,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: fontSize(value),
          animation: isNew ? 'tile-appear 0.15s ease' : isMerging ? 'tile-merge 0.2s ease' : 'none',
        }}
      >
        {value}
      </div>
    </div>
  );
}
