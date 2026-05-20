import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";

export default function SiteHeader() {
  const t = useTranslations();

  return (
    <header className="border-b border-ink/10 bg-parchment/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          {t("site.title")}
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink-muted">
          <Link href="/timeline" className="hover:text-ink transition">
            {t("nav.timeline")}
          </Link>
          <Link href="/sources" className="hover:text-ink transition">
            {t("nav.sources")}
          </Link>
          <Link href="/admin" className="hover:text-ink transition">
            Admin
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
