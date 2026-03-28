import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "./lib/supabase.js";

const anthropic = new Anthropic();

const MIN_SCORE = 6;
const BATCH_SIZE = 15;

async function summarizeArticles() {
  console.log("Haetaan artikkelit joilta puuttuu suomenkielinen tiivistelmä...");

  const { data: curated, error } = await supabase
    .from("curated_articles")
    .select(`
      id,
      relevance_score,
      tags,
      articles (
        id, title, url, content,
        sources (name, category)
      )
    `)
    .gte("relevance_score", MIN_SCORE)
    .is("summary_fi", null)
    .order("relevance_score", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Haku epäonnistui: ${error.message}`);
  }

  if (!curated || curated.length === 0) {
    console.log("Ei artikkeleita tiivistettäväksi.");
    return;
  }

  console.log(`Tiivistetään ${curated.length} artikkelia suomeksi...`);

  let summarized = 0;

  for (let i = 0; i < curated.length; i += BATCH_SIZE) {
    const batch = curated.slice(i, i + BATCH_SIZE);

    const articleTexts = batch
      .map((c, idx) => {
        const a = c.articles as any;
        return `${idx + 1}. "${a.title}" (${a.sources?.name || "tuntematon"})
   Sisältö: ${a.content?.slice(0, 500) || "Ei sisältöä saatavilla"}`;
      })
      .join("\n\n");

    try {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `Kirjoita jokaisesta artikkelista 2-3 lauseen suomenkielinen tiivistelmä. Käytä selkeää, ammattimaista suomea ilman anglismeja kun mahdollista. Mainitse konkreettiset luvut ja nimet jos oleellisia.

Artikkelit:
${articleTexts}

Vastaa JSON-muodossa:
{
  "summaries": [
    {
      "index": 1,
      "summary_fi": "Suomenkielinen tiivistelmä tähän."
    }
  ]
}

Vastaa VAIN JSON-objektilla, ei muuta tekstiä.`,
          },
        ],
      });

      const text =
        message.content[0].type === "text" ? message.content[0].text : "";

      let parsed: { summaries: { index: number; summary_fi: string }[] };
      try {
        const cleaned = text
          .replace(/```json?\n?/g, "")
          .replace(/```/g, "")
          .trim();
        parsed = JSON.parse(cleaned);
      } catch {
        console.error(`  JSON-parsinta epäonnistui erälle ${i / BATCH_SIZE + 1}`);
        continue;
      }

      for (const s of parsed.summaries) {
        const item = batch[s.index - 1];
        if (!item || !s.summary_fi) continue;

        const { error: updateError } = await supabase
          .from("curated_articles")
          .update({ summary_fi: s.summary_fi })
          .eq("id", item.id);

        if (updateError) {
          console.error(`  Päivitys epäonnistui: ${updateError.message}`);
        } else {
          summarized++;
        }
      }

      console.log(`  Erä ${i / BATCH_SIZE + 1}: ${parsed.summaries.length} tiivistelmää`);
    } catch (err) {
      console.error(
        `  API-virhe erässä ${i / BATCH_SIZE + 1}: ${(err as Error).message}`
      );
    }
  }

  console.log(`\nValmis! ${summarized} artikkelia tiivistetty suomeksi.`);
}

summarizeArticles().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
