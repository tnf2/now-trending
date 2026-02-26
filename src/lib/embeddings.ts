/**
 * Embedding generation using OpenAI text-embedding-3-small
 * Lazy-initializes OpenAI client to avoid build-time errors
 */

import OpenAI from "openai";
import { getTopicsWithoutEmbeddings, updateEmbeddings } from "./db";

const MODEL = "text-embedding-3-small";
const BATCH_SIZE = 100;

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export async function generateEmbeddings(): Promise<void> {
  const topics = await getTopicsWithoutEmbeddings();

  if (topics.length === 0) {
    console.log("All topics already have embeddings.");
    return;
  }

  console.log(`Generating embeddings for ${topics.length} topics...`);
  const embeddingMap: Record<string, number[]> = {};
  const openai = getOpenAI();

  for (let i = 0; i < topics.length; i += BATCH_SIZE) {
    const batch = topics.slice(i, i + BATCH_SIZE);

    const inputs = batch.map((topic) => {
      const parts = [topic.query];
      if (topic.trendBreakdown?.length > 0) {
        parts.push(`Related: ${topic.trendBreakdown.slice(0, 5).join(", ")}`);
      }
      if (topic.categories?.length > 0) {
        parts.push(
          `Category: ${topic.categories.map((c) => c.name).join(", ")}`
        );
      }
      return parts.join(". ");
    });

    try {
      const response = await openai.embeddings.create({
        model: MODEL,
        input: inputs,
      });

      for (let j = 0; j < batch.length; j++) {
        embeddingMap[batch[j].query] = response.data[j].embedding;
      }

      console.log(
        `  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} embeddings`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(
        `  Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`,
        msg
      );
    }
  }

  await updateEmbeddings(embeddingMap);
  console.log(`Embeddings saved for ${Object.keys(embeddingMap).length} topics.`);
}

export async function embedQuery(query: string): Promise<number[]> {
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: MODEL,
    input: query,
  });
  return response.data[0].embedding;
}
