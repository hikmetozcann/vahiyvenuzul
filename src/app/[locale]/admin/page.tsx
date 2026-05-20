import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { isLocale, type Locale } from "@/i18n/config";

/**
 * Admin shell — placeholder. Real implementation will live behind auth
 * (NextAuth or similar) and only render for explicitly-allowed editor
 * accounts. The data layer (YAML + Zod) is already ready for an editor
 * UI to write against.
 */
export default async function AdminPage({
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
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("admin.title")}
        </h1>
        <p className="mt-4 text-ink-muted">{t("admin.comingSoon")}</p>
        <div className="mt-8 rounded-lg border border-dashed border-ink/20 p-6 text-sm text-ink-muted space-y-2">
          <p className="font-medium text-ink">İçerik ekleme akışı (geçici):</p>
          <ol className="list-decimal ps-5 space-y-1">
            <li><code>content/events/</code> altına yeni YAML dosyası açın.</li>
            <li>Şema için <code>src/schemas/event.ts</code>'i referans alın.</li>
            <li>Her olay en az bir <code>sources[]</code> referansı içermek zorundadır.</li>
            <li><code>npm run content:validate</code> ile doğrulayın.</li>
            <li>PR açın — yetkili gözden geçiriciler onaylar.</li>
          </ol>
        </div>
      </main>
    </>
  );
}
