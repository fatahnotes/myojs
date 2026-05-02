import { useI18n } from "@/i18n";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function PublicFooter() {
  const { t } = useI18n();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="overline text-blue-300 mb-3">— {t("conf_short")}</div>
          <div className="font-display text-2xl font-bold tracking-tight max-w-sm">{t("conf_full")}</div>
          <p className="text-sm text-gray-400 mt-4 max-w-md">{t("conf_theme")}</p>
        </div>
        <div>
          <div className="overline text-gray-500 mb-3">— {t("contact_title")}</div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2"><MapPin size={14} /> Jakarta Selatan, Indonesia</li>
            <li className="flex items-center gap-2"><Phone size={14} /> {t("contact_phone")}</li>
            <li className="flex items-center gap-2"><Mail size={14} /> {t("contact_email")}</li>
          </ul>
        </div>
        <div>
          <div className="overline text-gray-500 mb-3">— Links</div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/about" className="hover:text-white">{t("nav_about")}</Link></li>
            <li><Link to="/call-for-papers" className="hover:text-white">{t("nav_cfp")}</Link></li>
            <li><Link to="/dates" className="hover:text-white">{t("nav_dates")}</Link></li>
            <li><Link to="/templates" className="hover:text-white">{t("nav_templates")}</Link></li>
            <li><Link to="/journals" className="hover:text-white">{t("nav_archive")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 flex flex-col md:flex-row justify-between gap-3 text-xs text-gray-500 font-mono">
          <div>© 2026 SEAIPC · In collaboration with IMZ Capital</div>
          <div>e-ISBN · Proceedings of the 9th Southeast Asia International Philanthropy Conference</div>
        </div>
      </div>
    </footer>
  );
}
