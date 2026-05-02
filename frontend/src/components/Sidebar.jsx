import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import {
  LayoutDashboard, FileText, Upload, ClipboardCheck, Inbox, Users, Bell, Library, LogOut
} from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const loc = useLocation();
  const nav = useNavigate();

  if (!user) return null;
  const role = user.role;

  const items = [
    { to: "/dashboard", label: t("sidebar_overview"), icon: LayoutDashboard, testid: "nav-overview" },
  ];
  if (role === "author" || role === "admin") {
    items.push(
      { to: "/dashboard/my-papers", label: t("sidebar_my_papers"), icon: FileText, testid: "nav-my-papers" },
      { to: "/dashboard/submit", label: t("sidebar_submit"), icon: Upload, testid: "nav-submit" },
    );
  }
  if (role === "reviewer" || role === "admin") {
    items.push({ to: "/dashboard/assigned", label: t("sidebar_assigned"), icon: ClipboardCheck, testid: "nav-assigned" });
  }
  if (role === "editor" || role === "admin") {
    items.push({ to: "/dashboard/submissions", label: t("sidebar_all_subs"), icon: Inbox, testid: "nav-all-subs" });
  }
  if (role === "admin") {
    items.push({ to: "/dashboard/users", label: t("sidebar_users"), icon: Users, testid: "nav-users" });
  }
  items.push(
    { to: "/dashboard/notifications", label: t("sidebar_notifications"), icon: Bell, testid: "nav-notifications" },
    { to: "/journals", label: t("sidebar_archive"), icon: Library, testid: "nav-archive" },
  );

  return (
    <aside data-testid="sidebar" className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <Link to="/" className="flex items-center gap-3 p-5 border-b border-gray-200">
        <div className="w-8 h-8 bg-[#002FA7] flex items-center justify-center">
          <span className="text-white font-display font-bold text-sm tracking-tighter">O</span>
        </div>
        <div>
          <div className="font-display text-base font-bold tracking-tight">OJS</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Editorial Suite</div>
        </div>
      </Link>
      <nav className="flex-1 overflow-y-auto py-3">
        {items.map((it) => {
          const active = loc.pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              data-testid={it.testid}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-base border-l-2 ${
                active ? "border-[#002FA7] bg-blue-50/50 text-[#002FA7] font-semibold" : "border-transparent text-gray-700 hover:bg-gray-50"
              }`}>
              <Icon size={16} />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="leading-tight">
            <div className="text-sm font-semibold truncate" data-testid="sidebar-user-name">{user.name}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{user.role}</div>
          </div>
          <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden text-[10px] font-mono">
            <button onClick={() => setLang("en")} className={`px-1.5 py-0.5 ${lang === "en" ? "bg-[#002FA7] text-white" : "text-gray-700"}`}>EN</button>
            <button onClick={() => setLang("id")} className={`px-1.5 py-0.5 ${lang === "id" ? "bg-[#002FA7] text-white" : "text-gray-700"}`}>ID</button>
          </div>
        </div>
        <button
          data-testid="sidebar-logout"
          onClick={async () => { await logout(); nav("/"); }}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-600 transition-base">
          <LogOut size={14} /> {t("nav_logout")}
        </button>
      </div>
    </aside>
  );
}
