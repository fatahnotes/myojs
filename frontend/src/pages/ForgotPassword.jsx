import { useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";
import { api, formatApiError } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ForgotPassword() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent (if the email exists)");
    } catch (e2) {
      toast.error(formatApiError(e2));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <PublicHeader />
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="overline text-[var(--brand)] mb-4">— Recovery</div>
        <h1 className="font-display text-3xl lg:text-4xl tracking-tight font-bold mb-2">{t("forgot_title")}</h1>
        <p className="text-sm text-gray-600 mb-8">{t("forgot_hint")}</p>
        {sent ? (
          <div data-testid="forgot-success" className="border border-green-200 bg-green-50 text-green-900 p-4 text-sm">
            If the email exists, a password reset link has been sent. Check your inbox.
            {!process.env.REACT_APP_EMAIL_ENABLED && (
              <div className="mt-2 text-xs font-mono text-green-800">Note: emails are currently logged to the server console while the email provider is being configured.</div>
            )}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 bg-white border border-gray-200 p-6">
            <div>
              <Label className="text-xs uppercase tracking-wider">{t("field_email")}</Label>
              <Input data-testid="forgot-email" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="rounded-sm mt-2" />
            </div>
            <Button data-testid="forgot-submit" type="submit" disabled={loading} className="w-full rounded-sm bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white">
              {loading ? "..." : t("btn_forgot")}
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
