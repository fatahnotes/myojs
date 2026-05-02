import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import PublicHeader from "@/components/PublicHeader";

const LIB_IMG = "https://images.unsplash.com/photo-1756037020659-6f9d3418f6b6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600";

export default function JournalsArchive() {
  const [papers, setPapers] = useState([]);
  useEffect(() => { api.get("/papers/published").then(r => setPapers(r.data)).catch(()=>{}); }, []);
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <PublicHeader />
      <div className="relative border-b border-gray-200">
        <img src={LIB_IMG} alt="Library" className="w-full h-72 object-cover"/>
        <div className="absolute inset-0 bg-black/40 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-6 md:px-12 lg:px-24 pb-10">
            <div className="overline text-blue-200 mb-3">— Public Archive</div>
            <h1 className="font-display text-4xl lg:text-6xl tracking-tighter font-bold text-white">Published Journals</h1>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-16">
        {papers.length === 0 && (
          <div className="text-center py-20 border border-dashed border-gray-300" data-testid="archive-empty">
            <div className="overline text-gray-500">— No Published Papers Yet</div>
            <p className="text-sm text-gray-500 mt-3">Published papers will appear here once finalized.</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {papers.map((p) => (
            <article key={p.id} data-testid={`archive-paper-${p.id}`} className="border-t border-gray-300 pt-6 hover:border-[#002FA7] transition-base">
              <div className="overline text-[#002FA7] mb-2">— {new Date(p.updated_at).getFullYear()}</div>
              <h2 className="font-display text-2xl lg:text-3xl tracking-tight font-bold">{p.title}</h2>
              <p className="text-sm text-gray-600 mt-2">by {p.author_name}{p.co_authors?.length ? ` · ${p.co_authors.join(", ")}`: ""}</p>
              <p className="text-sm text-gray-700 mt-3 line-clamp-4">{p.abstract}</p>
              {p.keywords?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.keywords.map((k) => <span key={k} className="text-[11px] font-mono uppercase tracking-wider border border-gray-300 px-2 py-0.5">{k}</span>)}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
