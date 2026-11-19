#!/bin/bash
set -e

echo "=========================================="
echo " Cleaning Up Docker Containers & Resources "
echo "=========================================="

# Check if docker compose or docker-compose is available
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "Error: docker compose / docker-compose command not found!"
    exit 1
fi

echo "Stopping and removing containers, networks, and orphan resources..."
$COMPOSE_CMD down --remove-orphans

echo "Cleanup completed successfully."
exit 0
