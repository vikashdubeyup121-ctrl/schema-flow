export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rectangle extends Point, Size {}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
