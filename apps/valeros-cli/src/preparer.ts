import { createReadStream, createWriteStream } from "node:fs";
import { pino } from "pino";
import { chain } from "stream-chain";
import { pick } from "stream-json/filters/pick.js";
import { streamArray } from "stream-json/streamers/stream-array.js";
import { z } from "zod";
import { heritageObjectSchema } from "./definitions.js";
import { EOL } from "node:os";

const constructorInputSchema = z.object({
  inputFile: z.string(),
  outputFile: z.string(),
});

type ConstructorInput = z.input<typeof constructorInputSchema>;

// Prepares data from a JSON-LD file for ingestion into the search index
export class Preparer {
  private readonly logger;
  private readonly inputFile;
  private readonly outputFile;

  constructor(input: ConstructorInput) {
    const opts = constructorInputSchema.parse(input);

    this.logger = pino();
    this.inputFile = opts.inputFile;
    this.outputFile = opts.outputFile;
  }

  async run() {
    const writeStream = createWriteStream(this.outputFile);

    const writeResourceToJsonlFile = (data: any) => {
      const result = heritageObjectSchema.safeParse(data);
      if (!result.success) {
        // this.logger.warn({ record: data }, `Ignoring invalid resource`);
        return;
      }

      const resource = result.data.value;

      // TODO: handle back-pressure
      writeStream.write(JSON.stringify(resource) + EOL);
    };

    await new Promise((resolve, reject) => {
      // Stream the resources in the JSON-LD file
      const stream = createReadStream(this.inputFile);
      const pipeline = chain([stream, pick.withParser({ filter: "@graph" }), streamArray()]);

      pipeline.on("end", resolve);
      pipeline.on("error", reject);
      pipeline.on("data", writeResourceToJsonlFile);
    });

    writeStream.end();
  }
}
