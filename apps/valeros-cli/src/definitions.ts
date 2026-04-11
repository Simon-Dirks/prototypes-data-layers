import { z } from "zod";

const heritageObjectJsonLdSchema = z
  .object({
    "@id": z.string(),
    "schema:name": z.preprocess(
      (value) => (Array.isArray(value) ? value : [value]),
      z.array(z.object({ "@value": z.string() }).transform((data) => data["@value"])),
    ),
  })
  .transform((data) => ({
    id: data["@id"],
    name: data["schema:name"]?.join("; "), // Merge into one string
  }));

export const heritageObjectSchema = z.object({
  value: heritageObjectJsonLdSchema,
});
