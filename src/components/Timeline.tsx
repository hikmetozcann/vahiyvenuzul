"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { HistoricalEvent } from "@/schemas";
import { tr } from "@/lib/i18n-fields";
import type { Locale } from "@/i18n/config";

type Props = {
  events: HistoricalEvent[];
};

const TYPE_COLORS: Record<string, string> = {
  revelation: "bg-emerald-100 border-emerald-300 text-emerald-900",
  battle: "bg-rose-100 border-rose-300 text-rose-900",
  migration: "bg-amber-100 border-amber-300 text-amber-900",
  treaty: "bg-sky-100 border-sky-300 text-sky-900",
  life: "bg-stone-100 border-stone-300 text-stone-900",
};

export default function Timeline({ events }: Props) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const [filter, setFilter] = useState<string>("all");

  const visible = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((e) => e.type === filter);
  }, [events, filter]);

  const filters = [
    { id: "all", label: t("timeline.filterAll") },
    { id: "revelation", label: t("timeline.filterRevelation") },
    { id: "battle", label: t("timeline.filterBattle") },
    { id: "migration", label: t("timeline.filterMigration") },
    { id: "treaty", label: t("timeline.filterTreaty") },
    { id: "life", label: t("timeline.filterLife") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-1.5 text-sm border transition ${
              filter === f.id
                ? "bg-ink text-parchment border-ink"
                : "bg-transparent text-ink-muted border-ink/20 hover:border-ink/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ol className="relative border-s border-ink/15 ms-4 space-y-6">
        {visible.map((event, idx) => {
          const color = TYPE_COLORS[event.type] ?? TYPE_COLORS.life;
          return (
            <motion.li
              key={event.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.4) }}
              className="ms-6"
            >
              <span className="absolute -start-1.5 mt-2 w-3 h-3 rounded-full bg-accent ring-4 ring-parchment" />
              <Link
                href={`/event/${event.id}` as never}
                className={`block rounded-lg border p-4 transition hover:shadow-sm ${color}`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-semibold">{tr(event.title, locale)}</h3>
                  <span className="text-xs opacity-75 whitespace-nowrap">
                    {formatDate(event)}
                  </span>
                </div>
                <p className="mt-2 text-sm opacity-90">{tr(event.summary, locale)}</p>
              </Link>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

function formatDate(event: HistoricalEvent): string {
  const d = event.date;
  const parts: string[] = [];
  if (d.hijri) parts.push(`${d.hijri} H`);
  if (d.gregorianYear) parts.push(`${d.gregorianYear} M`);
  return parts.join(" / ");
}
