#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const fullCommit = /^[0-9a-f]{40}$/i;

/**
 * Reject the release-process error where a tag points at a parent while the
 * nominated repair candidate is a later commit. This is deliberately separate
 * from release-provenance.mjs: it runs before native builders begin.
 */
export function assertTaggedCandidate({ tag, version, tagCommit, expectedCommit }) {
  if (tag !== `v${version}`) {
    throw new Error(`release tag ${tag} does not match package version ${version}`);
  }
  if (!fullCommit.test(expectedCommit)) {
    throw new Error(`expected commit must be a full 40-character SHA, received ${expectedCommit}`);
  }
  if (tagCommit !== expectedCommit) {
    throw new Error(`release tag ${tag} targets ${tagCommit}, expected ${expectedCommit}`);
  }
  return { tag, version, commit: expectedCommit };
}

function main() {
  const [tag, expectedCommit] = process.argv.slice(2);
  if (!tag || !expectedCommit) {
    throw new Error("Usage: node scripts/release-candidate.mjs <tag> <40-character-source-commit>");
  }
  const { version } = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  const tagCommit = execFileSync("git", ["rev-list", "-n", "1", tag], {
    encoding: "utf8",
  }).trim();
  console.log(JSON.stringify(assertTaggedCandidate({ tag, version, tagCommit, expectedCommit })));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
