import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import SiteHeader from "@/components/SiteHeader";
import { isLocale, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale as Locale);
  const t = await getTranslations();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          {t("home.heroTitle")}
        </h1>
        <p className="mt-6 text-lg text-ink-muted">{t("home.heroSubtitle")}</p>
        <div className="mt-10">
          <Link
            href="/timeline"
            className="inline-flex items-center rounded-full bg-accent px-6 py-3 text-white font-medium hover:bg-accent-dark transition"
          >
            {t("home.enterTimeline")}
          </Link>
        </div>
      </main>
    </>
  );
}
