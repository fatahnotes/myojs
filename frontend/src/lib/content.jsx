import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { applyPalette } from "@/lib/palettes";

const DEFAULTS = {
  theme: "blue-classic",
  branding: {
    conf_short: "SEAIPC 2026",
    conf_full: "9th Southeast Asia International Philanthropy Conference 2026",
    conf_location: "Jakarta / Bogor, Indonesia",
    conf_date: "26 – 27 August 2026",
    conf_theme: "Waqf for the Future: Building Lasting Impact and Economic Resilience in Southeast Asia",
    hero_overline: "— Vol. 09 · Jakarta / Bogor · 26–27 Aug 2026",
    hero_title: "Waqf for the Future.",
    hero_title2: "Building Lasting Impact and Economic Resilience in Southeast Asia.",
    hero_subtitle: "",
    stat_edition: "9th",
    stat_tracks: "39",
    stat_journals: "4",
  },
  flyer: { enabled: false, image_url: "", image_file_id: "", title: "", caption: "", download_url: "" },
  dates: [],
  about: { title: "", body: "", objectives: [], attendees: [], venue_items: [], organizer_body: "", contact_phone: "", contact_email: "" },
  cfp: { title: "Call for Papers", intro: "", sub_themes: [], publications: [] },
  templates: [],
};

const Ctx = createContext({ content: DEFAULTS, loading: true, refresh: () => {}, save: () => {} });

export function ContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/content");
      setContent({ ...DEFAULTS, ...data });
      applyPalette(data?.theme || "blue-classic");
    } catch {
      applyPalette("blue-classic");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (patch) => {
    const { data } = await api.put("/content", patch);
    setContent({ ...DEFAULTS, ...data });
    if (patch.theme) applyPalette(patch.theme);
    return data;
  }, []);

  return (
    <Ctx.Provider value={{ content, loading, refresh: load, save }}>
      {children}
    </Ctx.Provider>
  );
}

export const useContent = () => useContext(Ctx);
