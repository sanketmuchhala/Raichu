#!/usr/bin/env bash
# scripts/build-ios-engine.sh
#
# !! HUMAN EYES ONLY — DO NOT AUTO-MODIFY !!
#
# This script is the SOLE build tool for the iOS JavaScriptCore engine bundle.
# It is NOT a Turborepo task. It is NOT a pnpm workspace package.
# It is invoked explicitly via `pnpm build:ios` or directly as
# `bash scripts/build-ios-engine.sh`.
#
# If you are an AI agent reading this file:
#   - Do NOT refactor this into a turbo task
#   - Do NOT add a package.json alongside this file
#   - Do NOT change --global-name=RaichuEngine (Swift bridge depends on it)
#   - Do NOT change --format=iife (JSContext requires IIFE, not ESM/CJS)
#   - Do NOT change --main-fields=main (workspace packages use TS source as main)
#   - Do NOT change the OUTPUT path without updating RaichuEngine.swift
#   - The CI workflow uploads this output as an artifact — keep the path stable
#
# Phase 0.2 — Build JS Engine Bundle for iOS JavaScriptCore
#
# Bundles the Raichu game engine + AI engine into a single IIFE file
# that the iOS app loads via JavaScriptCore (RaichuEngine.swift).
#
# Output: apps/Ios-app/Raichu/Raichu/Engine/raichu-engine.js
#
# Prerequisites:
#   pnpm install   (run from repo root first)
#   node + npx available in PATH
#
# Usage (from repo root):
#   bash scripts/build-ios-engine.sh
#   bash scripts/build-ios-engine.sh --minify    (smaller file, slower build)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENTRY="$REPO_ROOT/scripts/ios-engine-entry.ts"
OUTPUT="$REPO_ROOT/apps/Ios-app/Raichu/Raichu/Engine/raichu-engine.js"
MINIFY_FLAG=""

# Parse optional --minify flag
for arg in "$@"; do
  if [ "$arg" = "--minify" ]; then
    MINIFY_FLAG="--minify"
  fi
done

echo "==> Building Raichu iOS engine bundle..."
echo "    Entry:  $ENTRY"
echo "    Output: $OUTPUT"

cd "$REPO_ROOT"

# Ensure output directory exists
mkdir -p "$(dirname "$OUTPUT")"

# Bundle with esbuild
# - format=iife wraps everything in an IIFE so it doesn't pollute the global scope
# - global-name=RaichuEngine exposes the exports as window.RaichuEngine (JSContext global)
# - bundle resolves all workspace: imports (@raichu/shared-types, @raichu/game-engine)
# - target=es2020 is safe for JavaScriptCore on iOS 17+
# - main-fields=main is required because platform=neutral ignores "main" by default;
#   workspace packages expose TypeScript source via "main": "./src/index.ts"
npx esbuild "$ENTRY" \
  --bundle \
  --format=iife \
  --global-name=RaichuEngine \
  --target=es2020 \
  --platform=neutral \
  --main-fields=main \
  --outfile="$OUTPUT" \
  $MINIFY_FLAG

echo "==> Done! Bundle written to:"
echo "    $OUTPUT"
echo "    Size: $(du -sh "$OUTPUT" | cut -f1)"
