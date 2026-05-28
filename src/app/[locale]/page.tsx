import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import SiteHeader from "@/components/SiteHeader";
import { isLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { loadCorpus } from "@/lib/content";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale as Locale);
  const t = await getTranslations();
  const { events, sources, places } = loadCorpus();

  const stats = [
    { label: t("home.statEvents"), value: events.length },
    { label: t("home.statPlaces"), value: places.length },
    { label: t("home.statSources"), value: sources.length },
  ];

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pt-16 sm:pt-24 pb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-muted mb-4">
            {t("site.tagline")}
          </p>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
            {t("home.heroTitle")}
          </h1>
          <p className="mt-6 text-lg text-ink-muted max-w-2xl leading-relaxed">
            {t("home.heroSubtitle")}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/timeline"
              className="inline-flex items-center rounded-full bg-ink text-parchment px-5 py-2.5 text-sm font-medium hover:bg-ink-muted transition"
            >
              {t("home.enterTimeline")}
            </Link>
            <Link
              href="/sources"
              className="inline-flex items-center rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink-muted hover:text-ink hover:border-ink/40 transition"
            >
              {t("nav.sources")}
            </Link>
          </div>

          {/* Stats strip */}
          <dl className="mt-16 grid grid-cols-3 gap-6 max-w-xl">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-xs uppercase tracking-widest text-ink-muted">
                  {s.label}
                </dt>
                <dd className="mt-1 text-2xl sm:text-3xl font-semibold tabular-nums">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Two-mode preview cards */}
        <section className="mx-auto max-w-4xl px-6 pb-24 grid sm:grid-cols-2 gap-6">
          <Link
            href="/timeline"
            className="group rounded-2xl border border-ink/10 p-6 hover:border-ink/30 transition"
          >
            <div className="text-xs uppercase tracking-widest text-ink-muted">
              {t("home.modeTimelineKicker")}
            </div>
            <h3 className="mt-2 text-xl font-semibold">{t("home.modeTimelineTitle")}</h3>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              {t("home.modeTimelineDesc")}
            </p>
            <div className="mt-4 text-sm text-accent group-hover:underline">
              {t("home.modeOpen")} →
            </div>
          </Link>
          <Link
            href="/timeline"
            className="group rounded-2xl border border-ink/10 p-6 hover:border-ink/30 transition bg-gradient-to-br from-parchment to-[#f0e7d0]"
          >
            <div className="text-xs uppercase tracking-widest text-ink-muted">
              {t("home.modeJourneyKicker")}
            </div>
            <h3 className="mt-2 text-xl font-semibold">{t("home.modeJourneyTitle")}</h3>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              {t("home.modeJourneyDesc")}
            </p>
            <div className="mt-4 text-sm text-accent group-hover:underline">
              {t("home.modeOpen")} →
            </div>
          </Link>
        </section>
      </main>
    </>
  );
}
