#!/bin/bash
set -e

echo "=========================================="
echo " Running Automated Endpoint Health Checks "
echo "=========================================="

SERVER_URL="${SERVER_URL:-http://localhost:5000/health}"
CLIENT_URL="${CLIENT_URL:-http://localhost:3000}"

MAX_RETRIES=10
RETRY_INTERVAL=3

# 1. Test Backend Server Health Endpoint
echo "Testing Backend Server Endpoint ($SERVER_URL)..."
SERVER_STATUS=0
for i in $(seq 1 $MAX_RETRIES); do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SERVER_URL" || true)
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo " Backend Server is UP and healthy (HTTP 200)"
        SERVER_STATUS=1
        break
    fi
    echo "  Attempt $i/$MAX_RETRIES: Server not ready yet (HTTP $HTTP_CODE). Retrying in ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
done

if [ $SERVER_STATUS -ne 1 ]; then
    echo " Backend Server test FAILED after $MAX_RETRIES attempts."
    exit 1
fi

# 2. Test Frontend Client Endpoint
echo "Testing Frontend Client Endpoint ($CLIENT_URL)..."
CLIENT_STATUS=0
for i in $(seq 1 $MAX_RETRIES); do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$CLIENT_URL" || true)
    if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 304 ]; then
        echo " Frontend Client is UP and accessible (HTTP $HTTP_CODE)"
        CLIENT_STATUS=1
        break
    fi
    echo "  Attempt $i/$MAX_RETRIES: Client not ready yet (HTTP $HTTP_CODE). Retrying in ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
done

if [ $CLIENT_STATUS -ne 1 ]; then
    echo " Frontend Client test FAILED after $MAX_RETRIES attempts."
    exit 1
fi

echo "=========================================="
echo " All Endpoint Tests Passed Successfully! "
echo "=========================================="
exit 0
