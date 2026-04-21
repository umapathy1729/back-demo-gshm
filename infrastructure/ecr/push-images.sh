#!/bin/bash
# infrastructure/ecr/push-images.sh
# Usage: AWS_ACCOUNT_ID=123456789 AWS_REGION=us-east-1 bash push-images.sh

set -e

AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:?Set AWS_ACCOUNT_ID}
AWS_REGION=${AWS_REGION:-us-east-1}
SERVICES=("api-gateway" "user-service" "product-service" "order-service")

echo "==> Logging in to ECR..."
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin \
    "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

for SERVICE in "${SERVICES[@]}"; do
  REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${SERVICE}"

  echo "==> Creating ECR repo for $SERVICE (if not exists)..."
  aws ecr describe-repositories --repository-names "$SERVICE" \
    --region "$AWS_REGION" > /dev/null 2>&1 \
    || aws ecr create-repository --repository-name "$SERVICE" \
         --region "$AWS_REGION" --image-scanning-configuration scanOnPush=true

  echo "==> Building $SERVICE..."
  docker build -t "$SERVICE" "../../services/$SERVICE"

  echo "==> Tagging & pushing $SERVICE..."
  docker tag "$SERVICE:latest" "$REPO:latest"
  docker push "$REPO:latest"

  echo "==> Done: $REPO:latest"
done

echo ""
echo "All images pushed successfully!"
