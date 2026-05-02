import PublicHeader from "@/components/PublicHeader";
const ABSTRACT_IMG = "https://static.prod-images.emergentagent.com/jobs/fcee9e80-3638-4d2f-ace1-0cb3fe5582e6/images/58177d6ca25614ed10fd6e7bbb72b6401b7faa5a95ef37fd904237611a3211a8.png";

export default function About() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <PublicHeader />
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-20">
        <div className="overline text-[#002FA7] mb-4">— About OJS</div>
        <h1 className="font-display text-4xl lg:text-6xl tracking-tighter font-bold mb-8">An editorial platform, in service of rigor.</h1>
        <img src={ABSTRACT_IMG} alt="Knowledge" className="w-full h-80 object-cover border border-gray-300 mb-10"/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <p className="text-gray-700 leading-relaxed">OJS is a modern Open Journal System designed for academic institutions, research groups, and independent scholars who demand clarity, transparency, and integrity in their publication workflows.</p>
          <p className="text-gray-700 leading-relaxed">From first submission through peer review to finalization and publication, the platform preserves the double-blind tradition while leveraging the efficiency of a unified editorial dashboard.</p>
        </div>
      </div>
    </div>
  );
}
