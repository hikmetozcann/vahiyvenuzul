import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { loadCorpus } from "@/lib/content";
import { tr } from "@/lib/i18n-fields";
import { isLocale, type Locale } from "@/i18n/config";

export async function generateStaticParams() {
  const { events } = loadCorpus();
  return events.map((e) => ({ id: e.id }));
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  if (!isLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale as Locale);
  const locale = rawLocale as Locale;
  const t = await getTranslations();

  const corpus = loadCorpus();
  const event = corpus.events.find((e) => e.id === id);
  if (!event) notFound();

  const place = event.placeId
    ? corpus.places.find((p) => p.id === event.placeId)
    : undefined;
  const people = event.peopleIds
    .map((pid) => corpus.people.find((p) => p.id === pid))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  const sourceWorks = new Map(corpus.sources.map((s) => [s.id, s]));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12 space-y-8">
        <header>
          <div className="text-xs uppercase tracking-widest text-ink-muted">
            {event.type}
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {tr(event.title, locale)}
          </h1>
          <p className="mt-3 text-ink-muted">{tr(event.summary, locale)}</p>
        </header>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium">{t("event.date")}</dt>
            <dd className="text-ink-muted">
              {[
                event.date.hijri && `${event.date.hijri} H`,
                event.date.gregorianYear && `${event.date.gregorianYear} M`,
                event.date.approximate && "(yaklaşık)",
              ]
                .filter(Boolean)
                .join(" · ")}
            </dd>
          </div>
          {place && (
            <div>
              <dt className="font-medium">{t("event.location")}</dt>
              <dd className="text-ink-muted">{tr(place.name, locale)}</dd>
            </div>
          )}
          {people.length > 0 && (
            <div className="md:col-span-2">
              <dt className="font-medium">{t("event.people")}</dt>
              <dd className="text-ink-muted">
                {people.map((p) => tr(p.name, locale)).join(" · ")}
              </dd>
            </div>
          )}
          {event.ayahReferences.length > 0 && (
            <div className="md:col-span-2">
              <dt className="font-medium">{t("event.verses")}</dt>
              <dd className="text-ink-muted">{event.ayahReferences.join(", ")}</dd>
            </div>
          )}
        </dl>

        {event.description && (
          <section>
            <p className="whitespace-pre-line leading-relaxed">
              {tr(event.description, locale)}
            </p>
          </section>
        )}

        {event.occasionOfRevelation && (
          <section className="rounded-lg border border-accent/30 bg-accent/5 p-5">
            <h2 className="font-semibold mb-2">{t("event.occasion")}</h2>
            <p className="whitespace-pre-line leading-relaxed">
              {tr(event.occasionOfRevelation, locale)}
            </p>
          </section>
        )}

        <section>
          <h2 className="font-semibold mb-3">{t("event.sources")}</h2>
          <ul className="space-y-2 text-sm">
            {event.sources.map((c, i) => {
              const work = sourceWorks.get(c.sourceId);
              const ref = [
                c.volume && `c. ${c.volume}`,
                c.page && `s. ${c.page}`,
                c.hadithNumber && `h. ${c.hadithNumber}`,
                c.ayahReference,
              ]
                .filter(Boolean)
                .join(", ");
              return (
                <li key={i} className="flex items-baseline gap-3">
                  <span className="rounded bg-ink/5 px-2 py-0.5 text-xs uppercase tracking-wide">
                    {t(`event.grade_${c.grade}` as never)}
                  </span>
                  <span>
                    <span className="font-medium">
                      {work ? tr(work.title, locale) : c.sourceId}
                    </span>
                    {ref && <span className="text-ink-muted"> — {ref}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </>
  );
}
