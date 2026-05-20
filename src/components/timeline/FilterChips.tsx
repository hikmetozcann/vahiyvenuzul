"use client";

import { useTranslations } from "next-intl";
import { TYPE_COLORS, PRIMARY_FILTER_TYPES } from "@/lib/event-style";
import type { EventType } from "@/schemas";

type Props = {
  active: Set<EventType> | "all";
  onChange: (next: Set<EventType> | "all") => void;
};

const FILTER_KEY: Record<EventType, string> = {
  revelation: "timeline.filterRevelation",
  battle: "timeline.filterBattle",
  migration: "timeline.filterMigration",
  treaty: "timeline.filterTreaty",
  life: "timeline.filterLife",
  delegation: "timeline.filterLife",
  miracle: "timeline.filterLife",
  birth: "timeline.filterLife",
  death: "timeline.filterLife",
  marriage: "timeline.filterLife",
  conversion: "timeline.filterLife",
  proclamation: "timeline.filterLife",
  persecution: "timeline.filterLife",
  hajj: "timeline.filterLife",
  umrah: "timeline.filterLife",
  diplomatic: "timeline.filterLife",
};

export default function FilterChips({ active, onChange }: Props) {
  const t = useTranslations();
  const isAll = active === "all";

  function toggle(type: EventType) {
    if (isAll) {
      const set = new Set<EventType>(PRIMARY_FILTER_TYPES);
      set.delete(type);
      onChange(set);
      return;
    }
    const next = new Set(active);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    if (next.size === 0) {
      onChange("all");
      return;
    }
    onChange(next);
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button
        onClick={() => onChange("all")}
        className={`text-xs font-medium rounded-full px-3 py-1.5 transition border ${
          isAll
            ? "bg-ink text-parchment border-ink"
            : "bg-transparent text-ink-muted border-ink/15 hover:border-ink/40"
        }`}
      >
        {t("timeline.filterAll")}
      </button>
      {PRIMARY_FILTER_TYPES.map((type) => {
        const c = TYPE_COLORS[type];
        const enabled = isAll || active.has(type);
        return (
          <button
            key={type}
            onClick={() => toggle(type)}
            className={`text-xs font-medium rounded-full px-3 py-1.5 transition border inline-flex items-center gap-1.5 ${
              enabled ? "" : "opacity-40"
            }`}
            style={{
              background: enabled ? c.chip : "transparent",
              borderColor: enabled ? `${c.fill}44` : "#0f172a26",
              color: enabled ? c.text : "#475569",
            }}
            aria-pressed={enabled}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: c.fill }}
            />
            {t(FILTER_KEY[type] as never)}
          </button>
        );
      })}
    </div>
  );
}
