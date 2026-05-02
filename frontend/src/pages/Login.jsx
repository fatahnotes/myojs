import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n";
import { formatApiError } from "@/lib/api";
import PublicHeader from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Signed in");
      nav("/dashboard");
    } catch (e2) {
      setErr(formatApiError(e2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <PublicHeader />
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="overline text-[#002FA7] mb-4">— Authentication</div>
        <h1 className="font-display text-3xl lg:text-4xl tracking-tight font-bold mb-8">{t("login_title")}</h1>
        <form onSubmit={submit} className="space-y-5 bg-white border border-gray-200 p-6">
          <div>
            <Label className="text-xs uppercase tracking-wider">{t("field_email")}</Label>
            <Input data-testid="login-email" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="rounded-sm mt-2" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider">{t("field_password")}</Label>
            <Input data-testid="login-password" type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="rounded-sm mt-2" />
          </div>
          {err && <div data-testid="login-error" className="text-sm text-red-600 border border-red-200 bg-red-50 p-2">{err}</div>}
          <Button data-testid="login-submit" type="submit" disabled={loading} className="w-full rounded-sm bg-[#002FA7] hover:bg-blue-800 text-white">
            {loading ? "..." : t("btn_login")}
          </Button>
          <p className="text-sm text-gray-600 text-center">
            {t("no_account")} <Link to="/register" className="text-[#002FA7] font-semibold">{t("nav_register")}</Link>
          </p>
        </form>
        <div className="mt-6 text-xs text-gray-500 font-mono border border-dashed border-gray-300 p-3">
          <div className="font-semibold mb-1">Demo accounts:</div>
          author@ojs.com / author123<br/>
          reviewer@ojs.com / reviewer123<br/>
          editor@ojs.com / editor123<br/>
          admin@ojs.com / admin123
        </div>
      </div>
    </div>
  );
}
