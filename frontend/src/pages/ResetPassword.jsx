import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";
import { api, formatApiError } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ResetPassword() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      toast.success(t("reset_success"));
      nav("/login");
    } catch (e2) {
      setErr(formatApiError(e2));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <PublicHeader />
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="overline text-[var(--brand)] mb-4">— Recovery</div>
        <h1 className="font-display text-3xl lg:text-4xl tracking-tight font-bold mb-8">{t("reset_title")}</h1>
        {!token ? (
          <div className="border border-red-200 bg-red-50 text-red-900 p-4 text-sm">
            Missing token. Please use the link from your email.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 bg-white border border-gray-200 p-6">
            <div>
              <Label className="text-xs uppercase tracking-wider">{t("field_new_password")}</Label>
              <Input data-testid="reset-password" type="password" required minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)} className="rounded-sm mt-2" />
            </div>
            {err && <div data-testid="reset-error" className="text-sm text-red-600 border border-red-200 bg-red-50 p-2">{err}</div>}
            <Button data-testid="reset-submit" type="submit" disabled={loading} className="w-full rounded-sm bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white">
              {loading ? "..." : t("btn_reset")}
            </Button>
            <p className="text-sm text-gray-600 text-center">
              <Link to="/login" className="text-[var(--brand)] font-semibold">← {t("nav_login")}</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
