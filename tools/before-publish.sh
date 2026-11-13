#!/bin/bash
#
# Bumps the package version and keeps package.json and jsr.json in sync.
#
# Usage:
#   ./tools/before-publish.sh [bump]
#
# where [bump] is the same argument `npm version` accepts: patch (default),
# minor, major, prerelease, an explicit version like 4.0.0, etc.
#
# This script does the following:
#   1. Runs `npm version <bump>`, which updates package.json and creates a
#      commit and a tag for the new version.
#   2. Updates the version in jsr.json to match.
#   3. Amends the jsr.json change into the commit created by npm version.
#   4. Re-creates the tag so it points at the amended commit.
#
# The changes are not pushed.  Review and push with something like:
#   git push origin main --follow-tags

set -euo pipefail

cd "$(dirname "$0")/.."

BUMP="${1:-patch}"

# There must be no modifications to tracked files, staged or unstaged, so that
# the amend only picks up jsr.json.  Untracked files are ok.
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "error: working tree is not clean.  Commit or stash first." >&2
    exit 1
fi

echo "Running npm version $BUMP ..."
# Output is like "v3.0.19"; strip the leading "v".
NEW_VERSION="$(npm version "$BUMP")"
NEW_VERSION="${NEW_VERSION#v}"

# Update jsr.json to match, keeping the existing 2-space JSON formatting.
node -e '
    const fs = require("fs");
    const jsr = JSON.parse(fs.readFileSync("jsr.json", "utf8"));
    jsr.version = process.argv[1];
    fs.writeFileSync("jsr.json", JSON.stringify(jsr, null, 2) + "\n");
' "$NEW_VERSION"

# Verify jsr.json and package.json agree before committing.
JSR_VERSION="$(node -p "require(\"./jsr.json\").version")"
if [ "$JSR_VERSION" != "$NEW_VERSION" ]; then
    echo "error: jsr.json version ($JSR_VERSION) does not match" \
         "package.json version ($NEW_VERSION)." >&2
    exit 1
fi

echo "Amending jsr.json into the version commit ..."
git add jsr.json
git commit --amend --no-edit --quiet

# The tag created by npm version points at the pre-amend commit.  Move it to
# the amended commit, keeping it an annotated tag like npm makes.
git tag -fa "v$NEW_VERSION" -m "$NEW_VERSION"

echo "Done.  Version $NEW_VERSION committed and tagged."
echo "Review, then push with: git push origin main --follow-tags"
