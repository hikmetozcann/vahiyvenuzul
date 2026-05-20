import type { EventType } from "@/schemas";

/**
 * Single source of truth for event-type colors. Used by timeline nodes,
 * legend chips, filter chips, and detail headers — so swapping a palette
 * is a one-file change.
 *
 * Color choices intentionally restrained: parchment background pairs with
 * desaturated, scholarly hues. No neons.
 */
export const TYPE_COLORS: Record<EventType, { fill: string; ring: string; chip: string; text: string }> = {
  revelation:   { fill: "#0d7c66", ring: "#0d7c6633", chip: "#e8f3f0", text: "#075e4d" },
  battle:       { fill: "#9f1239", ring: "#9f123933", chip: "#fde7ec", text: "#7c0e2e" },
  migration:    { fill: "#b45309", ring: "#b4530933", chip: "#fdf1dd", text: "#854006" },
  treaty:       { fill: "#0369a1", ring: "#0369a133", chip: "#e1f0f9", text: "#03507e" },
  delegation:   { fill: "#4338ca", ring: "#4338ca33", chip: "#e9e8f8", text: "#372c9c" },
  life:         { fill: "#525252", ring: "#52525233", chip: "#eeeeec", text: "#3f3f3f" },
  miracle:      { fill: "#7e22ce", ring: "#7e22ce33", chip: "#f1e3fa", text: "#651ba5" },
  birth:        { fill: "#15803d", ring: "#15803d33", chip: "#e1f3e7", text: "#0f5d2d" },
  death:        { fill: "#1f2937", ring: "#1f293733", chip: "#e6e8ea", text: "#1f2937" },
  marriage:     { fill: "#be185d", ring: "#be185d33", chip: "#fbe3ee", text: "#971349" },
  conversion:   { fill: "#0e7490", ring: "#0e749033", chip: "#defafa", text: "#0a5b73" },
  proclamation: { fill: "#92400e", ring: "#92400e33", chip: "#fce7c3", text: "#6c2f08" },
  persecution:  { fill: "#7f1d1d", ring: "#7f1d1d33", chip: "#fbe1e1", text: "#5e1414" },
  hajj:         { fill: "#0d7c66", ring: "#0d7c6633", chip: "#e8f3f0", text: "#075e4d" },
  umrah:        { fill: "#10b981", ring: "#10b98133", chip: "#ddf6ec", text: "#0a7853" },
  diplomatic:   { fill: "#4f46e5", ring: "#4f46e533", chip: "#e8e7fa", text: "#3d36b7" },
};

/** Subset shown by default in the filter strip — the most common types. */
export const PRIMARY_FILTER_TYPES: EventType[] = [
  "revelation",
  "battle",
  "migration",
  "treaty",
  "life",
];
