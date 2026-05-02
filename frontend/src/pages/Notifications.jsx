import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Notifications() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);

  const load = async () => {
    const r = await api.get("/notifications");
    setItems(r.data);
  };
  useEffect(() => { load(); }, []);

  const markAll = async () => { await api.post("/notifications/read-all"); load(); };
  const markOne = async (id) => { await api.post(`/notifications/${id}/read`); load(); };

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="flex items-end justify-between">
        <div>
          <div className="overline text-[var(--brand)]">— Inbox</div>
          <h1 className="font-display text-3xl lg:text-4xl tracking-tighter font-bold mt-2">{t("notifications")}</h1>
        </div>
        <Button data-testid="mark-all-read-btn" variant="outline" className="rounded-sm" onClick={markAll}>
          <CheckCheck size={14} className="mr-2"/> {t("mark_all_read")}
        </Button>
      </header>
      <Card className="rounded-sm border border-gray-200 shadow-none p-0 bg-white divide-y divide-gray-100">
        {items.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm" data-testid="notifications-empty">{t("no_notifications")}</div>
        )}
        {items.map((n) => (
          <div
            key={n.id}
            data-testid={`notification-${n.id}`}
            className={`p-5 flex gap-4 hover:bg-gray-50 transition-base ${!n.read ? "bg-blue-50/30" : ""}`}
            onClick={() => !n.read && markOne(n.id)}
          >
            <div className={`mt-1 w-2 h-2 rounded-full ${!n.read ? "bg-[var(--brand)]" : "bg-transparent"}`} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">{n.title}</div>
                <div className="text-[10px] font-mono text-gray-400">{new Date(n.created_at).toLocaleString()}</div>
              </div>
              <div className="text-sm text-gray-700 mt-1">{n.message}</div>
              {n.link && <Link to={n.link} className="text-xs text-[var(--brand)] hover:underline mt-2 inline-block">Open →</Link>}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
