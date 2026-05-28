"use client";

import type { HistoricalEvent } from "@/schemas";
import SceneCaveHira from "./SceneCaveHira";
import SceneMecca from "./SceneMecca";
import SceneMedina from "./SceneMedina";
import SceneJourney from "./SceneJourney";
import SceneDefault from "./SceneDefault";

/**
 * Maps a given event to its visual scene. New illustrations are added
 * here; falls back to SceneDefault if no specific scene matches.
 */
export function pickScene(event: HistoricalEvent): React.ComponentType<{ progress?: number }> {
  // Special-case: hijra event uses the journey scene even if placeId is medina
  if (event.type === "migration" || event.id === "hijra") return SceneJourney;

  switch (event.placeId) {
    case "hira-cave":
      return SceneCaveHira;
    case "mecca":
      return SceneMecca;
    case "medina":
      return SceneMedina;
    default:
      return SceneDefault;
  }
}
