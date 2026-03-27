import { supabase } from "@/lib/supabase";
import ArticleCard from "@/components/ArticleCard";

export const revalidate = 300; // revalidate every 5 min

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

  return (
    <div>
      <section className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-1">
          Päivän kooste
        </h1>
        <p className="text-sm text-slate-500 mb-5 capitalize">{dateStr}</p>
        {digest?.intro_text && (
          <div className="bg-surface rounded-xl p-6 border border-brand/20">
            <p className="text-slate-200 leading-relaxed">{digest.intro_text}</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">
          Top-artikkelit
        </h2>
        <div className="grid gap-4">
          {articles.map((c: any) => (
            <ArticleCard
              key={c.id}
              title={c.articles.title}
              url={c.articles.url}
              summaryFi={c.summary_fi}
              sourceName={c.articles.sources?.name || "Tuntematon"}
              score={c.relevance_score}
              tags={c.tags || []}
              publishedAt={c.articles.published_at}
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
