# AI Fitness Trainer Lambda Deployment Script

import boto3
import zipfile
import os
import json
from pathlib import Path

def create_deployment_package():
    """Create deployment package for Lambda function"""
    
    # Create deployment directory
    deployment_dir = Path("deployment")
    deployment_dir.mkdir(exist_ok=True)
    
    # Copy source code
    source_files = [
        "services/posture_analyzer.py",
        "services/llm_advisor.py",
        "lambda/lambda_handler.py"
    ]
    
    for file_path in source_files:
        if os.path.exists(file_path):
            dest_path = deployment_dir / Path(file_path).name
            with open(file_path, 'r') as src, open(dest_path, 'w') as dst:
                dst.write(src.read())
    
    # Create requirements.txt for Lambda
    lambda_requirements = [
        "opencv-python-headless==4.8.0.76",
        "mediapipe==0.10.0",
        "numpy==1.24.0",
        "pillow==10.0.0",
        "openai==1.0.0",
        "python-dotenv==1.0.0"
    ]
    
    with open(deployment_dir / "requirements.txt", 'w') as f:
        f.write('\n'.join(lambda_requirements))
    
    # Create zip package
    zip_path = deployment_dir / "fitness_trainer_lambda.zip"
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(deployment_dir):
            for file in files:
                if file.endswith('.zip'):
                    continue
                file_path = Path(root) / file
                arc_path = file_path.relative_to(deployment_dir)
                zipf.write(file_path, arc_path)
    
    return zip_path

def deploy_lambda():
    """Deploy Lambda function to AWS"""
    
    # Create deployment package
    zip_path = create_deployment_package()
    
    # Initialize AWS clients
    lambda_client = boto3.client('lambda')
    iam_client = boto3.client('iam')
    
    # Create IAM role for Lambda
    role_name = 'fitness-trainer-lambda-role'
    policy_document = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }
    
    try:
        role_response = iam_client.create_role(
            RoleName=role_name,
            AssumeRolePolicyDocument=json.dumps(policy_document),
            Description='Role for AI Fitness Trainer Lambda function'
        )
        
        # Attach basic execution policy
        iam_client.attach_role_policy(
            RoleName=role_name,
            PolicyArn='arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
        )
        
        role_arn = role_response['Role']['Arn']
        print(f"Created IAM role: {role_arn}")
        
    except iam_client.exceptions.EntityAlreadyExistsException:
        # Role already exists, get its ARN
        role_response = iam_client.get_role(RoleName=role_name)
        role_arn = role_response['Role']['Arn']
        print(f"Using existing IAM role: {role_arn}")
    
    # Wait for role to be ready
    import time
    time.sleep(10)
    
    # Create Lambda function
    function_name = 'ai-fitness-trainer'
    
    try:
        with open(zip_path, 'rb') as zip_file:
            response = lambda_client.create_function(
                FunctionName=function_name,
                Runtime='python3.9',
                Role=role_arn,
                Handler='lambda_handler.lambda_handler',
                Code={'ZipFile': zip_file.read()},
                Description='AI Fitness Trainer with CV and LLM integration',
                Timeout=30,
                MemorySize=3008,
                Environment={
                    'Variables': {
                        'OPENAI_API_KEY': os.getenv('OPENAI_API_KEY', 'your-api-key-here')
                    }
                }
            )
        
        print(f"Created Lambda function: {response['FunctionArn']}")
        
    except lambda_client.exceptions.ResourceConflictException:
        # Function already exists, update it
        with open(zip_path, 'rb') as zip_file:
            response = lambda_client.update_function_code(
                FunctionName=function_name,
                ZipFile=zip_file.read()
            )
        
        print(f"Updated Lambda function: {response['FunctionArn']}")
    
    # Create API Gateway
    api_gateway = boto3.client('apigateway')
    
    try:
        # Create REST API
        api_response = api_gateway.create_rest_api(
            name='ai-fitness-trainer-api',
            description='API for AI Fitness Trainer',
            endpointConfiguration={
                'types': ['REGIONAL']
            }
        )
        
        api_id = api_response['id']
        print(f"Created API Gateway: {api_id}")
        
        # Get root resource
        resources = api_gateway.get_resources(restApiId=api_id)
        root_resource_id = None
        for resource in resources['items']:
            if resource['path'] == '/':
                root_resource_id = resource['id']
                break
        
        # Create resources and methods
        create_api_resources(api_gateway, api_id, root_resource_id, function_name)
        
    except Exception as e:
        print(f"Error creating API Gateway: {e}")
    
    # Clean up
    os.remove(zip_path)
    print("Deployment completed!")

def create_api_resources(api_gateway, api_id, parent_id, function_name):
    """Create API Gateway resources and methods"""
    
    # Create /analyze-posture resource
    posture_resource = api_gateway.create_resource(
        restApiId=api_id,
        parentId=parent_id,
        pathPart='analyze-posture'
    )
    
    # Add POST method
    api_gateway.put_method(
        restApiId=api_id,
        resourceId=posture_resource['id'],
        httpMethod='POST',
        authorizationType='NONE'
    )
    
    # Set up Lambda integration
    api_gateway.put_integration(
        restApiId=api_id,
        resourceId=posture_resource['id'],
        httpMethod='POST',
        type='AWS_PROXY',
        integrationHttpMethod='POST',
        uri=f'arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:{function_name}/invocations'
    )
    
    # Enable CORS
    api_gateway.put_method_response(
        restApiId=api_id,
        resourceId=posture_resource['id'],
        httpMethod='POST',
        statusCode='200',
        responseParameters={
            'method.response.header.Access-Control-Allow-Origin': True
        }
    )
    
    print("Created API Gateway resources")

if __name__ == "__main__":
    deploy_lambda()
