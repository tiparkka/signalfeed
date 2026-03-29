import { supabase } from "../lib/supabase.js";

const sources = [
  // Suomalaiset tech-mediat
  {
    name: "Tekniikka & Talous",
    url: "https://www.tekniikkatalous.fi",
    feed_url: "https://www.tekniikkatalous.fi/api/feed/v2/rss/tt",
    category: "tech",
    language: "fi",
  },
  {
    name: "Tivi",
    url: "https://www.tivi.fi",
    feed_url: "https://www.tivi.fi/api/feed/v2/rss/tivi",
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
    feed_url: "https://feeds.kauppalehti.fi/rss/main",
    category: "tech",
    language: "fi",
  },
  {
    name: "Yle Uutiset – Tiede ja tekniikka",
    url: "https://yle.fi/uutiset/osasto/tiede",
    feed_url: "https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=YLE_UUTISET&concepts=18-819",
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
    feed_url: "https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_news.xml",
    category: "ai",
    language: "en",
  },
  {
    name: "Hugging Face Papers",
    url: "https://huggingface.co/papers",
    feed_url: "https://huggingface.co/api/daily_papers/rss",
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

  // Lisää kansainvälisiä AI/tech-lähteitä
  {
    name: "arXiv cs.LG",
    url: "https://arxiv.org/list/cs.LG/recent",
    feed_url: "http://arxiv.org/rss/cs.LG",
    category: "ai",
    language: "en",
  },
  {
    name: "arXiv cs.CL",
    url: "https://arxiv.org/list/cs.CL/recent",
    feed_url: "http://arxiv.org/rss/cs.CL",
    category: "ai",
    language: "en",
  },
  {
    name: "Hacker News – Best",
    url: "https://news.ycombinator.com/best",
    feed_url: "https://hnrss.org/best",
    category: "tech",
    language: "en",
  },
  {
    name: "The Register – AI",
    url: "https://www.theregister.com/software/ai_ml/",
    feed_url: "https://www.theregister.com/software/ai_ml/headlines.atom",
    category: "ai",
    language: "en",
  },
  {
    name: "InfoQ – AI/ML",
    url: "https://www.infoq.com/ai-ml-data-eng/",
    feed_url: "https://feed.infoq.com/ai-ml-data-eng/",
    category: "ai",
    language: "en",
  },
  {
    name: "IEEE Spectrum – AI",
    url: "https://spectrum.ieee.org/topic/artificial-intelligence",
    feed_url: "https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss",
    category: "ai",
    language: "en",
  },
  {
    name: "NVIDIA Blog – AI",
    url: "https://blogs.nvidia.com/blog/category/deep-learning/",
    feed_url: "https://blogs.nvidia.com/blog/category/deep-learning/feed/",
    category: "ai",
    language: "en",
  },
  {
    name: "Microsoft Research Blog",
    url: "https://www.microsoft.com/en-us/research/blog/",
    feed_url: "https://www.microsoft.com/en-us/research/feed/",
    category: "ai",
    language: "en",
  },
  {
    name: "Meta AI Blog",
    url: "https://ai.meta.com/blog/",
    feed_url: "https://ai.meta.com/blog/rss/",
    category: "ai",
    language: "en",
  },
  {
    name: "DeepMind Blog",
    url: "https://deepmind.google/discover/blog/",
    feed_url: "https://deepmind.google/blog/rss.xml",
    category: "ai",
    language: "en",
  },
  {
    name: "Towards AI",
    url: "https://towardsai.net",
    feed_url: "https://towardsai.net/feed",
    category: "ai",
    language: "en",
  },
  {
    name: "Last Week in AI",
    url: "https://lastweekin.ai",
    feed_url: "https://lastweekin.ai/feed",
    category: "ai",
    language: "en",
  },
  {
    name: "Lil'Log (Lilian Weng)",
    url: "https://lilianweng.github.io",
    feed_url: "https://lilianweng.github.io/index.xml",
    category: "ai",
    language: "en",
  },
  {
    name: "The Decoder",
    url: "https://the-decoder.com",
    feed_url: "https://the-decoder.com/feed/",
    category: "ai",
    language: "en",
  },
  {
    name: "Synced Review",
    url: "https://syncedreview.com",
    feed_url: "https://syncedreview.com/feed/",
    category: "ai",
    language: "en",
  },

  // Lisää suomalaisia
  {
    name: "Digitoday",
    url: "https://www.digitoday.fi",
    feed_url: "https://www.digitoday.fi/api/feed/v2/rss/dt",
    category: "tech",
    language: "fi",
  },
  {
    name: "Yle Uutiset – Teknologia",
    url: "https://yle.fi/uutiset/osasto/teknologia",
    feed_url: "https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=YLE_UUTISET&concepts=18-35286",
    category: "tech",
    language: "fi",
  },

  // AI deep dive – tutkimus & newsletterit
  {
    name: "Semantic Scholar – AI",
    url: "https://www.semanticscholar.org/search?q=artificial+intelligence&sort=pub-date",
    feed_url: "https://api.semanticscholar.org/graph/v1/paper/search/rss?query=large+language+model&fields=title,url,authors",
    category: "ai",
    language: "en",
  },
  {
    name: "The Neuron",
    url: "https://www.theneurondaily.com",
    feed_url: "https://www.theneurondaily.com/feed",
    category: "ai",
    language: "en",
  },
  {
    name: "Ahead of AI (Sebastian Raschka)",
    url: "https://magazine.sebastianraschka.com",
    feed_url: "https://magazine.sebastianraschka.com/feed",
    category: "ai",
    language: "en",
  },
  {
    name: "AI Breakfast",
    url: "https://aibreakfast.beehiiv.com",
    feed_url: "https://rss.beehiiv.com/feeds/GrzmFEhRm1.xml",
    category: "ai",
    language: "en",
  },
  {
    name: "Latent Space",
    url: "https://www.latent.space",
    feed_url: "https://www.latent.space/feed",
    category: "ai",
    language: "en",
  },

  // AI – Engineering-blogit
  {
    name: "Spotify Engineering",
    url: "https://engineering.atspotify.com",
    feed_url: "https://engineering.atspotify.com/feed/",
    category: "ai",
    language: "en",
  },
  {
    name: "Uber Engineering",
    url: "https://www.uber.com/en-FI/blog/engineering/",
    feed_url: "https://www.uber.com/blog/engineering/rss/",
    category: "ai",
    language: "en",
  },
  {
    name: "LinkedIn Engineering",
    url: "https://engineering.linkedin.com",
    feed_url: "https://engineering.linkedin.com/blog.rss.html",
    category: "ai",
    language: "en",
  },

  // AI – Reddit-yhteisöt
  {
    name: "r/MachineLearning",
    url: "https://www.reddit.com/r/MachineLearning/",
    feed_url: "https://www.reddit.com/r/MachineLearning/hot.rss",
    category: "ai",
    language: "en",
  },
  {
    name: "r/LocalLLaMA",
    url: "https://www.reddit.com/r/LocalLLaMA/",
    feed_url: "https://www.reddit.com/r/LocalLLaMA/hot.rss",
    category: "ai",
    language: "en",
  },

  // AI – Podcastit & videot
  {
    name: "Lex Fridman Podcast",
    url: "https://lexfridman.com/podcast/",
    feed_url: "https://lexfridman.com/feed/podcast/",
    category: "ai",
    language: "en",
  },

  // Urheilu – Suomalaiset
  {
    name: "Yle Urheilu",
    url: "https://yle.fi/urheilu",
    feed_url: "https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=YLE_URHEILU",
    category: "urheilu",
    language: "fi",
  },
  {
    name: "IS Urheilu",
    url: "https://www.is.fi/urheilu",
    feed_url: "https://www.is.fi/rss/urheilu.xml",
    category: "urheilu",
    language: "fi",
  },
  {
    name: "MTV Urheilu",
    url: "https://www.mtvuutiset.fi/urheilu",
    feed_url: "https://www.mtvuutiset.fi/api/feed/v2/rss/urheilu",
    category: "urheilu",
    language: "fi",
  },
  {
    name: "Urheilulehti",
    url: "https://www.urheilulehti.fi",
    feed_url: "https://www.urheilulehti.fi/feed",
    category: "urheilu",
    language: "fi",
  },
  {
    name: "Jatkoaika (jääkiekko)",
    url: "https://www.jatkoaika.com",
    feed_url: "https://www.jatkoaika.com/rss.xml",
    category: "urheilu",
    language: "fi",
  },
  {
    name: "FutisForum2",
    url: "https://futisforum2.org",
    feed_url: "https://futisforum2.org/index.php?action=.xml;type=rss",
    category: "urheilu",
    language: "fi",
  },

  // Urheilu – Kansainväliset
  {
    name: "ESPN",
    url: "https://www.espn.com",
    feed_url: "https://www.espn.com/espn/rss/news",
    category: "urheilu",
    language: "en",
  },
  {
    name: "BBC Sport",
    url: "https://www.bbc.com/sport",
    feed_url: "https://feeds.bbci.co.uk/sport/rss.xml",
    category: "urheilu",
    language: "en",
  },
  {
    name: "The Athletic",
    url: "https://www.nytimes.com/athletic/",
    feed_url: "https://www.nytimes.com/athletic/rss/",
    category: "urheilu",
    language: "en",
  },
  {
    name: "Sky Sports – Football",
    url: "https://www.skysports.com/football",
    feed_url: "https://www.skysports.com/rss/12040",
    category: "urheilu",
    language: "en",
  },
  {
    name: "F1 – Formula 1",
    url: "https://www.formula1.com",
    feed_url: "https://www.formula1.com/content/fom-website/en/latest/all.xml",
    category: "urheilu",
    language: "en",
  },
  {
    name: "NHL News (ESPN)",
    url: "https://www.espn.com/nhl/",
    feed_url: "https://www.espn.com/espn/rss/nhl/news",
    category: "urheilu",
    language: "en",
  },
  {
    name: "The Guardian – Sport",
    url: "https://www.theguardian.com/uk/sport",
    feed_url: "https://www.theguardian.com/uk/sport/rss",
    category: "urheilu",
    language: "en",
  },
];

// Vanhat feed-URL:t jotka pitää poistaa / deaktivoida
const deprecatedFeeds = [
  "https://www.mikrobitti.fi/feed/rss",
  "https://www.helsinkitimes.fi/feed",
  "https://www.kauppalehti.fi/feed/rss/teknologia",
  "https://www.kauppalehti.fi/rss",
  "https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=YLE_TIEDE",
  "https://feeds.yle.fi/uutiset/v1/recent.rss?categories=tiede",
  "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
  "https://www.theverge.com/rss/index.xml",
  "https://www.anthropic.com/rss.xml",
  "https://www.anthropic.com/feed.xml",
  "https://paperswithcode.com/latest/rss",
  "https://huggingface.co/papers/rss",
  "https://www.deeplearning.ai/the-batch/feed/",
  "https://www.semafor.com/feed/tech",
  "https://www.tekniikkatalous.fi/api/feed/v2/rss",
  "https://www.tivi.fi/api/feed/v2/rss",
  "https://www.nhl.com/rss/news.xml",
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
    // Yritä ensin päivittää olemassa oleva (URL:n perusteella)
    const { data: existing } = await supabase
      .from("sources")
      .select("id")
      .eq("url", source.url)
      .limit(1);

    if (existing && existing.length > 0) {
      // Päivitä olemassa oleva ja aktivoi
      await supabase
        .from("sources")
        .update({ ...source, active: true })
        .eq("id", existing[0].id);
    } else {
      // Lisää uusi
      const { error } = await supabase
        .from("sources")
        .insert({ ...source, active: true });

      if (error && error.code === "23505") {
        // Duplikaatti feed_url — päivitä sen kautta
        await supabase
          .from("sources")
          .update({ ...source, active: true })
          .eq("feed_url", source.feed_url);
      } else if (error) {
        console.error(`  Virhe: ${source.name}: ${error.message}`);
      }
    }
  }

  console.log(`Valmis! ${sources.length} lähdettä lisätty/päivitetty.`);
}

seedSources().catch(console.error);
