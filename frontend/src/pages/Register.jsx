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

export default function Register() {
  const { register } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", name: "", affiliation: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await register({ ...form, role: "author" });
      toast.success("Account created");
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
        <div className="overline text-[#002FA7] mb-4">— New Account</div>
        <h1 className="font-display text-3xl lg:text-4xl tracking-tight font-bold mb-8">{t("register_title")}</h1>
        <form onSubmit={submit} className="space-y-5 bg-white border border-gray-200 p-6">
          <div>
            <Label className="text-xs uppercase tracking-wider">{t("field_name")}</Label>
            <Input data-testid="register-name" required value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} className="rounded-sm mt-2" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider">{t("field_email")}</Label>
            <Input data-testid="register-email" type="email" required value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} className="rounded-sm mt-2" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider">{t("field_affiliation")}</Label>
            <Input data-testid="register-affiliation" value={form.affiliation} onChange={(e)=>setForm({...form, affiliation: e.target.value})} className="rounded-sm mt-2" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider">{t("field_password")}</Label>
            <Input data-testid="register-password" type="password" required minLength={6} value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} className="rounded-sm mt-2" />
          </div>
          {err && <div data-testid="register-error" className="text-sm text-red-600 border border-red-200 bg-red-50 p-2">{err}</div>}
          <Button data-testid="register-submit" type="submit" disabled={loading} className="w-full rounded-sm bg-[#002FA7] hover:bg-blue-800 text-white">
            {loading ? "..." : t("btn_register")}
          </Button>
          <p className="text-sm text-gray-600 text-center">
            {t("have_account")} <Link to="/login" className="text-[#002FA7] font-semibold">{t("nav_login")}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
