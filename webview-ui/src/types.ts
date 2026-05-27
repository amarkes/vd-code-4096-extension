export type Direction = 'up' | 'down' | 'left' | 'right';

export interface TileData {
  id: number;
  row: number;
  col: number;
  value: number;
  isNew: boolean;
  isMerging: boolean;
}
