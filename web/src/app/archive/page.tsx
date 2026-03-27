import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const revalidate = 300;

async function getDigests() {
  const { data } = await supabase
    .from("digests")
    .select("*")
    .order("digest_date", { ascending: false })
    .limit(30);
  return data || [];
}

export default async function ArchivePage() {
  const digests = await getDigests();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Arkisto</h1>

      {digests.length === 0 ? (
        <p className="text-slate-500">Ei koostseita vielä.</p>
      ) : (
        <div className="grid gap-3">
          {digests.map((d: any) => {
            const dateStr = new Date(d.digest_date).toLocaleDateString(
              "fi-FI",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            );

            return (
              <Link
                key={d.id}
                href={`/archive/${d.digest_date}`}
                className="bg-surface rounded-xl p-5 border border-surface-light/50 hover:border-brand/40 transition-colors block"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white font-medium capitalize">
                      {dateStr}
                    </h2>
                    {d.intro_text && (
                      <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                        {d.intro_text}
                      </p>
                    )}
                  </div>
                  <span className="text-brand-light text-sm font-medium whitespace-nowrap ml-4">
                    {d.article_count} artikkelia
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
