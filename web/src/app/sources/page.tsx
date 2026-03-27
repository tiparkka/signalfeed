import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

async function getSources() {
  const { data } = await supabase
    .from("sources")
    .select("*")
    .order("language", { ascending: true })
    .order("name", { ascending: true });
  return data || [];
}

export default async function SourcesPage() {
  const sources = await getSources();

  const finnish = sources.filter((s: any) => s.language === "fi");
  const international = sources.filter((s: any) => s.language !== "fi");

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Lahteet</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">
          Suomalaiset ({finnish.length})
        </h2>
        <SourceTable sources={finnish} />
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">
          Kansainvaliset ({international.length})
        </h2>
        <SourceTable sources={international} />
      </section>
    </div>
  );
}

function SourceTable({ sources }: { sources: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-400 border-b border-surface-light">
            <th className="pb-3 font-medium">Nimi</th>
            <th className="pb-3 font-medium">Kategoria</th>
            <th className="pb-3 font-medium">Kieli</th>
            <th className="pb-3 font-medium">Tila</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((s: any) => (
            <tr
              key={s.id}
              className="border-b border-surface-light/30 hover:bg-surface/50"
            >
              <td className="py-3">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-brand-light transition-colors"
                >
                  {s.name}
                </a>
              </td>
              <td className="py-3">
                <span className="bg-brand/10 text-brand-light text-xs px-2 py-0.5 rounded-full">
                  {s.category}
                </span>
              </td>
              <td className="py-3 text-slate-400 uppercase">{s.language}</td>
              <td className="py-3">
                {s.active ? (
                  <span className="text-emerald-400">Aktiivinen</span>
                ) : (
                  <span className="text-slate-500">Pois</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
