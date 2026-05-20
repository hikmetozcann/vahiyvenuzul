import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Timeline from "@/components/Timeline";
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

  const { events } = loadCorpus();
  const ordered = sortByTimeline(events);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight mb-8">
          {t("timeline.title")}
        </h1>
        <Timeline events={ordered} />
      </main>
    </>
  );
}
