import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { loadCorpus } from "@/lib/content";
import { tr } from "@/lib/i18n-fields";
import { isLocale, type Locale } from "@/i18n/config";

export default async function SourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  setRequestLocale(rawLocale as Locale);
  const locale = rawLocale as Locale;
  const t = await getTranslations();

  const { sources } = loadCorpus();
  const grouped = sources.reduce<Record<string, typeof sources>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight mb-8">
          {t("nav.sources")}
        </h1>
        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, items]) => (
            <section key={cat}>
              <h2 className="text-sm uppercase tracking-widest text-ink-muted mb-3">
                {cat}
              </h2>
              <ul className="space-y-3">
                {items.map((s) => (
                  <li key={s.id} className="border-s-2 border-accent ps-4">
                    <div className="font-medium">{tr(s.title, locale)}</div>
                    <div className="text-sm text-ink-muted">
                      {tr(s.author, locale)}
                      {s.authorDeathHijri && ` (v. ${s.authorDeathHijri} H)`}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
