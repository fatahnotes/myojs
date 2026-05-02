import { Link } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Search, Award } from "lucide-react";

const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/fcee9e80-3638-4d2f-ace1-0cb3fe5582e6/images/01c1bc0640dd831fe03f7cd269b2bb4db08e043a6e431725aa04ad97f9ed4dad.png";
const ABSTRACT_IMG = "https://static.prod-images.emergentagent.com/jobs/fcee9e80-3638-4d2f-ace1-0cb3fe5582e6/images/58177d6ca25614ed10fd6e7bbb72b6401b7faa5a95ef37fd904237611a3211a8.png";
const RESEARCHER_IMG = "https://images.unsplash.com/photo-1691934310377-7868e489e215?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200";

export default function Home() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <PublicHeader />

      {/* HERO */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="overline text-[#002FA7] mb-4">— Vol. 01 / Issue 26 / Open Access</div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl tracking-tighter leading-[0.95] font-bold text-gray-900">
              {t("hero_title")}
            </h1>
            <p className="mt-6 text-base lg:text-lg text-gray-600 max-w-xl leading-relaxed">{t("hero_subtitle")}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/register">
                <Button data-testid="hero-submit-btn" className="rounded-sm bg-[#002FA7] hover:bg-blue-800 text-white px-6 py-6 text-sm tracking-wide">
                  {t("hero_cta_submit")} <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link to="/journals">
                <Button data-testid="hero-browse-btn" variant="outline" className="rounded-sm border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-6 py-6 text-sm tracking-wide">
                  {t("hero_cta_browse")}
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="border border-gray-300 overflow-hidden">
              <img src={HERO_IMG} alt="Library architecture" className="w-full h-[420px] object-cover" />
              <div className="p-5 bg-white border-t border-gray-300">
                <div className="overline text-gray-500">Editorial Standard</div>
                <p className="mt-2 text-sm text-gray-700">Double-blind peer review · Indexed metadata · Permanent archive</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-20">
          <div className="overline text-gray-500 mb-3">— Process</div>
          <h2 className="font-display text-3xl lg:text-4xl tracking-tight font-bold mb-12 max-w-2xl">{t("process_title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 border-t border-gray-300">
            {[
              { n: "01", t: t("process_step1"), d: t("process_step1_desc") },
              { n: "02", t: t("process_step2"), d: t("process_step2_desc") },
              { n: "03", t: t("process_step3"), d: t("process_step3_desc") },
              { n: "04", t: t("process_step4"), d: t("process_step4_desc") },
            ].map((s, i) => (
              <div key={s.n} className={`p-6 lg:p-8 border-b border-gray-300 ${i < 3 ? "md:border-r" : ""}`}>
                <div className="font-mono text-xs text-[#002FA7] mb-3">{s.n}</div>
                <h3 className="font-display text-xl font-bold mb-2">{s.t}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Reviewer */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="overline text-blue-300 mb-3">— Become a Reviewer</div>
            <h2 className="font-display text-3xl lg:text-5xl tracking-tighter font-bold leading-tight">Shape the future of academic discourse.</h2>
            <p className="mt-5 text-gray-300 max-w-xl">Join a panel of expert peer reviewers. Evaluate manuscripts with confidentiality and rigor.</p>
            <Link to="/register">
              <Button data-testid="cta-join-reviewer" className="mt-8 rounded-sm bg-white text-gray-900 hover:bg-blue-100 px-6 py-6 text-sm tracking-wide">Join as Reviewer <ArrowRight size={16} className="ml-2" /></Button>
            </Link>
          </div>
          <div className="lg:col-span-5">
            <img src={RESEARCHER_IMG} alt="Researcher" className="w-full h-[360px] object-cover border border-gray-700" />
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-10 flex flex-col md:flex-row justify-between gap-4">
          <div className="text-sm text-gray-500">© 2026 OJS · Open Journal System</div>
          <div className="text-xs font-mono text-gray-400">ISSN-PENDING / DOI Registry / Open Access</div>
        </div>
      </footer>
    </div>
  );
}
