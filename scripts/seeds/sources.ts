import { supabase } from "../lib/supabase.js";

const sources = [
  // Suomalaiset tech-mediat
  {
    name: "Tekniikka & Talous",
    url: "https://www.tekniikkatalous.fi",
    feed_url: "https://www.tekniikkatalous.fi/api/feed/v2/rss",
    category: "tech",
    language: "fi",
  },
  {
    name: "Tivi",
    url: "https://www.tivi.fi",
    feed_url: "https://www.tivi.fi/api/feed/v2/rss",
    category: "tech",
    language: "fi",
  },
  {
    name: "Mikrobitti",
    url: "https://www.mikrobitti.fi",
    feed_url: "https://www.mikrobitti.fi/api/feed/v2/rss/mb",
    category: "tech",
    language: "fi",
  },
  {
    name: "Muropaketti",
    url: "https://muropaketti.com",
    feed_url: "https://muropaketti.com/feed",
    category: "tech",
    language: "fi",
  },
  {
    name: "Helsinki Times",
    url: "https://www.helsinkitimes.fi",
    feed_url: "https://www.helsinkitimes.fi/index.php?format=feed&type=rss",
    category: "tech",
    language: "fi",
  },
  {
    name: "Kauppalehti",
    url: "https://www.kauppalehti.fi",
    feed_url: "https://www.kauppalehti.fi/rss",
    category: "tech",
    language: "fi",
  },
  {
    name: "Yle Uutiset – Tiede ja tekniikka",
    url: "https://yle.fi/uutiset/osasto/tiede",
    feed_url: "https://feeds.yle.fi/uutiset/v1/recent.rss?categories=tiede",
    category: "tech",
    language: "fi",
  },

  // Kansainväliset AI/tech-mediat
  {
    name: "TechCrunch – AI",
    url: "https://techcrunch.com/category/artificial-intelligence",
    feed_url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    category: "ai",
    language: "en",
  },
  {
    name: "The Verge – AI",
    url: "https://www.theverge.com/ai-artificial-intelligence",
    feed_url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    category: "ai",
    language: "en",
  },
  {
    name: "Ars Technica – AI",
    url: "https://arstechnica.com/ai",
    feed_url: "https://feeds.arstechnica.com/arstechnica/technology-lab",
    category: "ai",
    language: "en",
  },
  {
    name: "MIT Technology Review – AI",
    url: "https://www.technologyreview.com/topic/artificial-intelligence",
    feed_url: "https://www.technologyreview.com/feed/",
    category: "ai",
    language: "en",
  },
  {
    name: "VentureBeat – AI",
    url: "https://venturebeat.com/category/ai",
    feed_url: "https://venturebeat.com/category/ai/feed/",
    category: "ai",
    language: "en",
  },
  {
    name: "Hacker News",
    url: "https://news.ycombinator.com",
    feed_url: "https://hnrss.org/frontpage",
    category: "tech",
    language: "en",
  },
  {
    name: "The Information",
    url: "https://www.theinformation.com",
    feed_url: "https://www.theinformation.com/feed",
    category: "tech",
    language: "en",
  },
  {
    name: "Wired – AI",
    url: "https://www.wired.com/tag/artificial-intelligence",
    feed_url: "https://www.wired.com/feed/tag/ai/latest/rss",
    category: "ai",
    language: "en",
  },
  {
    name: "AI News",
    url: "https://www.artificialintelligence-news.com",
    feed_url: "https://www.artificialintelligence-news.com/feed/",
    category: "ai",
    language: "en",
  },
  {
    name: "OpenAI Blog",
    url: "https://openai.com/blog",
    feed_url: "https://openai.com/blog/rss.xml",
    category: "ai",
    language: "en",
  },
  {
    name: "Google AI Blog",
    url: "https://blog.google/technology/ai",
    feed_url: "https://blog.google/technology/ai/rss/",
    category: "ai",
    language: "en",
  },
  {
    name: "Hugging Face Blog",
    url: "https://huggingface.co/blog",
    feed_url: "https://huggingface.co/blog/feed.xml",
    category: "ai",
    language: "en",
  },
  {
    name: "Anthropic News",
    url: "https://www.anthropic.com/news",
    feed_url: "https://www.anthropic.com/feed.xml",
    category: "ai",
    language: "en",
  },
  {
    name: "Hugging Face Papers",
    url: "https://huggingface.co/papers",
    feed_url: "https://huggingface.co/papers/rss",
    category: "ai",
    language: "en",
  },
  {
    name: "Import AI Newsletter",
    url: "https://importai.substack.com",
    feed_url: "https://importai.substack.com/feed",
    category: "ai",
    language: "en",
  },
  {
    name: "The Batch (deeplearning.ai)",
    url: "https://www.deeplearning.ai/the-batch",
    feed_url: "https://www.deeplearning.ai/the-batch/rss/",
    category: "ai",
    language: "en",
  },
  {
    name: "Stratechery",
    url: "https://stratechery.com",
    feed_url: "https://stratechery.com/feed/",
    category: "tech",
    language: "en",
  },
  {
    name: "Benedict Evans",
    url: "https://www.ben-evans.com",
    feed_url: "https://www.ben-evans.com/benedictevans?format=rss",
    category: "tech",
    language: "en",
  },
  {
    name: "Simon Willison",
    url: "https://simonwillison.net",
    feed_url: "https://simonwillison.net/atom/everything/",
    category: "ai",
    language: "en",
  },
  {
    name: "The Gradient",
    url: "https://thegradient.pub",
    feed_url: "https://thegradient.pub/rss/",
    category: "ai",
    language: "en",
  },
  {
    name: "arXiv cs.AI",
    url: "https://arxiv.org/list/cs.AI/recent",
    feed_url: "http://arxiv.org/rss/cs.AI",
    category: "ai",
    language: "en",
  },
];

// Vanhat feed-URL:t jotka pitää poistaa / deaktivoida
const deprecatedFeeds = [
  "https://www.mikrobitti.fi/feed/rss",
  "https://www.helsinkitimes.fi/feed",
  "https://www.kauppalehti.fi/feed/rss/teknologia",
  "https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=YLE_TIEDE",
  "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
  "https://www.theverge.com/rss/index.xml",
  "https://www.anthropic.com/rss.xml",
  "https://paperswithcode.com/latest/rss",
  "https://www.deeplearning.ai/the-batch/feed/",
  "https://www.semafor.com/feed/tech",
];

async function seedSources() {
  console.log("Päivitetään RSS-lähteet...");

  // Deaktivoi vanhat rikkinäiset feedit
  for (const feedUrl of deprecatedFeeds) {
    await supabase
      .from("sources")
      .update({ active: false })
      .eq("feed_url", feedUrl);
  }
  console.log(`Deaktivoitiin ${deprecatedFeeds.length} vanhaa feediä.`);

  // Lisää/päivitä uudet lähteet
  for (const source of sources) {
    const { error } = await supabase
      .from("sources")
      .upsert(source, { onConflict: "url" });

    if (error) {
      console.error(`  Virhe: ${source.name}: ${error.message}`);
    }
  }

  console.log(`Valmis! ${sources.length} lähdettä lisätty/päivitetty.`);
}

seedSources().catch(console.error);
