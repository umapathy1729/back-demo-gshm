#!/bin/bash
# infrastructure/ecs/deploy.sh
# Registers task definitions and updates ECS services for all microservices.
# Usage: AWS_ACCOUNT_ID=123456789 AWS_REGION=us-east-1 ECS_CLUSTER=mern-cluster bash deploy.sh

set -e

AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:?Set AWS_ACCOUNT_ID}
AWS_REGION=${AWS_REGION:-us-east-1}
ECS_CLUSTER=${ECS_CLUSTER:-mern-cluster}
SERVICES=("api-gateway" "user-service" "product-service" "order-service")
PORTS=(3000 3001 3002 3003)

for i in "${!SERVICES[@]}"; do
  SERVICE="${SERVICES[$i]}"
  PORT="${PORTS[$i]}"

  echo "==> Registering task definition for $SERVICE..."
  TASK_DEF=$(sed \
    -e "s/REPLACE_SERVICE_NAME/$SERVICE/g" \
    -e "s/REPLACE_ACCOUNT_ID/$AWS_ACCOUNT_ID/g" \
    -e "s/REPLACE_REGION/$AWS_REGION/g" \
    task-definition.template.json \
    | jq ".containerDefinitions[0].portMappings[0].containerPort = $PORT")

  aws ecs register-task-definition \
    --cli-input-json "$TASK_DEF" \
    --region "$AWS_REGION" > /dev/null

  TASK_REVISION=$(aws ecs describe-task-definition \
    --task-definition "$SERVICE" --region "$AWS_REGION" \
    | jq -r '.taskDefinition.revision')

  echo "==> Updating ECS service $SERVICE (revision $TASK_REVISION)..."
  aws ecs update-service \
    --cluster "$ECS_CLUSTER" \
    --service "$SERVICE" \
    --task-definition "${SERVICE}:${TASK_REVISION}" \
    --force-new-deployment \
    --region "$AWS_REGION" > /dev/null

  echo "==> $SERVICE updated."
done

echo ""
echo "Waiting for services to stabilize..."
for SERVICE in "${SERVICES[@]}"; do
  aws ecs wait services-stable \
    --cluster "$ECS_CLUSTER" \
    --services "$SERVICE" \
    --region "$AWS_REGION"
  echo "    $SERVICE is stable."
done

echo ""
echo "All ECS services deployed successfully!"
