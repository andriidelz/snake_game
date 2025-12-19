#!/bin/sh
set -e

echo "Waiting for postgres..."
until pg_isready -h postgres -p 5432 -U snake; do
  sleep 2
done

echo "Running migrations..."
/migrate

echo "Starting server..."
exec /snake-server