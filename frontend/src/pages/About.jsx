import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useI18n } from "@/i18n";

const ABSTRACT_IMG = "https://static.prod-images.emergentagent.com/jobs/fcee9e80-3638-4d2f-ace1-0cb3fe5582e6/images/58177d6ca25614ed10fd6e7bbb72b6401b7faa5a95ef37fd904237611a3211a8.png";

export default function About() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <PublicHeader />
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-16 lg:py-24">
        <div className="overline text-[#002FA7] mb-4">— About</div>
        <h1 className="font-display text-4xl lg:text-6xl tracking-tighter font-bold mb-8">{t("about_title")}</h1>
        <img src={ABSTRACT_IMG} alt="Philanthropy" className="w-full h-72 object-cover border border-gray-300 mb-10" />
        <p className="text-gray-700 leading-relaxed text-base lg:text-lg max-w-3xl">{t("about_body")}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-14">
          <div className="border border-gray-300 bg-white p-6">
            <div className="overline text-gray-500 mb-3">— {t("objectives_title")}</div>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>{t("obj_1")}</li>
              <li>{t("obj_2")}</li>
              <li>{t("obj_3")}</li>
              <li>{t("obj_4")}</li>
              <li>{t("obj_5")}</li>
            </ol>
          </div>
          <div className="border border-gray-300 bg-white p-6">
            <div className="overline text-gray-500 mb-3">— {t("attendees_title")}</div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>· {t("att_1")}</li>
              <li>· {t("att_2")}</li>
              <li>· {t("att_3")}</li>
              <li>· {t("att_4")}</li>
              <li>· {t("att_5")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-gray-300 pt-10">
          <div className="overline text-gray-500 mb-3">— {t("venue_title")}</div>
          <ul className="space-y-2 text-sm text-gray-700 leading-relaxed">
            <li>· {t("venue_jkt")}</li>
            <li>· {t("venue_bogor")}</li>
            <li>· {t("venue_tour")}</li>
            <li>· {t("venue_phil")}</li>
          </ul>
        </div>

        <div className="mt-14 border border-gray-300 bg-gray-900 text-white p-8">
          <div className="overline text-blue-300 mb-3">— {t("organizer_title")}</div>
          <p className="text-sm text-gray-300 max-w-2xl">{t("organizer_body")}</p>
          <div className="mt-6 flex flex-wrap gap-6 text-xs font-mono">
            <span>{t("contact_phone")}</span>
            <span>{t("contact_email")}</span>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
