import { chain } from "stream-chain";
import { createReadStream } from "node:fs";
import path from "node:path";
import { glob } from "node:fs/promises";
import { z } from "zod";
import { JsonlItem, jsonlParser } from "stream-json/jsonl/parser.js";
import { batch } from "stream-json/utils/batch.js";
import { CollectionSchema, collectionSchemas } from "./typesense.js";

async function ingestFile(filePath: string, collectionSchema: CollectionSchema) {
  await new Promise((resolve, reject) => {
    const pipeline = chain([
      createReadStream(filePath),
      jsonlParser.asStream(),
      batch({ batchSize: 10 }),
    ]);

    pipeline.on("end", resolve);
    pipeline.on("error", reject);
    pipeline.on("data", async (data) => {
      const documents: JsonlItem["value"][] = [];
      data.forEach((pair: JsonlItem) => {
        documents.push(pair.value);
      });

      // Bulk import
      await collectionSchema.documents.import(documents, {
        return_doc: false,
      });
    });
  });
}

const ingestInputSchema = z.object({
  inputDir: z.string(),
});

type IngestInput = z.input<typeof ingestInputSchema>;

export async function ingest(input: IngestInput) {
  const opts = ingestInputSchema.parse(input);

  const pattern = path.join(opts.inputDir, "**/*.jsonl");

  for await (const file of glob(pattern)) {
    const collectionName = path.parse(file).name;

    const collectionSchema = collectionSchemas.find(
      (schema) => schema.schema.name === collectionName,
    );
    if (collectionSchema === undefined) {
      continue; // Not found
    }

    // Delete the existing collection, if any.
    // Ignore error if the collection does not exist
    try {
      await collectionSchema.delete();
    } catch (err) {
      const error = err as Error;
      if (!error.message.includes(`No collection with name \`${collectionName}\` found`)) {
        throw err;
      }
    }

    await collectionSchema.create();

    await ingestFile(file, collectionSchema);
  }
}
