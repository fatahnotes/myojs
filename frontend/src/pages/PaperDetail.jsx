import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, formatApiError, API } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import StatusBadge from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UploadCloud, Download, UserPlus, Gavel, FileText, ArrowLeft } from "lucide-react";

export default function PaperDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useI18n();
  const [paper, setPaper] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [selectedRev, setSelectedRev] = useState([]);
  const [openAssign, setOpenAssign] = useState(false);
  const [openDecide, setOpenDecide] = useState(false);
  const [openReview, setOpenReview] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [decision, setDecision] = useState({ decision: "accept", note: "", doi: "" });
  const [review, setReview] = useState({ score: 7, recommendation: "accept", comments: "", confidential_notes: "" });
  const [revisionFile, setRevisionFile] = useState(null);

  const load = async () => {
    try {
      const [p, r] = await Promise.all([api.get(`/papers/${id}`), api.get(`/papers/${id}/reviews`)]);
      setPaper(p.data);
      setReviews(r.data);
    } catch (e) { toast.error(formatApiError(e)); }
  };
  useEffect(() => { load(); }, [id]);

  const loadReviewers = async () => {
    try {
      const r = await api.get("/users?role=reviewer");
      setReviewers(r.data);
      setSelectedRev(paper?.reviewer_ids || []);
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const assign = async () => {
    try {
      await api.post(`/papers/${id}/assign-reviewers`, { reviewer_ids: selectedRev });
      toast.success("Reviewers assigned");
      setOpenAssign(false);
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const decide = async () => {
    try {
      const payload = { decision: decision.decision, note: decision.note };
      if (decision.decision === "publish" && decision.doi) payload.doi = decision.doi;
      await api.post(`/papers/${id}/decision`, payload);
      toast.success("Decision recorded");
      setOpenDecide(false);
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const submitReview = async () => {
    try {
      await api.post(`/papers/${id}/reviews`, { ...review, score: Number(review.score) });
      toast.success("Review submitted");
      setOpenReview(false);
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const uploadRevision = async () => {
    if (!revisionFile) return;
    const fd = new FormData();
    fd.append("file", revisionFile);
    try {
      await api.post(`/papers/${id}/upload`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Revision uploaded");
      setRevisionFile(null);
      load();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const downloadFile = async () => {
    if (!paper?.file_id) return;
    const tok = localStorage.getItem("ojs_token");
    const res = await fetch(`${API}/files/${paper.file_id}/download`, { headers: { Authorization: `Bearer ${tok}` }});
    if (!res.ok) return toast.error("Download failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = paper.file_name || "paper"; a.click();
    URL.revokeObjectURL(url);
  };

  if (!paper) return <div className="text-gray-400">Loading…</div>;

  const isAuthor = user.id === paper.author_id;
  const isEditor = user.role === "editor" || user.role === "admin";
  const isReviewer = paper.reviewer_ids?.includes(user.id);

  const timeline = [
    { label: "Submitted", date: paper.created_at, active: true },
    { label: "Under Review", date: paper.status !== "submitted" ? paper.updated_at : null, active: ["under_review","revision_required","resubmitted","accepted","rejected","published"].includes(paper.status) },
    { label: "Decision", date: paper.decision ? paper.updated_at : null, active: ["accepted","rejected","revision_required","published"].includes(paper.status) },
    { label: "Published", date: paper.status === "published" ? paper.updated_at : null, active: paper.status === "published" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <Link to="/dashboard" className="text-sm text-gray-500 hover:text-[var(--brand)] flex items-center gap-1" data-testid="back-btn"><ArrowLeft size={14}/> Back</Link>

      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <StatusBadge status={paper.status} />
          <span className="text-xs font-mono text-gray-500">#{paper.id.slice(0,8)}</span>
        </div>
        <h1 data-testid="paper-detail-title" className="font-display text-3xl lg:text-5xl tracking-tighter font-bold">{paper.title}</h1>
        <div className="text-sm text-gray-600">by <span className="font-semibold">{paper.author_name}</span>{paper.co_authors?.length > 0 && <> with {paper.co_authors.join(", ")}</>}</div>
      </header>

      {/* Timeline */}
      <Card className="rounded-sm border border-gray-200 shadow-none p-6 bg-white">
        <div className="overline text-gray-500 mb-5">— {t("timeline")}</div>
        <div className="grid grid-cols-4 gap-2">
          {timeline.map((step, i) => (
            <div key={i} className="relative">
              <div className={`h-1 ${step.active ? "bg-[var(--brand)]" : "bg-gray-200"}`} />
              <div className="mt-3">
                <div className={`text-sm font-semibold ${step.active ? "text-gray-900" : "text-gray-400"}`}>{step.label}</div>
                <div className="text-[10px] font-mono text-gray-500 mt-1">{step.date ? new Date(step.date).toLocaleDateString() : "—"}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Metadata */}
      <Card className="rounded-sm border border-gray-200 shadow-none p-6 bg-white">
        <div className="overline text-gray-500 mb-3">— Abstract</div>
        <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">{paper.abstract}</p>
        {paper.keywords?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {paper.keywords.map((k) => (
              <span key={k} className="text-xs font-mono uppercase tracking-wider border border-gray-300 px-2 py-1">{k}</span>
            ))}
          </div>
        )}
        {paper.file_id && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 gap-2 flex-wrap">
            <div className="flex items-center gap-3 text-sm">
              <FileText size={16} className="text-[var(--brand)]" />
              <span>{paper.file_name}</span>
            </div>
            <div className="flex items-center gap-2">
              {paper.file_name && /\.pdf$/i.test(paper.file_name) && (
                <Button data-testid="preview-file-btn" variant="outline" className="rounded-sm" onClick={() => setOpenPreview(true)}>
                  {t("preview")}
                </Button>
              )}
              <Button data-testid="download-file-btn" variant="outline" className="rounded-sm" onClick={downloadFile}>
                <Download size={14} className="mr-2"/> Download
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {isEditor && (
          <Dialog open={openAssign} onOpenChange={(v)=>{ setOpenAssign(v); if(v) loadReviewers(); }}>
            <DialogTrigger asChild>
              <Button data-testid="assign-reviewers-btn" className="rounded-sm bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white"><UserPlus size={14} className="mr-2"/>{t("assign_reviewers")}</Button>
            </DialogTrigger>
            <DialogContent className="rounded-sm max-w-md">
              <DialogHeader><DialogTitle>{t("assign_reviewers")}</DialogTitle></DialogHeader>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {reviewers.length === 0 && <div className="text-sm text-gray-500">No reviewers available.</div>}
                {reviewers.map((r) => (
                  <label key={r.id} className="flex items-center gap-3 border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
                    <Checkbox
                      data-testid={`reviewer-checkbox-${r.id}`}
                      checked={selectedRev.includes(r.id)}
                      onCheckedChange={(c) => {
                        setSelectedRev(c ? [...selectedRev, r.id] : selectedRev.filter(x => x !== r.id));
                      }}
                    />
                    <div>
                      <div className="text-sm font-semibold">{r.name}</div>
                      <div className="text-xs text-gray-500">{r.email}</div>
                    </div>
                  </label>
                ))}
              </div>
              <DialogFooter>
                <Button data-testid="confirm-assign-btn" onClick={assign} className="rounded-sm bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white">Assign</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {isEditor && (
          <Dialog open={openDecide} onOpenChange={setOpenDecide}>
            <DialogTrigger asChild>
              <Button data-testid="make-decision-btn" variant="outline" className="rounded-sm border-gray-900"><Gavel size={14} className="mr-2"/>{t("make_decision")}</Button>
            </DialogTrigger>
            <DialogContent className="rounded-sm">
              <DialogHeader><DialogTitle>{t("make_decision")}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider">Decision</Label>
                  <Select value={decision.decision} onValueChange={(v)=>setDecision({...decision, decision: v})}>
                    <SelectTrigger data-testid="decision-select" className="rounded-sm mt-2"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accept">{t("decision_accept")}</SelectItem>
                      <SelectItem value="revision_required">{t("decision_revision")}</SelectItem>
                      <SelectItem value="reject">{t("decision_reject")}</SelectItem>
                      <SelectItem value="publish">{t("decision_publish")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider">Note to author</Label>
                  <Textarea data-testid="decision-note" rows={5} value={decision.note} onChange={(e)=>setDecision({...decision, note: e.target.value})} className="rounded-sm mt-2"/>
                </div>
                {decision.decision === "publish" && (
                  <div>
                    <Label className="text-xs uppercase tracking-wider">{t("doi")}</Label>
                    <Input data-testid="decision-doi" value={decision.doi} onChange={(e)=>setDecision({...decision, doi: e.target.value})} className="rounded-sm mt-2" placeholder="10.9999/seaipc2026.xxxx"/>
                    <div className="text-xs text-gray-500 mt-1">{t("doi_hint")}</div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button data-testid="confirm-decision-btn" onClick={decide} className="rounded-sm bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white">Finalize</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {isReviewer && (
          <Dialog open={openReview} onOpenChange={setOpenReview}>
            <DialogTrigger asChild>
              <Button data-testid="submit-review-btn" className="rounded-sm bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white">{t("submit_review")}</Button>
            </DialogTrigger>
            <DialogContent className="rounded-sm max-w-xl">
              <DialogHeader><DialogTitle>{t("submit_review")}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs uppercase tracking-wider">{t("score")}</Label>
                    <Input data-testid="review-score" type="number" min={1} max={10} value={review.score} onChange={(e)=>setReview({...review, score: e.target.value})} className="rounded-sm mt-2"/>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider">{t("recommendation")}</Label>
                    <Select value={review.recommendation} onValueChange={(v)=>setReview({...review, recommendation: v})}>
                      <SelectTrigger data-testid="review-recommendation" className="rounded-sm mt-2"><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accept">{t("rec_accept")}</SelectItem>
                        <SelectItem value="minor_revision">{t("rec_minor")}</SelectItem>
                        <SelectItem value="major_revision">{t("rec_major")}</SelectItem>
                        <SelectItem value="reject">{t("rec_reject")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider">{t("comments")}</Label>
                  <Textarea data-testid="review-comments" rows={4} value={review.comments} onChange={(e)=>setReview({...review, comments: e.target.value})} className="rounded-sm mt-2"/>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider">{t("confidential_notes")}</Label>
                  <Textarea data-testid="review-confidential" rows={3} value={review.confidential_notes} onChange={(e)=>setReview({...review, confidential_notes: e.target.value})} className="rounded-sm mt-2"/>
                </div>
              </div>
              <DialogFooter>
                <Button data-testid="confirm-review-btn" onClick={submitReview} className="rounded-sm bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white">Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {isAuthor && paper.status === "revision_required" && (
          <div className="flex items-center gap-2">
            <input id="revision-input" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e)=>setRevisionFile(e.target.files?.[0] || null)} data-testid="revision-file-input"/>
            <label htmlFor="revision-input" className="text-sm border border-gray-900 px-4 py-2 cursor-pointer hover:bg-gray-900 hover:text-white transition-base flex items-center gap-2">
              <UploadCloud size={14}/> {revisionFile ? revisionFile.name : "Choose revision"}
            </label>
            {revisionFile && <Button data-testid="upload-revision-btn" onClick={uploadRevision} className="rounded-sm bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white">{t("upload_revision")}</Button>}
          </div>
        )}
      </div>

      {/* Decision */}
      {paper.decision && (
        <Card className="rounded-sm border border-gray-200 shadow-none p-6 bg-white">
          <div className="overline text-[var(--brand)] mb-2">— Editor Decision</div>
          <div className="text-lg font-semibold capitalize">{paper.decision.replace("_", " ")}</div>
          {paper.doi && (
            <div className="mt-2 font-mono text-xs text-gray-600">DOI: <span className="text-gray-900 font-semibold">{paper.doi}</span></div>
          )}
          {paper.decision_note && <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{paper.decision_note}</p>}
        </Card>
      )}

      {/* PDF Preview Dialog */}
      <Dialog open={openPreview} onOpenChange={setOpenPreview}>
        <DialogContent className="rounded-sm max-w-5xl p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-gray-200">
            <DialogTitle>{paper.file_name}</DialogTitle>
          </DialogHeader>
          {openPreview && paper.file_id && (
            <iframe
              data-testid="pdf-preview-iframe"
              src={`${API}/files/${paper.file_id}/preview?token=${localStorage.getItem("ojs_token") || ""}`}
              title="PDF preview"
              className="w-full h-[75vh] bg-gray-100"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reviews */}
      <Card className="rounded-sm border border-gray-200 shadow-none p-6 bg-white">
        <div className="overline text-gray-500 mb-4">— {t("review_summary")}</div>
        {reviews.length === 0 && <div className="text-sm text-gray-500">No reviews available yet.</div>}
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} data-testid={`review-${r.id}`} className="border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">{r.reviewer_name}</div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-gray-500">Score: <span className="font-bold text-gray-900">{r.score}/10</span></span>
                  <span className="uppercase tracking-wider border border-gray-300 px-2 py-0.5">{r.recommendation.replace("_"," ")}</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.comments}</p>
              {r.confidential_notes && (user.role === "editor" || user.role === "admin") && (
                <div className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
                  <span className="uppercase tracking-wider font-semibold">Confidential:</span> {r.confidential_notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
