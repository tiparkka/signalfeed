import { supabase } from "@/lib/supabase";
import ArticleCard from "@/components/ArticleCard";

export const revalidate = 300;

async function getLatestDigest() {
  const { data } = await supabase
    .from("digests")
    .select("*")
    .order("digest_date", { ascending: false })
    .limit(1)
    .single();
  return data;
}

async function getFeaturedArticles() {
  const { data } = await supabase
    .from("curated_articles")
    .select(`
      id,
      relevance_score,
      tags,
      summary_fi,
      curated_at,
      articles (
        title, url, published_at,
        sources (name)
      )
    `)
    .eq("is_featured", true)
    .not("summary_fi", "is", null)
    .order("relevance_score", { ascending: false })
    .limit(10);
  return data || [];
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-surface rounded-xl p-4 border border-surface-light/30 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand-light">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default async function Home() {
  const [digest, articles] = await Promise.all([
    getLatestDigest(),
    getFeaturedArticles(),
  ]);

  const dateStr = digest?.digest_date
    ? new Date(digest.digest_date).toLocaleDateString("fi-FI", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Ei koostetta";

  const timeStr = digest?.created_at
    ? new Date(digest.created_at).toLocaleTimeString("fi-FI", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const avgScore = articles.length > 0
    ? (articles.reduce((sum: number, a: any) => sum + a.relevance_score, 0) / articles.length).toFixed(1)
    : "0";

  const topTags: Record<string, number> = articles
    .flatMap((a: any) => a.tags || [])
    .reduce((acc: Record<string, number>, tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const trendingTags = Object.entries(topTags)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 6)
    .map(([tag]) => tag);

  return (
    <div>
      {/* Hero section */}
      <section className="mb-10 animate-fade-in-up">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">
              Päivän kooste
            </h1>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="capitalize">{dateStr}</span>
              {timeStr && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Päivitetty klo {timeStr}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {digest?.intro_text && (
          <div className="bg-gradient-to-br from-surface to-surface-dark rounded-2xl p-6 border border-brand/15 animate-pulse-glow">
            <p className="text-slate-200 leading-relaxed text-[15px]">{digest.intro_text}</p>
          </div>
        )}
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 animate-fade-in-up stagger-2">
        <StatCard
          label="Artikkelia"
          value={String(articles.length)}
          icon="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
        />
        <StatCard
          label="Ka. pisteet"
          value={avgScore}
          icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
        <StatCard
          label="Lähteitä"
          value={String(new Set(articles.map((a: any) => a.articles?.sources?.name)).size)}
          icon="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
        <StatCard
          label="Aiheita"
          value={String(Object.keys(topTags).length)}
          icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </section>

      {/* Trending tags */}
      {trendingTags.length > 0 && (
        <section className="mb-8 animate-fade-in-up stagger-3">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Trendit</h3>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <span
                key={tag}
                className="bg-brand/8 text-brand-light text-sm px-3 py-1 rounded-lg border border-brand/15 hover:border-brand/40 hover:bg-brand/15 transition-all cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Articles */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          Top-artikkelit
        </h2>
        <div className="grid gap-4">
          {articles.map((c: any, i: number) => (
            <ArticleCard
              key={c.id}
              title={c.articles.title}
              url={c.articles.url}
              summaryFi={c.summary_fi}
              sourceName={c.articles.sources?.name || "Tuntematon"}
              score={c.relevance_score}
              tags={c.tags || []}
              publishedAt={c.articles.published_at}
              index={i}
            />
          ))}
          {articles.length === 0 && (
            <p className="text-slate-500">
              Ei artikkeleita vielä. Aja ensin pipeline: npm run digest
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
