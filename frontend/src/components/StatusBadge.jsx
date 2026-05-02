import { Badge } from "@/components/ui/badge";

const STATUS = {
  submitted:         { label: "Submitted",      cls: "bg-gray-100 text-gray-900 border-gray-300" },
  under_review:      { label: "Under Review",   cls: "bg-amber-50 text-amber-900 border-amber-300" },
  revision_required: { label: "Revisions",      cls: "bg-orange-50 text-orange-900 border-orange-300" },
  resubmitted:       { label: "Resubmitted",    cls: "bg-blue-50 text-blue-900 border-blue-300" },
  accepted:          { label: "Accepted",       cls: "bg-emerald-50 text-emerald-900 border-emerald-300" },
  rejected:          { label: "Rejected",       cls: "bg-red-50 text-red-900 border-red-300" },
  published:         { label: "Published",      cls: "bg-emerald-600 text-white border-emerald-700" },
};

export default function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, cls: "bg-gray-100 text-gray-900 border-gray-300" };
  return (
    <Badge data-testid={`status-badge-${status}`} variant="outline" className={`rounded-sm font-mono text-[11px] tracking-wide uppercase border ${s.cls}`}>
      {s.label}
    </Badge>
  );
}
