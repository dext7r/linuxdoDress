/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";

// 初始化 Deno KV 数据库
import { initKV } from "./utils/database_kv.ts";

console.log("🚀 Starting server...");

try {
  console.log("📦 Initializing Deno KV database...");
  await initKV();
  console.log("✅ Database initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize database:", error);
  Deno.exit(1);
}

await start(manifest, config);
console.log("🌟 Server started successfully");
