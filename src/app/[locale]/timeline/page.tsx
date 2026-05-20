import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import TimelineCanvas from "@/components/timeline/TimelineCanvas";
import { loadCorpus } from "@/lib/content";
import { sortByTimeline } from "@/lib/timeline";
import { isLocale, type Locale } from "@/i18n/config";

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale as Locale);
  const t = await getTranslations();

  const { events, people, places, sources } = loadCorpus();
  const ordered = sortByTimeline(events);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {t("timeline.title")}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {t("home.heroSubtitle")}
          </p>
        </div>
        <TimelineCanvas
          events={ordered}
          people={people}
          places={places}
          sources={sources}
        />
      </main>
    </>
  );
}
