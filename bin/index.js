#!/usr/bin/env node
const path = require("path");
require("ts-node").register({
  project: path.resolve(__dirname, "..", "tsconfig.json")
});
// run the CLI with the current process arguments
require(path.resolve(__dirname, "..", "src", "cli")).default.run();
