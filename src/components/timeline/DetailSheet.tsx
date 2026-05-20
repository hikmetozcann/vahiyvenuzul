"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import type { HistoricalEvent, Person, Place, SourceWork } from "@/schemas";
import { tr } from "@/lib/i18n-fields";
import { TYPE_COLORS } from "@/lib/event-style";
import type { Locale } from "@/i18n/config";

type Props = {
  event: HistoricalEvent | null;
  people: Map<string, Person>;
  places: Map<string, Place>;
  sources: Map<string, SourceWork>;
  onClose: () => void;
};

export default function DetailSheet({ event, people, places, sources, onClose }: Props) {
  const locale = useLocale() as Locale;
  const t = useTranslations();

  return (
    <AnimatePresence>
      {event && (
        <>
          <motion.div
            className="fixed inset-0 z-30 bg-ink/20 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-label={tr(event.title, locale)}
            className="fixed z-40 bg-parchment border-ink/10 shadow-xl overflow-y-auto
              inset-x-0 bottom-0 top-auto h-[82vh] rounded-t-2xl border-t
              md:inset-y-0 md:right-0 md:left-auto md:top-0 md:bottom-0 md:h-auto md:w-[460px]
              md:rounded-none md:border-l md:border-t-0"
            initial={{ y: "100%", x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: "100%", x: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <DetailContent
              event={event}
              people={people}
              places={places}
              sources={sources}
              locale={locale}
              t={t}
              onClose={onClose}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailContent({
  event,
  people,
  places,
  sources,
  locale,
  t,
  onClose,
}: {
  event: HistoricalEvent;
  people: Map<string, Person>;
  places: Map<string, Place>;
  sources: Map<string, SourceWork>;
  locale: Locale;
  t: ReturnType<typeof useTranslations>;
  onClose: () => void;
}) {
  const c = TYPE_COLORS[event.type] ?? TYPE_COLORS.life;
  const place = event.placeId ? places.get(event.placeId) : undefined;
  const relatedPeople = event.peopleIds
    .map((id) => people.get(id))
    .filter((p): p is Person => Boolean(p));

  return (
    <div className="px-6 py-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider"
          style={{ background: c.chip, color: c.text }}
        >
          {event.type}
        </span>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 hover:bg-ink/5 transition"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <h2 className="text-2xl font-semibold tracking-tight">
        {tr(event.title, locale)}
      </h2>
      <p className="mt-2 text-ink-muted">{tr(event.summary, locale)}</p>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-ink-muted text-xs uppercase tracking-wider">
            {t("event.date")}
          </dt>
          <dd className="mt-0.5">
            {[
              event.date.hijri && `${event.date.hijri} H`,
              event.date.gregorianYear && `${event.date.gregorianYear} M`,
            ]
              .filter(Boolean)
              .join(" / ")}
            {event.date.approximate && (
              <span className="ms-1 text-ink-muted text-xs">(yaklaşık)</span>
            )}
          </dd>
        </div>
        {place && (
          <div>
            <dt className="text-ink-muted text-xs uppercase tracking-wider">
              {t("event.location")}
            </dt>
            <dd className="mt-0.5">{tr(place.name, locale)}</dd>
          </div>
        )}
        {relatedPeople.length > 0 && (
          <div className="col-span-2">
            <dt className="text-ink-muted text-xs uppercase tracking-wider">
              {t("event.people")}
            </dt>
            <dd className="mt-0.5">
              {relatedPeople.map((p) => tr(p.name, locale)).join(" · ")}
            </dd>
          </div>
        )}
        {event.ayahReferences.length > 0 && (
          <div className="col-span-2">
            <dt className="text-ink-muted text-xs uppercase tracking-wider">
              {t("event.verses")}
            </dt>
            <dd className="mt-0.5 font-mono">
              {event.ayahReferences.join(", ")}
            </dd>
          </div>
        )}
      </dl>

      {event.description && (
        <section className="mt-6">
          <p className="whitespace-pre-line leading-relaxed text-[15px]">
            {tr(event.description, locale)}
          </p>
        </section>
      )}

      {event.occasionOfRevelation && (
        <section
          className="mt-6 rounded-xl border p-4"
          style={{ borderColor: `${c.fill}33`, background: c.chip }}
        >
          <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider" style={{ color: c.text }}>
            {t("event.occasion")}
          </h3>
          <p className="whitespace-pre-line leading-relaxed text-[15px]">
            {tr(event.occasionOfRevelation, locale)}
          </p>
        </section>
      )}

      <section className="mt-6">
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-ink-muted">
          {t("event.sources")}
        </h3>
        <ul className="space-y-2 text-sm">
          {event.sources.map((cit, i) => {
            const work = sources.get(cit.sourceId);
            const ref = [
              cit.volume && `c. ${cit.volume}`,
              cit.page && `s. ${cit.page}`,
              cit.hadithNumber && `h. ${cit.hadithNumber}`,
              cit.ayahReference,
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <li key={i} className="flex items-baseline gap-3">
                <span className="rounded bg-ink/5 px-2 py-0.5 text-[10px] uppercase tracking-wide whitespace-nowrap">
                  {t(`event.grade_${cit.grade}` as never)}
                </span>
                <span>
                  <span className="font-medium">
                    {work ? tr(work.title, locale) : cit.sourceId}
                  </span>
                  {ref && <span className="text-ink-muted"> — {ref}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
