import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useI18n, TEMPLATES } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

export default function Templates() {
  const { t } = useI18n();
  const dl = (tpl) => {
    const a = document.createElement("a");
    a.href = tpl.url;
    a.download = tpl.filename;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <PublicHeader />
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-16 lg:py-24">
        <div className="overline text-[#002FA7] mb-4">— Formatting</div>
        <h1 className="font-display text-4xl lg:text-6xl tracking-tighter font-bold mb-6">{t("templates_title")}</h1>
        <p className="text-base text-gray-700 max-w-2xl">{t("templates_intro")}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {TEMPLATES.map((tpl) => (
            <div key={tpl.key} data-testid={`template-card-${tpl.key}`} className="border border-gray-300 bg-white p-6 hover:-translate-y-0.5 hover:shadow-sm transition-base flex flex-col">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#002FA7] flex items-center justify-center shrink-0">
                  <FileText size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="overline text-gray-500 mb-1">— .DOCX · {tpl.key === "en" ? "English" : "Bahasa Melayu"}</div>
                  <div className="font-display text-xl font-bold">{tpl.name}</div>
                  <p className="text-sm text-gray-600 mt-2">Official SEAIPC 2026 manuscript template. Follow headings, figures, tables, and citation format.</p>
                </div>
              </div>
              <Button
                data-testid={`download-template-${tpl.key}`}
                onClick={() => dl(tpl)}
                className="mt-6 rounded-sm bg-[#002FA7] hover:bg-blue-800 text-white self-start"
              >
                <Download size={14} className="mr-2" /> {t("download")}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 border border-gray-300 bg-gray-900 text-white p-8">
          <div className="overline text-blue-300 mb-3">— Tips</div>
          <ul className="space-y-3 text-sm text-gray-300">
            <li>· Use only the provided template; do not alter heading styles, fonts or page size.</li>
            <li>· Submit in .DOCX for initial review; final accepted papers require PDF & DOCX.</li>
            <li>· Ensure ALL figures and tables are referenced in the body.</li>
            <li>· Double-blind review: remove author identity from the manuscript file.</li>
          </ul>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
