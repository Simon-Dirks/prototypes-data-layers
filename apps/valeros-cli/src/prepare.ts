import { defineCommand } from "citty";
import { Preparer } from "./preparer.js";

export const buildArgs = {
  inputfile: {
    type: "string",
    description: "JSON-LD file with data",
  },
  outputfile: {
    type: "string",
    description: "JSON Lines file with data",
  },
} as const;

export default defineCommand({
  meta: {
    name: "prepare",
    description: "Prepare data for ingestion into the search index",
  },
  args: buildArgs,
  async run({ args }) {
    const preparer = new Preparer({
      inputFile: args.inputfile!,
      outputFile: args.outputfile!,
    });
    await preparer.run();
  },
});
