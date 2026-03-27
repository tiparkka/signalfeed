import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "./lib/supabase.js";

const anthropic = new Anthropic();

const BATCH_SIZE = 10;
const MIN_SCORE = 5;

interface CurationResult {
  title: string;
  score: number;
  reasoning: string;
  topics: string[];
}

async function curateArticles() {
  console.log("Haetaan pisteytyksettömät artikkelit...");

  // Hae artikkelit joita ei ole vielä kuratoitu (viimeiset 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, url, content, source_id, sources(name, category)")
    .gte("fetched_at", oneDayAgo)
    .not("id", "in", `(select article_id from curated_articles)`)
    .order("fetched_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Artikkeleiden haku epäonnistui: ${error.message}`);
  }

  if (!articles || articles.length === 0) {
    console.log("Ei uusia artikkeleita pisteytettäväksi.");
    return;
  }

  console.log(`Pisteytetään ${articles.length} artikkelia...`);

  // Käsittele erissä
  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);

    const articleList = batch
      .map(
        (a, idx) =>
          `${idx + 1}. "${a.title}" (${(a as any).sources?.name || "tuntematon"}, ${(a as any).sources?.category || "tech"})\n   ${a.content?.slice(0, 300) || "Ei sisältöä"}`
      )
      .join("\n\n");

    try {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `Olet AI/tech-uutiskuraattori. Pisteytä seuraavat artikkelit asteikolla 1-10 niiden relevanssin mukaan.

Kriteerit:
- AI, koneoppiminen, LLM-kehitys: 8-10
- Merkittävät tech-uutiset (startup-rahoitus, tuotelanseeraukset): 7-9
- Suomen tech-ekosysteemi: +1 bonus
- Yleinen teknologia: 5-7
- Ei-relevantti tai clickbait: 1-4

Artikkelit:
${articleList}

Vastaa JSON-taulukkona. Jokainen elementti:
{
  "title": "artikkelin otsikko",
  "score": numero 1-10,
  "reasoning": "lyhyt perustelu",
  "topics": ["aihe1", "aihe2"]
}

Vastaa VAIN JSON-taulukolla, ei muuta tekstiä.`,
          },
        ],
      });

      const text =
        message.content[0].type === "text" ? message.content[0].text : "";

      let results: CurationResult[];
      try {
        // Poista mahdollinen markdown-koodilohko
        const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        results = JSON.parse(cleaned);
      } catch {
        console.error(`  JSON-parsinta epäonnistui erälle ${i / BATCH_SIZE + 1}`);
        continue;
      }

      // Tallenna tulokset
      for (let j = 0; j < batch.length && j < results.length; j++) {
        const article = batch[j];
        const result = results[j];

        if (!result || typeof result.score !== "number") continue;

        const { error: upsertError } = await supabase
          .from("curated_articles")
          .upsert({
            article_id: article.id,
            relevance_score: Math.min(10, Math.max(1, Math.round(result.score))),
            reasoning: result.reasoning || "",
            topics: result.topics || [],
          }, { onConflict: "article_id" });

        if (upsertError) {
          console.error(`  Tallennus epäonnistui: ${article.title}: ${upsertError.message}`);
        }
      }

      console.log(
        `  Erä ${i / BATCH_SIZE + 1}: ${results.filter((r) => r.score >= MIN_SCORE).length}/${batch.length} relevanttia`
      );
    } catch (err) {
      console.error(`  API-virhe erässä ${i / BATCH_SIZE + 1}: ${(err as Error).message}`);
    }
  }

  // Yhteenveto
  const { count } = await supabase
    .from("curated_articles")
    .select("*", { count: "exact", head: true })
    .gte("relevance_score", MIN_SCORE)
    .gte("curated_at", oneDayAgo);

  console.log(`\nValmis! ${count || 0} relevanttia artikkelia (score >= ${MIN_SCORE}).`);
}

curateArticles().catch(console.error);
