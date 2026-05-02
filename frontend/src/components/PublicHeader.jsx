import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";

export default function PublicHeader() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-xl border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 h-16">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-[#002FA7] flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm tracking-tighter">O</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-bold tracking-tight">{t("app_name")}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 -mt-0.5">{t("app_full_name")}</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/journals" data-testid="nav-journals" className="hover:text-[#002FA7] transition-base">{t("nav_journals")}</Link>
          <Link to="/about" data-testid="nav-about" className="hover:text-[#002FA7] transition-base">{t("nav_about")}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden text-xs font-mono">
            <button
              data-testid="lang-en"
              onClick={() => setLang("en")}
              className={`px-2 py-1 transition-base ${lang === "en" ? "bg-[#002FA7] text-white" : "text-gray-700 hover:bg-gray-100"}`}>EN</button>
            <button
              data-testid="lang-id"
              onClick={() => setLang("id")}
              className={`px-2 py-1 transition-base ${lang === "id" ? "bg-[#002FA7] text-white" : "text-gray-700 hover:bg-gray-100"}`}>ID</button>
          </div>
          {user ? (
            <>
              <Button data-testid="header-dashboard-btn" variant="outline" className="rounded-sm" onClick={() => nav("/dashboard")}>{t("nav_dashboard")}</Button>
              <Button data-testid="header-logout-btn" variant="ghost" className="rounded-sm" onClick={async () => { await logout(); nav("/"); }}>{t("nav_logout")}</Button>
            </>
          ) : (
            <>
              <Button data-testid="header-login-btn" variant="ghost" className="rounded-sm" onClick={() => nav("/login")}>{t("nav_login")}</Button>
              <Button data-testid="header-register-btn" className="rounded-sm bg-[#002FA7] hover:bg-blue-800 text-white" onClick={() => nav("/register")}>{t("nav_register")}</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
