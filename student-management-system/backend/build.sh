#!/usr/bin/env bash
set -o errexit

echo "DB URL SET: $([ -n "$DATABASE_URL" ] && echo yes || echo no)"