import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { FileText, ClipboardCheck, CheckCircle2, Inbox, Users, Clock, Award } from "lucide-react";
import { Link } from "react-router-dom";

function StatCard({ label, value, icon: Icon, testid }) {
  return (
    <Card data-testid={testid} className="rounded-sm border border-gray-200 shadow-none p-5 bg-white hover:-translate-y-0.5 hover:shadow-sm transition-base">
      <div className="flex items-start justify-between">
        <div>
          <div className="overline text-gray-500">{label}</div>
          <div className="font-display text-4xl font-bold tracking-tighter mt-2">{value}</div>
        </div>
        <Icon className="text-[var(--brand)]" size={20} />
      </div>
    </Card>
  );
}

export default function Overview() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [stats, setStats] = useState({});

  useEffect(() => { api.get("/stats").then(r => setStats(r.data)).catch(()=>{}); }, []);

  const role = user?.role;

  return (
    <div className="space-y-8">
      <header>
        <div className="overline text-[var(--brand)]">— {role?.toUpperCase()}</div>
        <h1 className="font-display text-3xl lg:text-4xl tracking-tighter font-bold mt-2">{t("overview_welcome")}, {user?.name}</h1>
        <p className="text-gray-600 text-sm mt-2">Today: {new Date().toLocaleDateString(undefined, { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {role === "author" && (<>
          <StatCard testid="stat-my-papers" label="My Papers" value={stats.my_papers ?? 0} icon={FileText} />
          <StatCard testid="stat-under-review" label="Under Review" value={stats.under_review ?? 0} icon={Clock} />
          <StatCard testid="stat-accepted" label="Accepted / Published" value={stats.accepted ?? 0} icon={Award} />
        </>)}
        {role === "reviewer" && (<>
          <StatCard testid="stat-assigned" label="Assigned" value={stats.assigned ?? 0} icon={ClipboardCheck} />
          <StatCard testid="stat-pending" label="Pending Review" value={stats.pending ?? 0} icon={Clock} />
          <StatCard testid="stat-completed" label="Reviews Submitted" value={stats.completed ?? 0} icon={CheckCircle2} />
        </>)}
        {(role === "editor" || role === "admin") && (<>
          <StatCard testid="stat-total" label="Total Papers" value={stats.total_papers ?? 0} icon={FileText} />
          <StatCard testid="stat-pending-review" label="Awaiting Action" value={stats.pending_review ?? 0} icon={Inbox} />
          <StatCard testid="stat-under-review" label="Under Review" value={stats.under_review ?? 0} icon={Clock} />
          <StatCard testid="stat-published" label="Published" value={stats.published ?? 0} icon={Award} />
          {role === "admin" && <StatCard testid="stat-users" label="Users" value={stats.users ?? 0} icon={Users} />}
        </>)}
      </div>

      <Card className="rounded-sm border border-gray-200 shadow-none p-6 bg-white">
        <div className="overline text-gray-500 mb-3">— Quick Actions</div>
        <div className="flex flex-wrap gap-3">
          {(role === "author" || role === "admin") &&
            <Link to="/dashboard/submit" data-testid="qa-submit" className="text-sm border border-gray-900 px-4 py-2 hover:bg-gray-900 hover:text-white transition-base">{t("sidebar_submit")}</Link>}
          {(role === "author" || role === "admin") &&
            <Link to="/dashboard/my-papers" data-testid="qa-mypapers" className="text-sm border border-gray-300 px-4 py-2 hover:bg-gray-50 transition-base">{t("sidebar_my_papers")}</Link>}
          {(role === "reviewer" || role === "admin") &&
            <Link to="/dashboard/assigned" data-testid="qa-assigned" className="text-sm border border-gray-300 px-4 py-2 hover:bg-gray-50 transition-base">{t("sidebar_assigned")}</Link>}
          {(role === "editor" || role === "admin") &&
            <Link to="/dashboard/submissions" data-testid="qa-submissions" className="text-sm border border-gray-300 px-4 py-2 hover:bg-gray-50 transition-base">{t("sidebar_all_subs")}</Link>}
        </div>
      </Card>
    </div>
  );
}
