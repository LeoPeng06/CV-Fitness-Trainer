#!/bin/bash

# AI Fitness Trainer Lambda Deployment Script

echo "🚀 Deploying AI Fitness Trainer to AWS Lambda..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install AWS CLI."
    exit 1
fi

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "❌ SAM CLI is not installed. Please install AWS SAM CLI."
    exit 1
fi

# Check for environment variables
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY environment variable is not set"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Build and deploy with SAM
echo "🏗️  Building SAM application..."
cd backend/lambda
sam build

if [ $? -ne 0 ]; then
    echo "❌ SAM build failed"
    exit 1
fi

echo "🚀 Deploying to AWS..."
sam deploy --guided

if [ $? -ne 0 ]; then
    echo "❌ SAM deployment failed"
    exit 1
fi

echo "✅ Deployment completed!"
echo "🌐 API Gateway URL will be displayed above"
echo "📚 Don't forget to update your frontend API_BASE_URL to the Lambda endpoint"
