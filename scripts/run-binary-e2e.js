#!/usr/bin/env node
// Copyright (c) 2026 Lark Technologies Pte. Ltd.
// SPDX-License-Identifier: MIT

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const bin = process.env.LARK_CLI_E2E_BIN || "lark-cli";
const appId = requiredEnv("LARK_CLI_CI_APP_ID");
const appSecret = requiredEnv("LARK_CLI_CI_APP_SECRET");
const smokePath = process.env.LARK_CLI_CI_SMOKE_PATH || "/open-apis/im/v1/chats";
const smokeParams = process.env.LARK_CLI_CI_SMOKE_PARAMS || JSON.stringify({ page_size: 1 });

// Follow the CLI's normal config resolution: use an explicit override when CI
// provides one, otherwise fall back to the default ~/.lark-cli directory.
const configDir =
  process.env.LARKSUITE_CLI_CONFIG_DIR || path.join(os.homedir(), ".lark-cli");
const secretFile = path.join(configDir, "app-secret");
const configFile = path.join(configDir, "config.json");

seedMinimalBotConfig();

console.log("==> auth status");
const status = runJSON(["auth", "status"]);
console.log(JSON.stringify(status));

// This workflow only seeds app credentials, so the CLI should resolve to bot
// identity instead of user identity.
if (status.identity !== "bot") {
  fail(`expected bot identity, got ${JSON.stringify(status)}`);
}

console.log(`==> bot smoke: ${smokePath}`);
const smoke = runJSON(["api", "GET", smokePath, "--as", "bot", "--params", smokeParams]);
console.log(JSON.stringify(smoke));

// Treat any non-zero Lark API code as a failed binary-level integration check.
if (smoke.code !== 0) {
  fail(`expected code=0, got ${JSON.stringify(smoke)}`);
}

function seedMinimalBotConfig() {
  fs.mkdirSync(configDir, { recursive: true, mode: 0o700 });
  fs.writeFileSync(secretFile, `${appSecret}\n`, { mode: 0o600 });

  // Keep the generated config intentionally small: app credentials only, no
  // user login state. That keeps this binary E2E focused on bot-mode flows.
  const config = {
    apps: [
      {
        appId,
        appSecret: { source: "file", id: secretFile },
        brand: "feishu",
        lang: "zh",
        users: [],
      },
    ],
  };

  fs.writeFileSync(configFile, JSON.stringify(config, null, 2) + "\n", {
    mode: 0o600,
  });
}

function runJSON(args) {
  let stdout;
  try {
    stdout = execFileSync(bin, args, {
      encoding: "utf8",
      stdio: ["inherit", "pipe", "inherit"],
      env: process.env,
    }).trim();
  } catch (error) {
    fail(`command failed: ${bin} ${args.join(" ")} (${error.message})`);
  }

  try {
    return JSON.parse(stdout);
  } catch (error) {
    fail(`command did not return valid JSON: ${bin} ${args.join(" ")} (${error.message})`);
  }
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    fail(`${name} is required`);
  }
  return value;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
