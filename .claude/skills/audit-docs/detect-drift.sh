#!/usr/bin/env bash
# detect-drift.sh — surface stale version pins in andamio-docs public developer surface.
#
# Sources of truth:
#   - GATEWAY_TAG   ← devkit VERSIONS  (~/projects/01-projects/andamio-dev-kit-internal/VERSIONS)
#   - CLI tag       ← latest git tag in andamio-cli (~/projects/01-projects/andamio-cli)
#
# Scope (deliberately narrow):
#   Includes — content/docs/api/guides/**, state-machine/**, getting-started.mdx
#   Excludes — protocol/v2/transactions/**, validators/**, tokens/**
#              (owned by /v2-docs-audit and /transaction-audit skills)
#              plus historical pages (whats-new.mdx, glossary.mdx, pioneers/**)
#
# Allowlist: lines listed in .drift-allowlist (one "file:pattern" per line, # comments OK)
# are skipped. Use for intentional historical version references.
#
# Exit code: 0 always by default. Pass --strict to exit 1 when drift is found.
#
# Usage:
#   ./detect-drift.sh             # informational checklist
#   ./detect-drift.sh --strict    # non-zero exit on drift (for CI)
#   DOCS_REPO=… DEVKIT_REPO=… CLI_REPO=… ./detect-drift.sh   # override paths

set -euo pipefail

# --- Paths --------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_REPO="${DOCS_REPO:-$(cd "$SCRIPT_DIR/../../.." && pwd)}"
DEVKIT_REPO="${DEVKIT_REPO:-$HOME/projects/01-projects/andamio-dev-kit-internal}"
CLI_REPO="${CLI_REPO:-$HOME/projects/01-projects/andamio-cli}"
ALLOWLIST="$SCRIPT_DIR/.drift-allowlist"

STRICT=0
[[ "${1:-}" == "--strict" ]] && STRICT=1

# --- Authoritative versions ---------------------------------------------------

resolve_gateway_tag() {
  local versions="$DEVKIT_REPO/VERSIONS"
  [[ -r "$versions" ]] || { echo ""; return; }
  grep '^GATEWAY_TAG=' "$versions" | cut -d= -f2 | tr -d '[:space:]'
}

resolve_cli_tag() {
  [[ -d "$CLI_REPO/.git" ]] || { echo ""; return; }
  git -C "$CLI_REPO" describe --tags --abbrev=0 2>/dev/null || echo ""
}

GATEWAY_TAG="$(resolve_gateway_tag)"
CLI_TAG="$(resolve_cli_tag)"
CLI_VER="${CLI_TAG#v}"          # 0.12.1
GATEWAY_BASE="${GATEWAY_TAG#v}"  # 2.3.5

# --- Scope --------------------------------------------------------------------

INCLUDE_GLOBS=(
  "$DOCS_REPO/content/docs/api/guides"
  "$DOCS_REPO/content/docs/protocol/v2/state-machine"
  "$DOCS_REPO/content/docs/api/getting-started.mdx"
  "$DOCS_REPO/content/docs/api/reference"
)

EXCLUDE_REGEX='/(transactions|validators|tokens|pioneers)/|/(whats-new|glossary)\.mdx$'

# --- Allowlist ----------------------------------------------------------------

allowed() {
  # $1 = "relative/path:line:match" — return 0 if any allowlist pattern matches
  [[ -r "$ALLOWLIST" ]] || return 1
  local needle="$1"
  while IFS= read -r pat; do
    [[ -z "$pat" || "$pat" =~ ^# ]] && continue
    [[ "$needle" == *"$pat"* ]] && return 0
  done <"$ALLOWLIST"
  return 1
}

# --- Greps --------------------------------------------------------------------

# Returns lines as "relative/path:line:match"
scan() {
  local pattern="$1"
  grep -rEn "$pattern" "${INCLUDE_GLOBS[@]}" 2>/dev/null \
    | sed "s|^$DOCS_REPO/||" \
    | grep -vE "$EXCLUDE_REGEX" || true
}

# --- Findings -----------------------------------------------------------------

declare -a FINDINGS=()
WARNINGS=()

[[ -z "$GATEWAY_TAG" ]] && WARNINGS+=("Could not read GATEWAY_TAG from $DEVKIT_REPO/VERSIONS — gateway drift check skipped.")
[[ -z "$CLI_TAG"     ]] && WARNINGS+=("Could not read CLI tag from $CLI_REPO — CLI drift check skipped.")

# CLI VERSION= pins
if [[ -n "$CLI_VER" ]]; then
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    # Extract the version number from "VERSION=X.Y.Z"
    found_ver="$(echo "$line" | grep -oE 'VERSION=[0-9]+\.[0-9]+\.[0-9]+' | head -1 | cut -d= -f2)"
    [[ "$found_ver" == "$CLI_VER" ]] && continue
    allowed "$line" && continue
    FINDINGS+=("CLI: $line  → expected VERSION=$CLI_VER")
  done < <(scan 'VERSION=[0-9]+\.[0-9]+\.[0-9]+')
fi

# Gateway / API version pins (e.g., "v2.3.5", "v2.1.1-rc12")
if [[ -n "$GATEWAY_BASE" ]]; then
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    found_ver="$(echo "$line" | grep -oE 'v2\.[0-9]+\.[0-9]+(-rc[0-9]+)?' | head -1)"
    [[ "$found_ver" == "$GATEWAY_TAG" ]] && continue
    allowed "$line" && continue
    FINDINGS+=("API: $line  → expected $GATEWAY_TAG")
  done < <(scan 'v2\.[0-9]+\.[0-9]+(-rc[0-9]+)?')
fi

# --- Output -------------------------------------------------------------------

cat <<EOF
# andamio-docs drift report

Authoritative sources:
- Gateway (devkit VERSIONS): ${GATEWAY_TAG:-(unavailable)}
- CLI (latest git tag):      ${CLI_TAG:-(unavailable)}

Scope: developer guides + state-machine + getting-started + reference.
Excluded: transactions/validators/tokens (owned by /v2-docs-audit, /transaction-audit), pioneers/, whats-new.mdx, glossary.mdx.

EOF

if ((${#WARNINGS[@]})); then
  echo "## Warnings"
  for w in "${WARNINGS[@]}"; do echo "- $w"; done
  echo
fi

if ((${#FINDINGS[@]} == 0)); then
  echo "## Findings"
  echo
  echo "No drift detected. ✓"
  exit 0
fi

echo "## Findings (${#FINDINGS[@]})"
echo
for f in "${FINDINGS[@]}"; do
  echo "- [ ] $f"
done

if ((STRICT)); then
  exit 1
fi
exit 0
