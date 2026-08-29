#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const fullCommit = /^[0-9a-f]{40}$/i;

export function assertReleaseProvenance(release, manifest, expectedCommit) {
  if (!fullCommit.test(expectedCommit)) {
    throw new Error(`expected commit must be a full 40-character SHA, received ${expectedCommit}`);
  }
  if (release.target_commitish !== expectedCommit) {
    throw new Error(`release targets ${release.target_commitish}, expected ${expectedCommit}`);
  }
  if (manifest.sourceCommit !== expectedCommit) {
    throw new Error(`release manifest records ${manifest.sourceCommit ?? "no source commit"}, expected ${expectedCommit}`);
  }
  const expectedTag = `v${manifest.version}`;
  if (release.tag_name !== expectedTag) {
    throw new Error(`release tag ${release.tag_name} does not match manifest version ${manifest.version}`);
  }
  return { commit: expectedCommit, tag: release.tag_name, version: manifest.version };
}

export function assertDeploymentProvenance(html, expectedCommit) {
  if (!fullCommit.test(expectedCommit)) {
    throw new Error(`expected commit must be a full 40-character SHA, received ${expectedCommit}`);
  }
  const match = html.match(/<meta\s+name=["']build-commit["']\s+content=["']([0-9a-f]{40})["']\s*\/?\s*>/i);
  const deployedCommit = match?.[1]?.toLowerCase();
  if (!deployedCommit) {
    throw new Error("deployment does not publish a build-commit identity");
  }
  if (deployedCommit !== expectedCommit.toLowerCase()) {
    throw new Error(`deployment records ${deployedCommit}, expected ${expectedCommit}`);
  }
  return { commit: deployedCommit };
}

/**
 * One identity contract for the native artifacts and the deployed site.
 * This prevents a passing site build from masking binaries made from a parent.
 */
export function assertPublishedCandidate({ release, manifest, html, expectedCommit }) {
  const native = assertReleaseProvenance(release, manifest, expectedCommit);
  const deployment = assertDeploymentProvenance(html, expectedCommit);
  return { ...native, deploymentCommit: deployment.commit };
}

async function main() {
  const [expectedCommit, releasePath, manifestPath] = process.argv.slice(2);
  if (!expectedCommit || !releasePath || !manifestPath) {
    throw new Error("Usage: node scripts/release-provenance.mjs <expected-git-sha> <release-json> <manifest-json>");
  }
  const [release, manifest] = await Promise.all([
    readFile(releasePath, "utf8").then(JSON.parse),
    readFile(manifestPath, "utf8").then(JSON.parse)
  ]);
  console.log(JSON.stringify(assertReleaseProvenance(release, manifest, expectedCommit)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
