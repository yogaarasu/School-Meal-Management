#!/usr/bin/env node

const { execSync } = require("node:child_process");

const isLinuxX64 = process.platform === "linux" && process.arch === "x64";

if (!isLinuxX64) {
  process.exit(0);
}

try {
  require.resolve("@rollup/rollup-linux-x64-gnu");
  process.exit(0);
} catch {
  // Missing optional rollup native package on linux, install it explicitly.
}

try {
  execSync("npm install --no-save @rollup/rollup-linux-x64-gnu@4.54.0", {
    stdio: "inherit"
  });
} catch (error) {
  console.error("Failed to install @rollup/rollup-linux-x64-gnu", error);
  process.exit(1);
}
