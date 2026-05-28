/**
 * Equirectangular projection for the Hijaz / Red Sea region. Picks bounds
 * wide enough to include Habashah (Aksum, Ethiopia) and far enough north
 * to fit Jerusalem (later, when we add that place). The SVG viewBox uses
 * these bounds 1:1; anything outside is offscreen on the basemap.
 *
 * Coordinate system inside the SVG:
 *   - X grows east, Y grows south
 *   - Origin (0, 0) at top-left
 *   - viewBox: 0 0 MAP_WIDTH MAP_HEIGHT
 */

export const LNG_MIN = 32;
export const LNG_MAX = 58;
export const LAT_MIN = 11;
export const LAT_MAX = 34;

/** Logical SVG dimensions; aspect ratio matches lng/lat span approximately. */
export const MAP_WIDTH = 1300;
export const MAP_HEIGHT = 1150;

export function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * MAP_WIDTH;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * MAP_HEIGHT;
  return { x, y };
}

/** Inverse — useful for zoom-around-pointer math. */
export function unproject(x: number, y: number): { lat: number; lng: number } {
  const lng = LNG_MIN + (x / MAP_WIDTH) * (LNG_MAX - LNG_MIN);
  const lat = LAT_MAX - (y / MAP_HEIGHT) * (LAT_MAX - LAT_MIN);
  return { lat, lng };
}

/**
 * Builds a smooth SVG quadratic curve path between two projected points,
 * with a configurable lateral bulge. Used for route lines so they don't
 * look like a ruler-drawn straight line.
 */
export function curvedPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  bulge = 0.18,
): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  // Perpendicular offset for the control point
  const perpX = -dy;
  const perpY = dx;
  const len = Math.hypot(perpX, perpY) || 1;
  const ctrlX = midX + (perpX / len) * Math.hypot(dx, dy) * bulge;
  const ctrlY = midY + (perpY / len) * Math.hypot(dx, dy) * bulge;
  return `M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`;
}
