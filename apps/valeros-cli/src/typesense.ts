import { collection, setDefaultConfiguration } from "typesense-ts";
import { env } from "node:process";

setDefaultConfiguration({
  apiKey: env.TYPESENSE_API_KEY!,
  nodes: [{ url: env.TYPESENSE_HOST! }],
});

const additionalTypeSchema = collection({
  name: "additional_types",
  fields: [
    { name: "type", type: "string" },
    { name: "name", type: "string" },
  ],
});

const contentLocationsSchema = collection({
  name: "content_locations",
  fields: [
    { name: "type", type: "string" },
    { name: "name", type: "string" },
  ],
});

const creatorsSchema = collection({
  name: "creators",
  fields: [
    { name: "type", type: "string" },
    { name: "name", type: "string" },
  ],
});

const datasetsSchema = collection({
  name: "datasets",
  fields: [
    { name: "type", type: "string" },
    { name: "name", type: "string" },
  ],
});

const genresSchema = collection({
  name: "genres",
  fields: [
    { name: "type", type: "string" },
    { name: "name", type: "string" },
  ],
});

const licensesSchema = collection({
  name: "licenses",
  fields: [
    { name: "type", type: "string" },
    { name: "name", type: "string" },
    { name: "is_based_on", type: "string" },
  ],
});

const materialsSchema = collection({
  name: "materials",
  fields: [
    { name: "type", type: "string" },
    { name: "name", type: "string" },
  ],
});

const mediaObjectsSchema = collection({
  name: "media_objects",
  enable_nested_fields: true,
  fields: [
    { name: "type", type: "string[]" },
    { name: "content_url", type: "string" },
    { name: "thumbnail_url", type: "string" },
    { name: "license_id", type: "string" },
    { name: "is_based_on", type: "object", optional: true },
    { name: "is_based_on.id", type: "string" },
    { name: "is_based_on.type", type: "string" },
    { name: "is_based_on.encoding_format", type: "string" },
  ],
});

const publishersSchema = collection({
  name: "publishers",
  fields: [
    { name: "type", type: "string" },
    { name: "name", type: "string" },
  ],
});

// Register the collections globally for type safety
declare module "typesense-ts" {
  interface Collections {
    additionalTypes: typeof additionalTypeSchema.schema;
    contentLocations: typeof contentLocationsSchema.schema;
    creators: typeof creatorsSchema.schema;
    datasets: typeof datasetsSchema.schema;
    genres: typeof genresSchema.schema;
    licenses: typeof licensesSchema.schema;
    materials: typeof materialsSchema.schema;
    mediaObjects: typeof mediaObjectsSchema.schema;
    publishers: typeof publishersSchema.schema;
  }
}

// @ts-expect-error "Type instantiation is excessively deep and possibly infinite."
export const collectionSchemas = [
  additionalTypeSchema,
  contentLocationsSchema,
  creatorsSchema,
  datasetsSchema,
  genresSchema,
  licensesSchema,
  materialsSchema,
  mediaObjectsSchema,
  publishersSchema,
];

export type CollectionSchema = (typeof collectionSchemas)[number];
