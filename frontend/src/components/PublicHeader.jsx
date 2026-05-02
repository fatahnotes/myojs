import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import { useContent } from "@/lib/content";
import { Button } from "@/components/ui/button";

function resolveUrl(u) {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  if (u.startsWith("/api")) return `${process.env.REACT_APP_BACKEND_URL}${u}`;
  return u;
}

export default function PublicHeader() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { content } = useContent();
  const nav = useNavigate();
  const b = content.branding || {};
  const logo = resolveUrl(b.logo_url);

  const links = [
    { to: "/about", label: t("nav_about"), tid: "nav-about" },
    { to: "/call-for-papers", label: t("nav_cfp"), tid: "nav-cfp" },
    { to: "/dates", label: t("nav_dates"), tid: "nav-dates" },
    { to: "/templates", label: t("nav_templates"), tid: "nav-templates" },
    { to: "/journals", label: t("nav_archive"), tid: "nav-archive" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/75 backdrop-blur-xl border-b border-gray-200/70">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 h-16">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-3 group">
          {logo ? (
            <img src={logo} alt={b.conf_short || "logo"} className="h-9 w-auto max-w-[140px] object-contain" />
          ) : (
            <div className="w-9 h-9 bg-[var(--brand)] flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm tracking-tighter">
                {(b.conf_short || "S").charAt(0)}
              </span>
            </div>
          )}
          <div className="leading-tight">
            <div className="font-display text-base font-bold tracking-tight">{b.conf_short}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 -mt-0.5">{b.conf_location}</div>
          </div>
        </Link>
        <nav className="hidden lg:flex items-center gap-7 text-sm">
          {links.map((l) => (
            <Link key={l.to} to={l.to} data-testid={l.tid} className="hover:text-[var(--brand)] transition-base">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden text-xs font-mono">
            <button data-testid="lang-en" onClick={() => setLang("en")} className={`px-2 py-1 transition-base ${lang === "en" ? "bg-[var(--brand)] text-white" : "text-gray-700 hover:bg-gray-100"}`}>EN</button>
            <button data-testid="lang-id" onClick={() => setLang("id")} className={`px-2 py-1 transition-base ${lang === "id" ? "bg-[var(--brand)] text-white" : "text-gray-700 hover:bg-gray-100"}`}>ID</button>
          </div>
          {user ? (
            <>
              <Button data-testid="header-dashboard-btn" variant="outline" className="rounded-sm" onClick={() => nav("/dashboard")}>{t("nav_dashboard")}</Button>
              <Button data-testid="header-logout-btn" variant="ghost" className="rounded-sm" onClick={async () => { await logout(); nav("/"); }}>{t("nav_logout")}</Button>
            </>
          ) : (
            <>
              <Button data-testid="header-login-btn" variant="ghost" className="rounded-sm hidden sm:inline-flex" onClick={() => nav("/login")}>{t("nav_login")}</Button>
              <Button data-testid="header-register-btn" className="rounded-sm bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white" onClick={() => nav("/register")}>{t("nav_register")}</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
