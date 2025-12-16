#!/usr/bin/env bash
set -eu

export PRECOMMIT=true

set -e
yarn run pretest
# If there are whitespace errors, print the offending file names and fail.
# exec git diff-index --check --cached $against --
