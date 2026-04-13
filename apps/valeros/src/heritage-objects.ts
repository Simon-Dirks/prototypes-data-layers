import { sValidator } from "@hono/standard-validator";
import { search } from "@repo/typesense/heritage-objects";
import { Hono } from "hono";
import { z } from "zod";
import { Env } from "./env.js";

const app = new Hono<Env>();

const paramsSchema = z.object({
  page: z.coerce.number().min(1).catch(1),
});

// type Params = z.output<typeof paramsSchema>;

const querySchema = z.object({
  size: z.coerce.number().min(1).max(100).catch(10),
  sort: z.string().optional(),
  q: z.string().default("*"), // "All"
  filter: z.union([z.string().transform((value) => [value]), z.array(z.string())]).catch([]),
});

// type Query = z.output<typeof querySchema>;

app.get(
  "/heritage-objects/page/:page",
  sValidator("param", paramsSchema),
  sValidator("query", querySchema),
  async (c) => {
    const params = c.req.valid("param");
    const query = c.req.valid("query");

    const results = await search({
      page: params.page,
      size: query.size,
      q: query.q,
      sort: query.sort,
      filter: query.filter,
    });

    return c.json(results);
  },
);

export default app;
