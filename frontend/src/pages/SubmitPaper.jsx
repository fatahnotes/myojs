import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";

export default function SubmitPaper() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [form, setForm] = useState({ title: "", abstract: "", keywords: "", co_authors: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        abstract: form.abstract,
        keywords: form.keywords.split(",").map(s=>s.trim()).filter(Boolean),
        co_authors: form.co_authors.split(",").map(s=>s.trim()).filter(Boolean),
      };
      const { data: paper } = await api.post("/papers", payload);
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        await api.post(`/papers/${paper.id}/upload`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      toast.success("Paper submitted");
      nav(`/dashboard/papers/${paper.id}`);
    } catch (e2) {
      setErr(formatApiError(e2));
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <div className="overline text-[var(--brand)]">— New Submission</div>
        <h1 className="font-display text-3xl lg:text-4xl tracking-tighter font-bold mt-2">{t("sidebar_submit")}</h1>
      </header>
      <Card className="rounded-sm border border-gray-200 shadow-none p-6 bg-white">
        <form onSubmit={submit} className="space-y-5">
          <div>
            <Label className="text-xs uppercase tracking-wider">{t("paper_title")}</Label>
            <Input data-testid="paper-title" required value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} className="rounded-sm mt-2" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider">{t("paper_abstract")}</Label>
            <Textarea data-testid="paper-abstract" required rows={6} value={form.abstract} onChange={(e)=>setForm({...form, abstract: e.target.value})} className="rounded-sm mt-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs uppercase tracking-wider">{t("paper_keywords")}</Label>
              <Input data-testid="paper-keywords" value={form.keywords} onChange={(e)=>setForm({...form, keywords: e.target.value})} className="rounded-sm mt-2" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider">{t("paper_co_authors")}</Label>
              <Input data-testid="paper-co-authors" value={form.co_authors} onChange={(e)=>setForm({...form, co_authors: e.target.value})} className="rounded-sm mt-2" />
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider">{t("paper_file")}</Label>
            <label htmlFor="paper-file-input" className="mt-2 flex items-center gap-3 border border-dashed border-gray-300 px-4 py-6 cursor-pointer hover:border-[var(--brand)] transition-base">
              <UploadCloud size={20} className="text-gray-500" />
              <div className="flex-1">
                <div className="text-sm font-medium">{file ? file.name : "Click to choose PDF/DOCX"}</div>
                <div className="text-xs text-gray-500">Max 25MB</div>
              </div>
            </label>
            <input id="paper-file-input" data-testid="paper-file-input" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
          </div>
          {err && <div data-testid="submit-error" className="text-sm text-red-600 border border-red-200 bg-red-50 p-2">{err}</div>}
          <Button data-testid="submit-paper-btn" type="submit" disabled={loading} className="rounded-sm bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white px-6">
            {loading ? "..." : t("btn_submit_paper")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
