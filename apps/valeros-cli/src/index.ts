#!/usr/bin/env node
import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "valeros",
    description: "Valeros CLI",
  },
  subCommands: {
    prepare: () => import("./prepare.js").then((r) => r.default),
  },
});

runMain(main);
