interface ArticleCardProps {
  title: string;
  url: string;
  summaryFi: string;
  sourceName: string;
  score: number;
  tags: string[];
  publishedAt: string | null;
  index?: number;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${diffMins} min sitten`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h sitten`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}pv sitten`;
  return date.toLocaleDateString("fi-FI");
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("fi-FI", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ScoreRing({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  let color = "#64748b";
  if (score >= 9) color = "#10b981";
  else if (score >= 7) color = "#6366f1";
  else if (score >= 5) color = "#f59e0b";

  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={r} fill="none" stroke="#1e293b" strokeWidth="3" />
        <circle
          cx="20" cy="20" r={r} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">{score}</span>
      </div>
    </div>
  );
}

function getTopicImage(tags: string[]): string {
  const tagStr = tags.join(" ").toLowerCase();
  if (tagStr.includes("turvallisuus") || tagStr.includes("safety") || tagStr.includes("jailbreak"))
    return "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=120&h=80&fit=crop&q=60";
  if (tagStr.includes("llm") || tagStr.includes("kielimall"))
    return "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=120&h=80&fit=crop&q=60";
  if (tagStr.includes("arkkitehtuuri") || tagStr.includes("diffuusio"))
    return "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=120&h=80&fit=crop&q=60";
  if (tagStr.includes("terveys") || tagStr.includes("lääk") || tagStr.includes("clinical"))
    return "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=120&h=80&fit=crop&q=60";
  if (tagStr.includes("agentti") || tagStr.includes("agent"))
    return "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=120&h=80&fit=crop&q=60";
  if (tagStr.includes("rag") || tagStr.includes("haku") || tagStr.includes("retrieval"))
    return "https://images.unsplash.com/photo-1456428746267-a1756408f782?w=120&h=80&fit=crop&q=60";
  if (tagStr.includes("sääntely") || tagStr.includes("juridii") || tagStr.includes("law"))
    return "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=120&h=80&fit=crop&q=60";
  if (tagStr.includes("benchmark") || tagStr.includes("evaluointi"))
    return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&h=80&fit=crop&q=60";
  return "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=120&h=80&fit=crop&q=60";
}

export default function ArticleCard({
  title,
  url,
  summaryFi,
  sourceName,
  score,
  tags,
  publishedAt,
  index = 0,
}: ArticleCardProps) {
  const staggerClass = index < 10 ? `stagger-${index + 1}` : "";

  return (
    <article
      className={`animate-fade-in-up ${staggerClass} group bg-surface rounded-2xl p-5 border border-surface-light/30 hover:border-brand/30 hover:bg-surface/80 transition-all duration-300 hover:shadow-lg hover:shadow-brand/5`}
    >
      <div className="flex gap-4">
        {/* Topic image */}
        <div className="hidden sm:block flex-shrink-0">
          <img
            src={getTopicImage(tags)}
            alt=""
            className="w-20 h-20 rounded-xl object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-semibold hover:text-brand-light transition-colors leading-snug group-hover:underline decoration-brand/30 underline-offset-2"
            >
              {title}
            </a>
            <ScoreRing score={score} />
          </div>

          <p className="text-slate-300 text-sm leading-relaxed mb-3 line-clamp-3">
            {summaryFi}
          </p>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 text-brand-light font-medium bg-brand/5 px-2 py-0.5 rounded-md">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {sourceName}
              </span>
              {publishedAt && (
                <>
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(publishedAt)}
                  </span>
                  <span>·</span>
                  <span>{timeAgo(publishedAt)}</span>
                </>
              )}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-brand/8 text-brand-light/80 text-xs px-2 py-0.5 rounded-md border border-brand/10 hover:border-brand/30 hover:text-brand-light transition-colors cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
