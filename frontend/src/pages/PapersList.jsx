import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { useI18n } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PapersList({ scope = "all" }) {
  // scope: "mine" (author), "assigned" (reviewer), "all" (editor/admin)
  const { t } = useI18n();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/papers");
      setPapers(r.data);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const titles = {
    mine: t("sidebar_my_papers"),
    assigned: t("sidebar_assigned"),
    all: t("sidebar_all_subs"),
  };

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="overline text-[#002FA7]">— Papers</div>
          <h1 className="font-display text-3xl lg:text-4xl tracking-tighter font-bold mt-2">{titles[scope]}</h1>
        </div>
        {scope === "mine" && (
          <Link to="/dashboard/submit">
            <Button data-testid="papers-submit-btn" className="rounded-sm bg-[#002FA7] hover:bg-blue-800 text-white">+ {t("sidebar_submit")}</Button>
          </Link>
        )}
      </header>

      <Card className="rounded-sm border border-gray-200 shadow-none p-0 overflow-hidden bg-white">
        <Table data-testid="papers-table">
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="font-mono text-[11px] uppercase tracking-wider w-[45%]">{t("paper_title")}</TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider">Author</TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider">{t("status")}</TableHead>
              <TableHead className="font-mono text-[11px] uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-right font-mono text-[11px] uppercase tracking-wider">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={5} className="text-center py-12 text-gray-400">Loading…</TableCell></TableRow>}
            {!loading && papers.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-gray-400" data-testid="papers-empty">{t("no_papers")}</TableCell></TableRow>
            )}
            {papers.map((p) => (
              <TableRow key={p.id} className="hover:bg-gray-50 transition-base border-b border-gray-100">
                <TableCell className="font-medium">
                  <Link to={`/dashboard/papers/${p.id}`} data-testid={`paper-row-${p.id}`} className="hover:text-[#002FA7]">{p.title}</Link>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{p.author_name}</TableCell>
                <TableCell><StatusBadge status={p.status} /></TableCell>
                <TableCell className="text-xs font-mono text-gray-500">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Link to={`/dashboard/papers/${p.id}`} className="text-sm text-[#002FA7] hover:underline">{t("view")} →</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
