#!/bin/sh
set -eu

mkdir -p /app/data


bun run db:generate
bun run db:migrate


bun run db:seed


exec bun index.ts