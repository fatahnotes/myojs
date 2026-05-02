import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useContent } from "@/lib/content";

const ABSTRACT_IMG = "https://static.prod-images.emergentagent.com/jobs/fcee9e80-3638-4d2f-ace1-0cb3fe5582e6/images/58177d6ca25614ed10fd6e7bbb72b6401b7faa5a95ef37fd904237611a3211a8.png";

export default function About() {
  const { content } = useContent();
  const a = content.about || {};
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <PublicHeader />
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-16 lg:py-24">
        <div className="overline text-[var(--brand)] mb-4">— About</div>
        <h1 className="font-display text-4xl lg:text-6xl tracking-tighter font-bold mb-8">{a.title}</h1>
        <img src={ABSTRACT_IMG} alt="Philanthropy" className="w-full h-72 object-cover border border-gray-300 mb-10" />
        <p className="text-gray-700 leading-relaxed text-base lg:text-lg max-w-3xl whitespace-pre-wrap">{a.body}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-14">
          {a.objectives?.length > 0 && (
            <div className="border border-gray-300 bg-white p-6">
              <div className="overline text-gray-500 mb-3">— Conference Objectives</div>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                {a.objectives.map((o, i) => <li key={i}>{o}</li>)}
              </ol>
            </div>
          )}
          {a.attendees?.length > 0 && (
            <div className="border border-gray-300 bg-white p-6">
              <div className="overline text-gray-500 mb-3">— Who should attend</div>
              <ul className="space-y-2 text-sm text-gray-700">
                {a.attendees.map((o, i) => <li key={i}>· {o}</li>)}
              </ul>
            </div>
          )}
        </div>

        {a.venue_items?.length > 0 && (
          <div className="mt-14 border-t border-gray-300 pt-10">
            <div className="overline text-gray-500 mb-3">— Venue & Visits</div>
            <ul className="space-y-2 text-sm text-gray-700 leading-relaxed">
              {a.venue_items.map((v, i) => <li key={i}>· {v}</li>)}
            </ul>
          </div>
        )}

        {(a.organizer_body || a.contact_phone || a.contact_email) && (
          <div className="mt-14 border border-gray-300 bg-gray-900 text-white p-8">
            <div className="overline text-blue-300 mb-3">— Organiser</div>
            {a.organizer_body && <p className="text-sm text-gray-300 max-w-2xl">{a.organizer_body}</p>}
            <div className="mt-6 flex flex-wrap gap-6 text-xs font-mono">
              {a.contact_phone && <span>{a.contact_phone}</span>}
              {a.contact_email && <span>{a.contact_email}</span>}
            </div>
          </div>
        )}
      </section>
      <PublicFooter />
    </div>
  );
}
