import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useI18n } from "@/i18n";
import { useContent } from "@/lib/content";
import { CalendarDays } from "lucide-react";

export default function Dates() {
  const { t } = useI18n();
  const { content } = useContent();
  const dates = content.dates || [];
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <PublicHeader />
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-16 lg:py-24">
        <div className="overline text-[var(--brand)] mb-4">— Schedule</div>
        <h1 className="font-display text-4xl lg:text-6xl tracking-tighter font-bold mb-10">{t("dates_title")}</h1>
        <div className="border-t border-gray-300">
          {dates.map((r, i) => (
            <div
              key={i}
              data-testid={`date-row-${i}`}
              className="grid grid-cols-12 items-center gap-4 border-b border-gray-300 py-6 hover:bg-white transition-base"
            >
              <div className="col-span-1 flex justify-center">
                <CalendarDays size={18} className="text-[var(--brand)]" />
              </div>
              <div className="col-span-7 md:col-span-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">{r.tag}</div>
                <div className="font-display text-lg md:text-xl font-bold">{r.label}</div>
              </div>
              <div className="col-span-4 md:col-span-5 text-right font-mono text-sm md:text-base text-gray-900 font-semibold">
                {r.date}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs font-mono text-gray-500 mt-8">* Dates are subject to change. Please check back regularly.</p>
      </section>
      <PublicFooter />
    </div>
  );
}
