import { Link } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, FileText, Users, Globe } from "lucide-react";

const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/fcee9e80-3638-4d2f-ace1-0cb3fe5582e6/images/01c1bc0640dd831fe03f7cd269b2bb4db08e043a6e431725aa04ad97f9ed4dad.png";
const RESEARCHER_IMG = "https://images.unsplash.com/photo-1691934310377-7868e489e215?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200";

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <PublicHeader />

      {/* HERO */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="overline text-[#002FA7] mb-4">{t("hero_overline")}</div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl tracking-tighter leading-[0.95] font-bold text-gray-900">
              {t("hero_title")}
            </h1>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl tracking-tighter leading-tight font-medium text-gray-700 mt-4 max-w-2xl">
              {t("hero_title2")}
            </h2>
            <p className="mt-6 text-base lg:text-lg text-gray-600 max-w-xl leading-relaxed">{t("hero_subtitle")}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/register">
                <Button data-testid="hero-submit-btn" className="rounded-sm bg-[#002FA7] hover:bg-blue-800 text-white px-6 py-6 text-sm tracking-wide">
                  {t("hero_cta_submit")} <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link to="/call-for-papers">
                <Button data-testid="hero-cfp-btn" variant="outline" className="rounded-sm border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-6 py-6 text-sm tracking-wide">
                  {t("hero_cta_cfp")}
                </Button>
              </Link>
            </div>

            {/* Quick stats */}
            <div className="mt-14 grid grid-cols-3 border-t border-gray-300 pt-8 gap-4">
              <div>
                <div className="overline text-gray-500">Edition</div>
                <div className="font-display text-2xl font-bold mt-1">9th</div>
              </div>
              <div>
                <div className="overline text-gray-500">Tracks</div>
                <div className="font-display text-2xl font-bold mt-1">39</div>
              </div>
              <div>
                <div className="overline text-gray-500">Journals</div>
                <div className="font-display text-2xl font-bold mt-1">4</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="border border-gray-300 overflow-hidden">
              <img src={HERO_IMG} alt="SEAIPC 2026" className="w-full h-[440px] object-cover" />
              <div className="p-5 bg-white border-t border-gray-300">
                <div className="overline text-gray-500">Host City</div>
                <p className="mt-2 font-display text-xl font-bold">{t("conf_location")}</p>
                <p className="mt-1 text-sm text-gray-600">{t("conf_date")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KEY DATES STRIP */}
      <section className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="overline text-[#002FA7] mb-2">— Calendar</div>
              <h2 className="font-display text-3xl lg:text-4xl tracking-tight font-bold">{t("dates_title")}</h2>
            </div>
            <Link to="/dates" className="hidden md:inline-flex items-center text-sm text-[#002FA7] hover:underline">View all dates <ArrowRight size={14} className="ml-1"/></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 border-t border-gray-300">
            {[
              { l: t("d_abstract"), d: t("d_abstract_date") },
              { l: t("d_full"), d: t("d_full_date") },
              { l: t("d_early"), d: t("d_early_date") },
              { l: t("d_final"), d: t("d_final_date") },
              { l: t("d_conf"), d: t("d_conf_date") },
              { l: t("d_visit"), d: t("d_visit_date") },
            ].map((row, i, arr) => (
              <div key={i} className={`p-5 border-b border-gray-300 ${i < arr.length - 1 ? "lg:border-r" : ""}`}>
                <CalendarDays size={14} className="text-[#002FA7] mb-3"/>
                <div className="overline text-gray-500">{row.l}</div>
                <div className="font-mono text-sm font-semibold mt-2">{row.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="border-t border-gray-200 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div className="overline text-gray-500 mb-3">— Submission</div>
            <h2 className="font-display text-3xl lg:text-4xl tracking-tight font-bold">How the editorial workflow works.</h2>
            <p className="text-sm text-gray-600 mt-4 max-w-md">From your first submission through double-blind peer review to final publication with DOI assignment and e-ISBN proceedings.</p>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { n: "01", t: "Register", d: "Create an author account." },
              { n: "02", t: "Submit", d: "Upload manuscript (PDF/DOCX)." },
              { n: "03", t: "Review", d: "Editors assign double-blind reviewers." },
              { n: "04", t: "Decide", d: "Accept, revise, or reject with DOI." },
            ].map((s) => (
              <div key={s.n} className="bg-white border border-gray-300 p-6 hover:-translate-y-0.5 hover:shadow-sm transition-base">
                <div className="font-mono text-xs text-[#002FA7] mb-2">{s.n}</div>
                <h3 className="font-display text-xl font-bold">{s.t}</h3>
                <p className="text-sm text-gray-600 mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWER CTA */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="overline text-blue-300 mb-3">— Who should attend</div>
            <h2 className="font-display text-3xl lg:text-5xl tracking-tighter font-bold leading-tight">For academicians, researchers, industry, and civil society.</h2>
            <p className="mt-5 text-gray-300 max-w-xl">A forum for Islamic microfinance and philanthropy, sustainable development, and the mainstream economy — across Southeast Asia and beyond.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button data-testid="cta-register" className="rounded-sm bg-white text-gray-900 hover:bg-blue-100 px-6 py-6 text-sm tracking-wide">{t("nav_register")}</Button>
              </Link>
              <Link to="/templates">
                <Button data-testid="cta-templates" variant="outline" className="rounded-sm border-white text-white bg-transparent hover:bg-white hover:text-gray-900 px-6 py-6 text-sm tracking-wide">{t("templates_title")}</Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <img src={RESEARCHER_IMG} alt="Researcher" className="w-full h-[360px] object-cover border border-gray-700" />
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
