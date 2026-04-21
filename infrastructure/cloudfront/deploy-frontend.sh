#!/bin/bash
# infrastructure/cloudfront/deploy-frontend.sh
# Builds React app and deploys to S3 + invalidates CloudFront cache.
# Usage: S3_BUCKET=my-bucket CF_DISTRIBUTION_ID=EXXX REACT_APP_API_URL=https://api.example.com bash deploy-frontend.sh

set -e

S3_BUCKET=${S3_BUCKET:?Set S3_BUCKET (e.g. my-mern-frontend)}
CF_DISTRIBUTION_ID=${CF_DISTRIBUTION_ID:?Set CF_DISTRIBUTION_ID}
REACT_APP_API_URL=${REACT_APP_API_URL:?Set REACT_APP_API_URL (ALB or custom domain)}
AWS_REGION=${AWS_REGION:-us-east-1}
FRONTEND_DIR="../../frontend"

echo "==> Building React app..."
cd "$FRONTEND_DIR"
REACT_APP_API_URL="$REACT_APP_API_URL" npm run build

echo "==> Syncing to S3 bucket: $S3_BUCKET..."
aws s3 sync build/ "s3://$S3_BUCKET" \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html"

# index.html should not be cached
aws s3 cp build/index.html "s3://$S3_BUCKET/index.html" \
  --cache-control "no-cache,no-store,must-revalidate" \
  --content-type "text/html"

echo "==> Invalidating CloudFront distribution: $CF_DISTRIBUTION_ID..."
aws cloudfront create-invalidation \
  --distribution-id "$CF_DISTRIBUTION_ID" \
  --paths "/*"

echo ""
echo "Frontend deployed successfully!"
echo "CloudFront URL: https://$(aws cloudfront get-distribution \
  --id "$CF_DISTRIBUTION_ID" \
  --query 'Distribution.DomainName' --output text)"
